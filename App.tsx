
import React, { useState, useEffect } from 'react';
import { Language, CardData } from './types';
import { TRANSLATIONS, SAMPLE_DATA } from './constants';
import Editor from './pages/Editor';
import PublicProfile from './pages/PublicProfile';
import AdminDashboard from './pages/AdminDashboard';
import Home from './pages/Home';
import LanguageToggle from './components/LanguageToggle';
import ShareModal from './components/ShareModal';
import AuthModal from './components/AuthModal';
// Fix: Removed deleteUserAccountAndData which is not exported from firebase.ts
import { auth, getCardBySerial, saveCardToDB, ADMIN_EMAIL, getUserPrimaryCard, getSiteSettings } from './services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Sun, Moon, LayoutDashboard, Eye, Share2, Loader2, ShieldAlert, LogIn, LogOut, Trash2, Home as HomeIcon, SearchX, Plus, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCard, setUserCard] = useState<CardData | null>(null);
  const [publicCard, setPublicCard] = useState<CardData | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'admin' | 'home'>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Site Config
  const [siteConfig, setSiteConfig] = useState({ 
    siteNameAr: 'هويتي الرقمية', 
    siteNameEn: 'My Digital Identity', 
    maintenanceMode: false 
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [adminEditingCard, setAdminEditingCard] = useState<CardData | null>(null);
  const [notFoundSlug, setNotFoundSlug] = useState<string | null>(null);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;
  const isRtl = lang === 'ar';
  const displaySiteName = isRtl ? siteConfig.siteNameAr : siteConfig.siteNameEn;

  useEffect(() => {
    const initializeApp = async () => {
      // 1. Fetch Global Settings
      const settings = await getSiteSettings();
      setSiteConfig(settings as any);

      // 2. Check slugs
      const params = new URLSearchParams(window.location.search);
      const querySlug = params.get('u');
      const pathParts = window.location.pathname.split('/').filter(p => p);
      const pathSlug = pathParts[0];
      const isFile = pathSlug?.includes('.');
      const reserved = ['editor', 'admin', 'preview', 'home', 'settings', 'login', 'signup', 'auth', 'favicon.ico'];
      const slug = querySlug || (isFile ? null : (!reserved.includes(pathSlug?.toLowerCase()) ? pathSlug : null));

      if (slug) {
        try {
          const card = await getCardBySerial(slug);
          if (card) {
            setPublicCard(card as CardData);
            setIsDarkMode(card.isDark);
            setIsInitializing(false);
            return;
          } else {
            setNotFoundSlug(slug);
          }
        } catch (e) {
          setNotFoundSlug(slug);
        }
      }

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            const card = await getUserPrimaryCard(user.uid);
            if (card) {
              setUserCard(card as CardData);
              if (!slug) setIsDarkMode(card.isDark);
            }
            if (activeTab === 'home') setActiveTab('editor');
          } catch (e) {}
        }
        setIsInitializing(false);
      });

      return unsubscribe;
    };

    initializeApp();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-white dark:bg-[#050507]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-black text-xl">هـ</div>
        </div>
        <p className="mt-6 font-black text-gray-400 text-xs uppercase tracking-[0.3em] animate-pulse">
          {displaySiteName}
        </p>
      </div>
    );
  }

  // Maintenance Mode (Allow Admin only)
  if (siteConfig.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#050507] text-center">
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <Settings size={48} />
        </div>
        <h1 className="text-3xl font-black mb-4 dark:text-white">{lang === 'ar' ? 'الموقع تحت الصيانة' : 'Under Maintenance'}</h1>
        <p className="text-gray-500 max-w-sm font-bold">{lang === 'ar' ? 'نحن نقوم ببعض التحديثات، سنعود قريباً جداً. شكراً لصبركم.' : 'We are performing some updates. We will be back very soon. Thank you for your patience.'}</p>
      </div>
    );
  }

  if (publicCard) return <PublicProfile data={publicCard} lang={lang} />;

  if (notFoundSlug) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#050507] text-center">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-6"><SearchX size={48} /></div>
        <h2 className="text-2xl font-black mb-2 dark:text-white">{lang === 'ar' ? 'البطاقة غير موجودة' : 'Card Not Found'}</h2>
        <button onClick={() => { setNotFoundSlug(null); setActiveTab('home'); }} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg">
          {lang === 'ar' ? 'العودة للرئيسية' : 'Back Home'}
        </button>
      </div>
    );
  }

  const handleSave = async (data: CardData) => {
    if (!currentUser) { setShowAuthModal(true); return; }
    setSaveLoading(true);
    try {
      const targetUserId = adminEditingCard ? adminEditingCard.ownerId || currentUser.uid : currentUser.uid;
      await saveCardToDB(targetUserId, data);
      if (!adminEditingCard) { setUserCard(data); setShowShareModal(true); } 
      else { alert(lang === 'ar' ? "تم التحديث" : "Updated"); setAdminEditingCard(null); setActiveTab('admin'); }
    } finally { setSaveLoading(false); }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button onClick={() => { setActiveTab(id); setAdminEditingCard(null); }} className={`flex flex-col items-center justify-center flex-1 py-3 transition-all ${activeTab === id ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-gray-400'}`}>
      <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
      <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0c]' : 'bg-[#f8fafc]'} ${isRtl ? 'rtl' : 'ltr'}`}>
      <aside className={`hidden md:flex w-72 h-screen fixed top-0 bottom-0 z-50 flex-col bg-white dark:bg-[#121215] border-x border-gray-100 dark:border-gray-800 shadow-xl transition-colors ${isRtl ? 'right-0' : 'left-0'}`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">هـ</div>
            <span className="text-xl font-black text-gray-900 dark:text-white truncate">{displaySiteName}</span>
          </div>
          <nav className="space-y-2">
            <button onClick={() => { setActiveTab('home'); setAdminEditingCard(null); }} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'home' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <HomeIcon size={20} /> <span>{lang === 'en' ? 'Home' : 'الرئيسية'}</span>
            </button>
            <button onClick={() => { setActiveTab('editor'); setAdminEditingCard(null); }} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'editor' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <LayoutDashboard size={20} /> <span>{lang === 'en' ? 'My Card' : 'بطاقتي'}</span>
            </button>
            <button onClick={() => setActiveTab('preview')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'preview' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Eye size={20} /> <span>{lang === 'en' ? 'Live View' : 'معاينة'}</span>
            </button>
            {isAdmin && (
              <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'admin' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <ShieldAlert size={20} /> <span>{lang === 'en' ? 'Admin' : 'الإدارة'}</span>
              </button>
            )}
          </nav>
        </div>
        <div className="mt-auto p-8 space-y-4 border-t border-gray-100 dark:border-gray-800">
          {currentUser ? (
             <button onClick={() => signOut(auth).then(() => window.location.reload())} className="w-full py-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-gray-100 dark:border-gray-700">
               <LogOut size={14} /> {lang === 'ar' ? 'تسجيل خروج' : 'Logout'}
             </button>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase shadow-lg flex items-center justify-center gap-2"><LogIn size={18} /> {lang === 'ar' ? 'دخول' : 'Login'}</button>
          )}
          <LanguageToggle currentLang={lang} onToggle={setLang} />
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isRtl ? 'md:mr-72' : 'md:ml-72'} pb-24 md:pb-0`}>
        <div className="max-w-[1440px] mx-auto p-4 md:p-12">
           {activeTab === 'home' && <Home lang={lang} onStart={() => setActiveTab('editor')} />}
           {activeTab === 'editor' && <Editor lang={lang} onSave={handleSave} initialData={adminEditingCard || userCard || undefined} isAdminEdit={!!adminEditingCard} />}
           {activeTab === 'preview' && <div className="flex flex-col items-center"><PublicProfile data={userCard || (SAMPLE_DATA[lang] as CardData)} lang={lang} /></div>}
           {activeTab === 'admin' && isAdmin && <AdminDashboard lang={lang} onEditCard={setAdminEditingCard} />}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 flex px-4 z-[100] h-20">
        <NavItem id="home" icon={HomeIcon} label={lang === 'ar' ? 'الرئيسية' : 'Home'} />
        <NavItem id="editor" icon={LayoutDashboard} label={lang === 'ar' ? 'بطاقتي' : 'Card'} />
        <NavItem id="preview" icon={Eye} label={lang === 'ar' ? 'معاينة' : 'Preview'} />
        {isAdmin && <NavItem id="admin" icon={ShieldAlert} label={lang === 'ar' ? 'إدارة' : 'Admin'} />}
      </nav>

      {saveLoading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] flex flex-col items-center gap-4 shadow-2xl">
              <Loader2 className="animate-spin text-blue-600" size={56} />
              <p className="font-black text-xl dark:text-white">{lang === 'ar' ? 'جاري التنفيذ...' : 'Processing...'}</p>
           </div>
        </div>
      )}

      {showShareModal && userCard && <ShareModal data={userCard} lang={lang} onClose={() => setShowShareModal(false)} />}
      {showAuthModal && <AuthModal lang={lang} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default App;
