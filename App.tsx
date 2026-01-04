
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { Language, CardData, CustomTemplate } from './types';
import { TRANSLATIONS, LANGUAGES_CONFIG } from './constants';
import Editor from './pages/Editor';
import PublicProfile from './pages/PublicProfile';
import AdminDashboard from './pages/AdminDashboard';
import UserAccount from './pages/UserAccount';
import Home from './pages/Home';
import MyCards from './pages/MyCards';
import TemplatesGallery from './pages/TemplatesGallery';
import LanguageToggle from './components/LanguageToggle';
import ShareModal from './components/ShareModal';
import AuthModal from './components/AuthModal';
import { auth, getCardBySerial, saveCardToDB, ADMIN_EMAIL, getUserCards, getSiteSettings, deleteUserCard, getAllTemplates } from './services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Sun, Moon, Loader2, Plus, User as UserIcon, LogIn, AlertCircle, Home as HomeIcon, LayoutGrid, CreditCard, Mail, Coffee, Heart, ExternalLink } from 'lucide-react';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  const langParam = params.lang as Language;
  const lang = (Object.keys(LANGUAGES_CONFIG).includes(langParam) ? langParam : (localStorage.getItem('preferred_lang') as Language || 'ar')) as Language;

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCards, setUserCards] = useState<CardData[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [publicCard, setPublicCard] = useState<CardData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingData, setSharingData] = useState<CardData | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  
  const [siteConfig, setSiteConfig] = useState({ 
    siteNameAr: 'هويتي الرقمية', 
    siteNameEn: 'My Digital Identity', 
    siteLogo: '',
    siteIcon: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Cairo',
    analyticsCode: ''
  });
  
  const [isInitializing, setIsInitializing] = useState(true);
  const initFlag = useRef(false);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;
  const isRtl = LANGUAGES_CONFIG[lang]?.dir === 'rtl';
  const displaySiteName = isRtl ? siteConfig.siteNameAr : siteConfig.siteNameEn;

  const t = (key: string) => TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;

  const navigateWithLang = (path: string) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    navigate(`/${lang}${cleanPath}`);
  };

  useEffect(() => {
    const initializeApp = async () => {
      if (initFlag.current) return;
      initFlag.current = true;

      const searchParams = new URLSearchParams(window.location.search);
      const slug = searchParams.get('u')?.trim().toLowerCase();

      const promises: Promise<any>[] = [
        getSiteSettings().catch(() => null),
        getAllTemplates().catch(() => [])
      ];

      if (slug) {
        promises.push(getCardBySerial(slug).catch(() => null));
      }

      const [settings, templates, card] = await Promise.all(promises);

      if (settings) setSiteConfig(prev => ({ ...prev, ...settings }));
      if (templates) setCustomTemplates(templates as CustomTemplate[]);
      
      if (card) {
        setPublicCard(card as CardData);
        setIsDarkMode(card.isDark);
      }

      onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user && !slug) {
          try {
            const cards = await getUserCards(user.uid);
            setUserCards(cards as CardData[]);
          } catch (e) {}
        }
        setIsInitializing(false);
      });
    };

    initializeApp();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if (siteConfig.analyticsCode) {
      const oldScripts = document.querySelectorAll('.custom-analytics-script');
      oldScripts.forEach(el => el.remove());
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${siteConfig.analyticsCode}</div>`, 'text/html');
      const scripts = doc.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        newScript.className = 'custom-analytics-script';
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        if (oldScript.innerHTML) newScript.innerHTML = oldScript.innerHTML;
        document.head.appendChild(newScript);
      });
    }
  }, [siteConfig.analyticsCode]);

  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    root.dir = LANGUAGES_CONFIG[lang]?.dir || 'rtl';
    root.lang = lang;
    localStorage.setItem('preferred_lang', lang);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    root.style.setProperty('--brand-primary', siteConfig.primaryColor);
    root.style.setProperty('--brand-secondary', siteConfig.secondaryColor);
    root.style.setProperty('--site-font', siteConfig.fontFamily);
    if (siteConfig.siteIcon) {
      const favicon = document.getElementById('site-favicon') as HTMLLinkElement;
      if (favicon) favicon.href = siteConfig.siteIcon;
    }
  }, [isDarkMode, lang, siteConfig]);

  const handleEditorSave = async (data: CardData) => {
    try {
      await saveCardToDB({cardData: data});
      const updatedCards = await getUserCards(currentUser!.uid);
      setUserCards(updatedCards as CardData[]);
      setSharingData(data);
      setShowShareModal(true);
    } catch (e) {
      alert(isRtl ? "حدث خطأ أثناء الحفظ" : "Error while saving");
    }
  };

  const handleCloseShare = () => {
    setShowShareModal(false);
    setSharingData(null);
    navigateWithLang('/my-cards');
  };

  if (isInitializing) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#050507] z-[9999]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-900/20 rounded-full"></div>
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
      </div>
      <p className="mt-6 text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] animate-pulse">{t('appName')}</p>
    </div>
  );

  if (publicCard) {
    const customTmpl = customTemplates.find(t => t.id === publicCard.templateId);
    return <PublicProfile data={publicCard} lang={lang} customConfig={customTmpl?.config} siteIcon={siteConfig.siteIcon} />;
  }

  const BottomNav = () => {
    const navItems = [
      { id: 'home', path: '/', icon: HomeIcon, label: t('home') },
      { id: 'templates', path: '/templates', icon: LayoutGrid, label: t('templates') },
      { id: 'add', path: '/templates', icon: Plus, label: '', isAction: true },
      { id: 'my-cards', path: '/my-cards', icon: CreditCard, label: t('myCards'), private: true },
      { id: 'account', path: '/account', icon: UserIcon, label: t('account'), private: true },
    ];

    return (
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-[1000] animate-fade-in-up">
        <div className="bg-white/90 dark:bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-[2.5rem] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex items-center justify-around relative">
          {navItems.map((item) => {
            const isActive = location.pathname.endsWith(`/${lang}${item.path === '/' ? '' : item.path}`) || (item.path === '/' && location.pathname.endsWith(`/${lang}/`));
            if (item.isAction) {
              return (
                <button key={item.id} onClick={() => navigateWithLang(item.path)} className="relative -top-6 w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/40 border-4 border-white dark:border-gray-900 active:scale-90 transition-transform">
                  <Plus size={32} strokeWidth={3} />
                </button>
              );
            }
            if (item.private && !currentUser) {
                return (
                  <button key={item.id} onClick={() => setShowAuthModal(true)} className="flex flex-col items-center gap-1 p-2 text-gray-400">
                    <item.icon size={22} />
                    <span className="text-[10px] font-black">{item.label}</span>
                  </button>
                );
            }
            return (
              <button key={item.id} onClick={() => navigateWithLang(item.path)} className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}`}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-black">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen flex flex-col ${isRtl ? 'rtl' : 'ltr'}`} style={{ fontFamily: 'var(--site-font), sans-serif' }}>
      <header className="sticky top-0 z-[100] w-full bg-white/90 dark:bg-[#0a0a0c]/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateWithLang('/')}>
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs">ID</div>
              <span className="text-lg font-black dark:text-white">{displaySiteName}</span>
            </div>
            <nav className="hidden md:flex items-center gap-2">
              <button onClick={() => navigateWithLang('/')} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${location.pathname.endsWith(`/${lang}`) || location.pathname.endsWith(`/${lang}/`) ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{t('home')}</button>
              <button onClick={() => navigateWithLang('/templates')} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${location.pathname.includes('/templates') ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{t('templates')}</button>
              {currentUser && <button onClick={() => navigateWithLang('/my-cards')} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${location.pathname.includes('/my-cards') ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{t('myCards')}</button>}
              {isAdmin && <button onClick={() => navigateWithLang('/admin')} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase transition-all ${location.pathname.includes('/admin') ? 'text-blue-600' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>{t('admin')}</button>}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle currentLang={lang} />
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm">{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
            {currentUser ? (
              <div className="hidden md:flex items-center gap-2">
                <button onClick={() => navigateWithLang('/account')} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase shadow-sm flex items-center gap-2"><UserIcon size={14} />{t('account')}</button>
                <button onClick={() => signOut(auth)} className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase">{t('logout')}</button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="hidden md:block px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-600/20 active:scale-95 transition-all">{t('login')}</button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <Routes>
          <Route path="/" element={<Home lang={lang} onStart={() => navigateWithLang('/templates')} />} />
          <Route path="/templates" element={<TemplatesGallery lang={lang} onSelect={(id) => { setSelectedTemplateId(id); setEditingCard(null); navigateWithLang('/editor'); }} />} />
          <Route path="/my-cards" element={currentUser ? <MyCards lang={lang} cards={userCards} onAdd={() => navigateWithLang('/templates')} onEdit={(c) => { setEditingCard(c); navigateWithLang('/editor'); }} onDelete={(id, uid) => deleteUserCard(uid, id).then(() => window.location.reload())} /> : <Navigate to={`/${lang}/`} replace />} />
          <Route path="/editor" element={<Editor lang={lang} onSave={handleEditorSave} templates={customTemplates} onCancel={() => navigateWithLang('/')} forcedTemplateId={selectedTemplateId || undefined} initialData={editingCard || undefined} />} />
          <Route path="/account" element={currentUser ? <UserAccount lang={lang} /> : <Navigate to={`/${lang}/`} replace />} />
          <Route path="/admin" element={isAdmin ? <AdminDashboard lang={lang} onEditCard={(c) => { setEditingCard(c); navigateWithLang('/editor'); }} onDeleteRequest={(id, uid) => deleteUserCard(uid, id).then(() => window.location.reload())} /> : <Navigate to={`/${lang}/`} replace />} />
          <Route path="*" element={<Navigate to={`/${lang}/`} replace />} />
        </Routes>
      </main>

      <BottomNav />

      <footer className="w-full bg-white dark:bg-[#0a0a0c] border-t border-gray-100 dark:border-gray-800 py-16 px-6 pb-32 lg:pb-16">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="w-full mb-12 text-center animate-fade-in">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-500 text-[10px] font-black uppercase tracking-widest mb-6 border border-yellow-100 dark:border-yellow-900/20">
                <Heart size={12} className="fill-current" />
                {isRtl ? 'ادعم استمرار المشروع مجاناً' : 'Support our free project'}
             </div>
             <h3 className="text-xl md:text-2xl font-black dark:text-white mb-6 leading-relaxed">{isRtl ? 'تبرع بكوب قهوة ليسر الموقع مجاناً للأبد' : 'Buy Me a Coffee to keep this site free forever'}</h3>
             <a href="https://buymeacoffee.com/guidai" target="_blank" rel="noopener noreferrer" className="group relative inline-flex items-center gap-4 px-10 py-5 bg-[#FFDD00] text-black rounded-[2.5rem] font-black text-lg shadow-2xl shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all overflow-hidden">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <Coffee size={24} className="relative z-10 group-hover:animate-bounce" />
                <span className="relative z-10">{isRtl ? 'تبرع بكوب قهوة' : 'Buy Me a Coffee'}</span>
             </a>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center">
             <div className="flex items-center gap-2 text-sm font-black text-gray-400 dark:text-gray-500 uppercase tracking-tight"><span>{isRtl ? 'كافة الحقوق محفوظة' : 'All Rights Reserved'}</span><span className="text-blue-600">2025</span></div>
             <div className="hidden md:block w-px h-4 bg-gray-200 dark:bg-gray-700"></div>
             <a href="mailto:info@nextid.my" className="group flex items-center gap-2.5 px-5 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-full border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-900 transition-all">
                <Mail size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 group-hover:text-blue-600 transition-colors">info@nextid.my</span>
             </a>
          </div>
        </div>
      </footer>

      {showAuthModal && <AuthModal lang={lang} onClose={() => setShowAuthModal(false)} onSuccess={() => { setShowAuthModal(false); navigateWithLang('/my-cards'); }} />}
      {showShareModal && sharingData && <ShareModal data={sharingData} lang={lang} onClose={handleCloseShare} isNewSave={true} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/:lang/*" element={<AppContent />} />
        <Route path="/" element={<Navigate to="/ar/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
