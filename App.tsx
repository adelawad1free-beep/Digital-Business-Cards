
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
import { auth, getCardBySerial, saveCardToDB, ADMIN_EMAIL, getUserPrimaryCard, deleteUserAccountAndData } from './services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Sun, Moon, LayoutDashboard, Eye, Share2, Loader2, ShieldAlert, LogIn, LogOut, Trash2, Home as HomeIcon, SearchX, Plus } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCard, setUserCard] = useState<CardData | null>(null);
  const [publicCard, setPublicCard] = useState<CardData | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'admin' | 'home'>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // حالات تحميل دقيقة لمنع الوميض
  const [isInitializing, setIsInitializing] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [adminEditingCard, setAdminEditingCard] = useState<CardData | null>(null);
  const [notFoundSlug, setNotFoundSlug] = useState<string | null>(null);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;
  const isRtl = lang === 'ar';

  const safeResetUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('u');
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      console.warn("History API not accessible", e);
    }
  };

  // وظيفة موحدة للتحقق من الحالة الابتدائية (رابط عام + مصادقة)
  useEffect(() => {
    const initializeApp = async () => {
      // 1. استخراج الرابط من العنوان (query param or path)
      const params = new URLSearchParams(window.location.search);
      const querySlug = params.get('u');
      const pathParts = window.location.pathname.split('/').filter(p => p);
      const pathSlug = pathParts[0];
      const isFile = pathSlug?.includes('.');
      const reserved = ['editor', 'admin', 'preview', 'home', 'settings', 'login', 'signup', 'auth', 'favicon.ico'];
      const slug = querySlug || (isFile ? null : (!reserved.includes(pathSlug?.toLowerCase()) ? pathSlug : null));

      // 2. إذا كان هناك رابط، ابحث عن البطاقة أولاً وقبل كل شيء
      if (slug) {
        try {
          const card = await getCardBySerial(slug);
          if (card) {
            setPublicCard(card as CardData);
            setIsDarkMode(card.isDark);
            setIsInitializing(false);
            return; // توقف هنا، سنعرض الملف الشخصي العام
          } else {
            setNotFoundSlug(slug);
          }
        } catch (e) {
          console.error("Public Card Fetch Error:", e);
          setNotFoundSlug(slug);
        }
      }

      // 3. التحقق من المصادقة إذا لم نكن في وضع "ملف شخصي عام"
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            const card = await getUserPrimaryCard(user.uid);
            if (card) {
              setUserCard(card as CardData);
              // مزامنة المظهر مع البطاقة إذا لم يكن هناك slug عام
              if (!slug) setIsDarkMode(card.isDark);
            }
            if (activeTab === 'home') setActiveTab('editor');
          } catch (e) {
            console.error("User Card Fetch Error:", e);
          }
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

  const handleSave = async (data: CardData) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    setSaveLoading(true);
    try {
      const targetUserId = adminEditingCard ? adminEditingCard.ownerId || currentUser.uid : currentUser.uid;
      await saveCardToDB(targetUserId, data);
      
      if (!adminEditingCard) {
        setUserCard(data);
        setShowShareModal(true);
      } else {
        alert(lang === 'ar' ? "تم تحديث بطاقة المستخدم بنجاح" : "User card updated successfully");
        setAdminEditingCard(null);
        setActiveTab('admin');
      }
    } catch (e) {
      console.error("Save Error:", e);
      alert(lang === 'ar' ? "فشل الحفظ." : "Save failed.");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    const confirmMsg = lang === 'ar' 
      ? "هل أنت متأكد من حذف حسابك وبطاقتك نهائياً؟ لا يمكن التراجع عن هذا الإجراء." 
      : "Are you sure you want to delete your account and card permanently? This action cannot be undone.";
    
    if (window.confirm(confirmMsg)) {
      setSaveLoading(true);
      try {
        await deleteUserAccountAndData(currentUser.uid, userCard?.id);
        window.location.reload();
      } catch (e: any) {
        alert(lang === 'ar' ? "فشل الحذف. يرجى تسجيل الخروج ثم الدخول مجدداً والمحاولة فوراً." : "Delete failed. Please re-login and try again.");
      } finally {
        setSaveLoading(false);
      }
    }
  };

  const handleAdminEdit = (card: CardData) => {
    setAdminEditingCard(card);
    setActiveTab('editor');
  };

  // شاشة تحميل احترافية وموحدة تمنع رؤية أي شيء خلفها
  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-white dark:bg-[#050507]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-black text-xl">
             هـ
          </div>
        </div>
        <p className="mt-6 font-black text-gray-400 text-xs uppercase tracking-[0.3em] animate-pulse">
          {lang === 'ar' ? 'هويتي الرقمية' : 'My Digital ID'}
        </p>
      </div>
    );
  }

  // ترتيب العرض: الملف الشخصي أولاً، ثم خطأ الرابط، ثم لوحة التحكم
  if (publicCard) return <PublicProfile data={publicCard} lang={lang} />;

  if (notFoundSlug) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-[#050507] text-center">
        <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mb-6">
          <SearchX size={48} />
        </div>
        <h2 className="text-2xl font-black mb-2 dark:text-white">
          {lang === 'ar' ? 'البطاقة غير موجودة' : 'Card Not Found'}
        </h2>
        <p className="text-gray-500 mb-8 max-w-sm font-medium">
          {lang === 'ar' 
            ? `عذراً، الرابط "${notFoundSlug}" لا ينتمي لأي بطاقة أعمال في منصتنا.` 
            : `Sorry, the link "${notFoundSlug}" doesn't belong to any card on our platform.`}
        </p>
        <button 
          onClick={() => { setNotFoundSlug(null); safeResetUrl(); setActiveTab('home'); }}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          {lang === 'ar' ? 'أنشئ بطاقتك الآن' : 'Create Your Card Now'}
        </button>
      </div>
    );
  }

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
            <span className="text-xl font-black text-gray-900 dark:text-white">{TRANSLATIONS.appName[lang]}</span>
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
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-black">
                    {currentUser.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">{lang === 'ar' ? 'حساب نشط' : 'Active Account'}</p>
                    <p className="text-[11px] font-bold text-gray-700 dark:text-white truncate">{currentUser.email}</p>
                  </div>
               </div>
               <div className="flex flex-col gap-2">
                 <button onClick={() => signOut(auth).then(() => window.location.reload())} className="w-full py-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase border border-gray-200 dark:border-gray-700 flex items-center justify-center gap-2">
                   <LogOut size={12} /> {lang === 'ar' ? 'خروج' : 'Logout'}
                 </button>
                 <button onClick={handleDeleteAccount} className="w-full py-2 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-red-100 transition-all">
                   <Trash2 size={12} /> {lang === 'ar' ? 'حذف الحساب' : 'Delete'}
                 </button>
               </div>
            </div>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              <LogIn size={18} /> {lang === 'ar' ? 'دخول / حساب جديد' : 'Login / Sign Up'}
            </button>
          )}

          <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <span className="text-xs font-bold">{lang === 'en' ? 'App Theme' : 'مظهر التطبيق'}</span>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <LanguageToggle currentLang={lang} onToggle={setLang} />
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isRtl ? 'md:mr-72' : 'md:ml-72'} pb-24 md:pb-0`}>
        <div className="max-w-[1440px] mx-auto p-4 md:p-12">
           {activeTab === 'home' && (
             <Home lang={lang} onStart={() => setActiveTab('editor')} />
           )}
           {activeTab === 'editor' && (
             <Editor 
               lang={lang} 
               onSave={handleSave} 
               initialData={adminEditingCard || userCard || undefined} 
               key={adminEditingCard?.id || currentUser?.uid || 'guest'} 
               isAdminEdit={!!adminEditingCard}
             />
           )}
           {activeTab === 'preview' && (
             <div className="flex flex-col items-center">
                <PublicProfile data={userCard || (SAMPLE_DATA[lang] as CardData)} lang={lang} />
             </div>
           )}
           {activeTab === 'admin' && isAdmin && (
             <AdminDashboard 
                lang={lang} 
                onEditCard={handleAdminEdit} 
             />
           )}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 flex px-4 z-[100] h-20">
        <NavItem id="home" icon={HomeIcon} label={lang === 'ar' ? 'الرئيسية' : 'Home'} />
        <NavItem id="editor" icon={LayoutDashboard} label={lang === 'ar' ? 'بطاقتي' : 'Card'} />
        <NavItem id="preview" icon={Eye} label={lang === 'ar' ? 'معاينة' : 'Preview'} />
        <button onClick={() => currentUser ? signOut(auth).then(() => window.location.reload()) : setShowAuthModal(true)} className="flex flex-col items-center justify-center flex-1 py-3 text-gray-400">
          {currentUser ? <LogOut size={22} /> : <LogIn size={22} />}
          <span className="text-[10px] font-bold mt-1 uppercase">{currentUser ? (lang === 'ar' ? 'خروج' : 'Exit') : (lang === 'ar' ? 'دخول' : 'Login')}</span>
        </button>
      </nav>

      {saveLoading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] flex flex-col items-center gap-4 shadow-2xl">
              <Loader2 className="animate-spin text-blue-600" size={56} />
              <p className="font-black text-xl dark:text-white">{lang === 'ar' ? 'جاري الحفظ...' : 'Saving...'}</p>
           </div>
        </div>
      )}

      {showShareModal && userCard && <ShareModal data={userCard} lang={lang} onClose={() => setShowShareModal(false)} />}
      {showAuthModal && <AuthModal lang={lang} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default App;
