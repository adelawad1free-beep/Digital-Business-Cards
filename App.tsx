
import React, { useState, useEffect } from 'react';
import { Language, CardData } from './types';
import { TRANSLATIONS, SAMPLE_DATA, THEME_COLORS, LANGUAGES_CONFIG } from './constants';
import Editor from './pages/Editor';
import PublicProfile from './pages/PublicProfile';
import AdminDashboard from './pages/AdminDashboard';
import UserAccount from './pages/UserAccount';
import Home from './pages/Home';
import LanguageToggle from './components/LanguageToggle';
import ShareModal from './components/ShareModal';
import AuthModal from './components/AuthModal';
import { generateSerialId } from './utils/share';
import { auth, getCardBySerial, saveCardToDB, ADMIN_EMAIL, getUserCards, getSiteSettings, deleteUserCard } from './services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Sun, Moon, LayoutDashboard, Eye, Share2, Loader2, ShieldAlert, LogIn, LogOut, Trash2, Home as HomeIcon, SearchX, Plus, Settings, CreditCard, ExternalLink, Edit2, AlertTriangle, X, User as UserIcon, ChevronDown, UserCircle, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem('preferred_lang');
    if (Object.keys(LANGUAGES_CONFIG).includes(savedLang as string)) return savedLang as Language;
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    return (Object.keys(LANGUAGES_CONFIG).includes(browserLang)) ? browserLang as Language : 'en';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCards, setUserCards] = useState<CardData[]>([]);
  const [publicCard, setPublicCard] = useState<CardData | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'admin' | 'home' | 'manager' | 'account'>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, ownerId: string } | null>(null);
  
  const [siteConfig, setSiteConfig] = useState({ 
    siteNameAr: 'هويتي الرقمية', 
    siteNameEn: 'My Digital Identity', 
    siteLogo: '',
    siteIcon: '',
    maintenanceMode: false 
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [pendingSaveData, setPendingSaveData] = useState<{data: CardData, oldId?: string} | null>(null);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;
  const isRtl = LANGUAGES_CONFIG[lang].dir === 'rtl';
  const displaySiteName = isRtl ? siteConfig.siteNameAr : siteConfig.siteNameEn;

  const t = (key: string) => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[lang] || entry['en'] || key;
  };

  const handleLanguageToggle = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('preferred_lang', newLang);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    root.dir = LANGUAGES_CONFIG[lang].dir;
    root.lang = lang;
  }, [isDarkMode, lang]);

  const refreshUserCards = async (userId: string) => {
    const cards = await getUserCards(userId);
    setUserCards(cards as CardData[]);
  };

  useEffect(() => {
    const initializeApp = async () => {
      const settings = await getSiteSettings();
      setSiteConfig(settings as any);

      const params = new URLSearchParams(window.location.search);
      const querySlug = params.get('u');
      const pathSlug = window.location.pathname.split('/').filter(p => p)[0];
      const reserved = ['editor', 'admin', 'preview', 'home', 'manager', 'auth', 'account'];
      const slug = querySlug || (!reserved.includes(pathSlug?.toLowerCase()) ? pathSlug : null);

      if (slug) {
        try {
          const card = await getCardBySerial(slug);
          if (card) {
            setPublicCard(card as CardData);
            setIsDarkMode(card.isDark);
            setIsInitializing(false);
            return;
          }
        } catch (e) {}
      }

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) await refreshUserCards(user.uid);
        setIsInitializing(false);
      });
      return unsubscribe;
    };
    initializeApp();
  }, []);

  const handleCreateNew = () => {
    const newCard: CardData = {
      id: generateSerialId(),
      name: '', title: '', company: '', bio: '', email: '', phone: '', whatsapp: '', website: '', location: '', locationUrl: '', profileImage: '',
      themeColor: THEME_COLORS[0], isDark: false, socialLinks: [],
      ownerId: currentUser?.uid || undefined,
      ...(SAMPLE_DATA[lang] || SAMPLE_DATA['en'])
    };
    setEditingCard(null); 
    setTimeout(() => {
      setEditingCard(newCard);
      setActiveTab('editor');
    }, 10);
  };

  const handleEditCard = (card: CardData) => {
    setEditingCard(card);
    setActiveTab('editor');
  };

  const confirmDeleteCard = async () => {
    if (!deleteConfirmation) return;
    setSaveLoading(true);
    try {
      await deleteUserCard(deleteConfirmation.ownerId, deleteConfirmation.id);
      if (currentUser) await refreshUserCards(currentUser.uid);
      setDeleteConfirmation(null);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSave = async (data: CardData, oldId?: string) => {
    if (!auth.currentUser) { 
      setPendingSaveData({ data, oldId });
      setShowAuthModal(true); 
      return; 
    }
    setSaveLoading(true);
    try {
      await saveCardToDB(auth.currentUser.uid, data, oldId);
      await refreshUserCards(auth.currentUser.uid);
      setEditingCard(data);
      setShowShareModal(true);
      setActiveTab('manager');
    } finally {
      setSaveLoading(false);
    }
  };

  if (isInitializing) return <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#050507]"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  if (publicCard) return <PublicProfile data={publicCard} lang={lang} />;

  const NavItemMobile = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button onClick={() => setActiveTab(id)} className={`flex flex-col items-center justify-center flex-1 py-3 transition-all ${activeTab === id ? 'text-blue-600' : 'text-gray-400'}`}>
      <Icon size={22} />
      <span className="text-[10px] font-bold mt-1 uppercase">{label}</span>
    </button>
  );

  const DesktopNavLink = ({ id, label, icon: Icon }: { id: any, label: string, icon?: any }) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all flex items-center gap-2 ${activeTab === id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
    >
      {Icon && <Icon size={16} />}
      {label}
    </button>
  );

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0c]' : 'bg-[#f8fafc]'} ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-[100] w-full bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                {siteConfig.siteLogo ? <img src={siteConfig.siteLogo} className="w-full h-full object-contain p-1" /> : "ID"}
              </div>
              <span className="text-xl font-black dark:text-white tracking-tight">{displaySiteName}</span>
            </div>

            {/* Desktop Main Navigation */}
            <nav className="flex items-center gap-3">
              <DesktopNavLink id="home" label={t('home')} icon={HomeIcon} />
              {currentUser && <DesktopNavLink id="manager" label={t('myCards')} icon={CreditCard} />}
              {isAdmin && <DesktopNavLink id="admin" label={t('admin')} icon={ShieldCheck} />}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <LanguageToggle currentLang={lang} onToggle={handleLanguageToggle} />
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 text-gray-400 hover:text-blue-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl transition-all">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="h-8 w-px bg-gray-100 dark:bg-gray-800 mx-2"></div>
            
            {currentUser ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveTab('account')}
                  className={`p-3 rounded-2xl transition-all ${activeTab === 'account' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <UserCircle size={24} />
                </button>
                <button 
                  onClick={() => signOut(auth).then(() => window.location.reload())} 
                  className="px-5 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                >
                  <LogOut size={16} />
                  {t('logout')}
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="px-8 py-3 bg-blue-600 text-white rounded-[1.5rem] text-xs font-black uppercase shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
                {t('login')}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 transition-all duration-300 pt-6">
        <div className="max-w-[1440px] mx-auto p-4 md:p-12 min-h-[70vh]">
           {activeTab === 'home' && <Home lang={lang} onStart={handleCreateNew} />}
           {activeTab === 'manager' && (
             <div className="space-y-12 animate-fade-in-up">
                <div className="flex items-center justify-between">
                   <h2 className="text-4xl font-black dark:text-white">{t('myCards')}</h2>
                   <button onClick={handleCreateNew} className="p-5 bg-blue-600 text-white rounded-3xl shadow-2xl shadow-blue-500/20 hover:scale-110 active:rotate-90 transition-all"><Plus size={28} /></button>
                </div>
                {userCards.length === 0 ? (
                  <div className="py-20 text-center bg-white dark:bg-[#121215] rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
                    <p className="text-gray-400 font-bold mb-6">{isRtl ? 'لا يوجد لديك بطاقات حالياً' : 'You have no cards yet'}</p>
                    <button onClick={handleCreateNew} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">{t('createBtn')}</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                     {userCards.map((card) => (
                        <div key={card.id} className="bg-white dark:bg-[#121215] p-10 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden group hover:shadow-2xl transition-all">
                           <div className="flex items-center gap-6 mb-10">
                              <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-gray-50 dark:border-gray-800 shadow-lg">
                                 {card.profileImage ? <img src={card.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400"><CreditCard size={40} /></div>}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="font-black text-2xl truncate dark:text-white leading-tight mb-1">{card.name || '---'}</p>
                                 <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full uppercase tracking-widest">/{card.id}</span>
                              </div>
                           </div>
                           <div className="grid grid-cols-3 gap-4">
                              <button onClick={() => handleEditCard(card)} className="p-5 rounded-[1.8rem] bg-gray-50 dark:bg-gray-800/50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit2 size={22} /></button>
                              <a href={`?u=${card.id}`} target="_blank" className="p-5 rounded-[1.8rem] bg-gray-50 dark:bg-gray-800/50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex justify-center"><ExternalLink size={22} /></a>
                              <button onClick={() => setDeleteConfirmation({ id: card.id, ownerId: card.ownerId || '' })} className="p-5 rounded-[1.8rem] bg-gray-50 dark:bg-gray-800/50 text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"><Trash2 size={22} /></button>
                           </div>
                        </div>
                     ))}
                  </div>
                )}
             </div>
           )}
           {activeTab === 'editor' && <Editor lang={lang} onSave={handleSave} initialData={editingCard || undefined} isAdminEdit={isAdmin} />}
           {activeTab === 'admin' && isAdmin && <AdminDashboard lang={lang} onEditCard={handleEditCard} onDeleteRequest={(id, owner) => setDeleteConfirmation({ id, ownerId: owner })} />}
           {activeTab === 'account' && currentUser && <UserAccount lang={lang} />}
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-12 py-12 px-6 border-t border-gray-100 dark:border-gray-800 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center text-gray-500 dark:text-gray-400 text-[10px] font-black italic">ID</div>
            <span className="text-sm font-black dark:text-white opacity-40">{displaySiteName}</span>
          </div>
          <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] leading-loose">
            {isRtl ? 'كافة الحقوق محفوظة 2025 | info@nextid.my' : 'All Rights Reserved 2025 | info@nextid.my'}
          </p>
          <div className="flex gap-6 mt-4 opacity-30 grayscale hover:grayscale-0 transition-all">
             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
             <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
          </div>
        </div>
      </footer>

      <div className="h-20 md:hidden"></div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 flex px-4 z-[200] h-20 rounded-t-[2.5rem] shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
        <NavItemMobile id="home" icon={HomeIcon} label={t('home')} />
        {currentUser && <NavItemMobile id="manager" icon={CreditCard} label={t('myCards')} />}
        {currentUser && <NavItemMobile id="account" icon={UserCircle} label={t('account')} />}
        {isAdmin && <NavItemMobile id="admin" icon={ShieldAlert} label={t('admin')} />}
        {!currentUser && (
          <button onClick={() => setShowAuthModal(true)} className="flex flex-col items-center justify-center flex-1 py-3 text-blue-600 animate-pulse">
            <LogIn size={22} />
            <span className="text-[10px] font-bold mt-1 uppercase">{t('login')}</span>
          </button>
        )}
      </nav>

      {/* Modals & Overlays */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[360px] rounded-[3.5rem] p-10 text-center shadow-2xl animate-fade-in border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
               <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-black mb-3 dark:text-white">{isRtl ? "تأكيد الحذف" : "Confirm Delete"}</h3>
            <p className="text-sm text-gray-400 mb-10 font-bold leading-relaxed">{isRtl ? 'هل أنت متأكد من حذف هذه البطاقة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.' : 'Are you sure you want to permanently delete this card? This action cannot be undone.'}</p>
            <div className="grid grid-cols-1 gap-4">
              <button onClick={confirmDeleteCard} className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase shadow-2xl shadow-red-600/20 hover:bg-red-700 transition-all">{isRtl ? "تأكيد الحذف" : "Yes, Delete"}</button>
              <button onClick={() => setDeleteConfirmation(null)} className="py-5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-3xl font-black text-sm uppercase">{isRtl ? "إلغاء" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}

      {saveLoading && (
        <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl">
           <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
           <p className="text-white font-black uppercase tracking-widest text-sm animate-pulse">{isRtl ? 'جاري المعالجة...' : 'Processing...'}</p>
        </div>
      )}
      {showShareModal && editingCard && <ShareModal data={editingCard} lang={lang} onClose={() => setShowShareModal(false)} />}
      {showAuthModal && <AuthModal lang={lang} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />}
    </div>
  );
};

export default App;
