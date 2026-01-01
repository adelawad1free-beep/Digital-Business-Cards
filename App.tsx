
import React, { useState, useEffect } from 'react';
import { Language, CardData, CustomTemplate } from './types';
import { TRANSLATIONS, SAMPLE_DATA, LANGUAGES_CONFIG } from './constants';
import Editor from './pages/Editor';
import PublicProfile from './pages/PublicProfile';
import AdminDashboard from './pages/AdminDashboard';
import UserAccount from './pages/UserAccount';
import Home from './pages/Home';
import TemplatesGallery from './pages/TemplatesGallery';
import LanguageToggle from './components/LanguageToggle';
import ShareModal from './components/ShareModal';
import AuthModal from './components/AuthModal';
import { auth, getCardBySerial, saveCardToDB, ADMIN_EMAIL, getUserCards, getSiteSettings, deleteUserCard, getAllTemplates } from './services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Sun, Moon, Loader2, Plus, Edit2, Trash2, ExternalLink, User as UserIcon, LogIn, AlertCircle, Home as HomeIcon } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem('preferred_lang');
    if (savedLang && Object.keys(LANGUAGES_CONFIG).includes(savedLang)) return savedLang as Language;
    const browserLang = navigator.language.split('-')[0];
    return Object.keys(LANGUAGES_CONFIG).includes(browserLang) ? (browserLang as Language) : 'ar';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCards, setUserCards] = useState<CardData[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [publicCard, setPublicCard] = useState<CardData | null>(null);
  const [cardNotFoundError, setCardNotFoundError] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'admin' | 'home' | 'manager' | 'account' | 'templates'>('home');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('theme') === 'dark');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string, ownerId: string } | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  const [siteConfig, setSiteConfig] = useState({ 
    siteNameAr: 'هويتي الرقمية', 
    siteNameEn: 'My Digital Identity', 
    siteLogo: '',
    siteIcon: '',
    maintenanceMode: false,
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Cairo'
  });
  
  const [isInitializing, setIsInitializing] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;
  const isRtl = LANGUAGES_CONFIG[lang].dir === 'rtl';
  const displaySiteName = isRtl ? siteConfig.siteNameAr : siteConfig.siteNameEn;

  const t = (key: string, fallback?: string) => {
    if (fallback && !TRANSLATIONS[key]) return fallback;
    if (!TRANSLATIONS[key]) return key;
    return TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'] || key;
  };

  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    root.dir = LANGUAGES_CONFIG[lang].dir;
    root.lang = lang;
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('preferred_lang', lang);

    root.style.setProperty('--brand-primary', siteConfig.primaryColor);
    root.style.setProperty('--brand-secondary', siteConfig.secondaryColor);
    root.style.setProperty('--site-font', siteConfig.fontFamily);
    
    const fontId = 'dynamic-google-font';
    let linkEl = document.getElementById(fontId) as HTMLLinkElement;
    if (!linkEl) {
      linkEl = document.createElement('link');
      linkEl.id = fontId;
      linkEl.rel = 'stylesheet';
      document.head.appendChild(linkEl);
    }
    linkEl.href = `https://fonts.googleapis.com/css2?family=${siteConfig.fontFamily.replace(/\s+/g, '+')}:wght@300;400;700;900&display=swap`;

    const favicon = document.getElementById('site-favicon') as HTMLLinkElement;
    if (favicon && siteConfig.siteIcon) favicon.href = siteConfig.siteIcon;
  }, [isDarkMode, lang, siteConfig]);

  useEffect(() => {
    const bootstrap = async () => {
      const params = new URLSearchParams(window.location.search);
      const slug = params.get('u')?.trim().toLowerCase();

      try {
        const [settings, templates] = await Promise.all([
          getSiteSettings().catch(() => null),
          getAllTemplates().catch(() => [])
        ]);
        if (settings) setSiteConfig(prev => ({ ...prev, ...settings }));
        if (templates) setCustomTemplates(templates as CustomTemplate[]);
      } catch (e) {}

      if (slug) {
        try {
          const card = await getCardBySerial(slug);
          if (card) {
            setPublicCard(card as CardData);
            setIsDarkMode(card.isDark);
            setIsInitializing(false);
            return;
          } else {
            setCardNotFoundError(true);
            setIsInitializing(false);
            return;
          }
        } catch (e) {
          setCardNotFoundError(true);
          setIsInitializing(false);
          return;
        }
      }

      onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            const cards = await getUserCards(user.uid);
            setUserCards(cards as CardData[]);
            if (activeTab === 'home') setActiveTab('manager');
          } catch (e) {}
        }
        setIsInitializing(false);
      });
    };

    bootstrap();
  }, []);

  const handleSave = async (data: CardData, oldId?: string) => {
    if (!auth.currentUser) { setShowAuthModal(true); return; }
    setSaveLoading(true);
    try {
      await saveCardToDB({ cardData: data, oldId });
      const cards = await getUserCards(auth.currentUser.uid);
      setUserCards(cards as CardData[]);
      setEditingCard(data);
      setShowShareModal(true);
      setActiveTab('manager');
    } catch (e) {
      alert(isRtl ? "فشل الحفظ" : "Save failed");
    } finally { setSaveLoading(false); }
  };

  const handleAuthSuccess = (userId: string) => {
    setShowAuthModal(false);
    getUserCards(userId).then(cards => {
      setUserCards(cards as CardData[]);
      setActiveTab('manager');
    });
  };

  if (isInitializing) return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#050507] z-[999]">
      <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
      <div className="flex flex-col items-center gap-2">
        <p className="text-[12px] font-black text-blue-600 uppercase tracking-[0.4em] animate-pulse">{t('هويتي الرقمية', 'NextID Identity')}</p>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest opacity-60">{t('جاري التحقق من الهوية...', 'Verifying Identity...')}</p>
      </div>
    </div>
  );

  if (cardNotFoundError) return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center transition-colors ${isDarkMode ? 'bg-[#050507] text-white' : 'bg-slate-50 text-gray-900'}`}>
      <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl animate-bounce-in">
        <AlertCircle size={48} />
      </div>
      <h1 className="text-3xl font-black mb-4">
        {isRtl ? 'عذراً، البطاقة غير موجودة' : 'Card Not Found'}
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-xs font-bold leading-relaxed mb-12">
        {isRtl 
          ? 'يبدو أن الرابط الذي اتبعته غير صحيح أو أن البطاقة قد تم حذفها بواسطة صاحبها.' 
          : 'The link you followed is incorrect or the card has been deleted by its owner.'}
      </p>
      <button 
        onClick={() => {
          setCardNotFoundError(false);
          setActiveTab('home');
          window.history.replaceState({}, '', window.location.pathname);
        }}
        className="px-12 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
      >
        <HomeIcon size={18} />
        {isRtl ? 'العودة للرئيسية' : 'Back to Home'}
      </button>
    </div>
  );
  
  if (publicCard) {
    const customTmpl = customTemplates.find(t => t.id === publicCard.templateId);
    return <PublicProfile data={publicCard} lang={lang} customConfig={customTmpl?.config} siteIcon={siteConfig.siteIcon} />;
  }

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-300 w-full ${isDarkMode ? 'bg-[#0a0a0c]' : 'bg-[#f8fafc]'} ${isRtl ? 'rtl' : 'ltr'}`}
      style={{ fontFamily: 'var(--site-font), sans-serif' }}
    >
      <header className="sticky top-0 z-[100] w-full bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 bg-[var(--brand-primary)] rounded-2xl flex items-center justify-center text-white font-black shadow-lg overflow-hidden">
                {siteConfig.siteLogo ? <img src={siteConfig.siteLogo} className="w-full h-full object-contain p-1" /> : "ID"}
              </div>
              <span className="text-xl font-black dark:text-white">{displaySiteName}</span>
            </div>
            <nav className="hidden md:flex items-center gap-2">
              <button onClick={() => setActiveTab('home')} className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-100'}`}>{t('home')}</button>
              <button onClick={() => setActiveTab('templates')} className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'templates' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-100'}`}>{t('templates')}</button>
              {currentUser && <button onClick={() => setActiveTab('manager')} className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'manager' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-100'}`}>{t('myCards')}</button>}
              {isAdmin && <button onClick={() => setActiveTab('admin')} className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'admin' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-100'}`}>{t('admin')}</button>}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle currentLang={lang} onToggle={(l) => setLang(l)} />
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 text-gray-400 hover:text-blue-600 bg-gray-50 dark:bg-gray-800/50 rounded-2xl transition-all">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTab('account')} className="hidden sm:flex px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl text-[10px] font-black uppercase items-center gap-2 hover:bg-blue-50 transition-colors"><UserIcon size={14} /> {t('account')}</button>
                <button onClick={() => signOut(auth).then(() => window.location.reload())} className="px-5 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2">{t('logout')}</button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)} 
                className="px-8 py-3 bg-blue-600 text-white rounded-[1.5rem] text-xs font-black uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
              >
                <LogIn size={16} />
                {t('login')}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-12 pb-32 md:pb-12">
        {activeTab === 'home' && <Home lang={lang} onStart={() => setActiveTab('templates')} />}
        {activeTab === 'templates' && <TemplatesGallery lang={lang} onSelect={(id) => { setSelectedTemplateId(id); setEditingCard(null); setActiveTab('editor'); }} />}
        {activeTab === 'manager' && (
          <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up">
            <div className="flex items-center justify-between">
               <h2 className="text-4xl font-black dark:text-white">{t('myCards')}</h2>
               <button onClick={() => setActiveTab('templates')} className="p-5 bg-blue-600 text-white rounded-3xl shadow-2xl hover:scale-110 transition-all"><Plus size={28} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
               {userCards.map((card) => (
                  <div key={card.id} className="bg-white dark:bg-[#121215] p-10 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-xl group hover:shadow-2xl transition-all">
                     <div className="flex items-center gap-6 mb-10">
                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-lg bg-gray-50">
                           {card.profileImage ? <img src={card.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><UserIcon size={40} className="text-gray-300"/></div>}
                        </div>
                        <div className="min-w-0">
                           <p className="font-black text-2xl truncate dark:text-white">{card.name || '---'}</p>
                           <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest">/{card.id}</span>
                        </div>
                     </div>
                     <div className="grid grid-cols-3 gap-4">
                        <button onClick={() => { setEditingCard(card); setSelectedTemplateId(card.templateId); setActiveTab('editor'); }} className="p-5 rounded-[1.8rem] bg-gray-50 dark:bg-gray-800/50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex justify-center"><Edit2 size={22} /></button>
                        <a href={`?u=${card.id}`} target="_blank" className="p-5 rounded-[1.8rem] bg-gray-50 dark:bg-gray-800/50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex justify-center"><ExternalLink size={22} /></a>
                        <button onClick={() => setDeleteConfirmation({ id: card.id, ownerId: card.ownerId || '' })} className="p-5 rounded-[1.8rem] bg-gray-50 dark:bg-gray-800/50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex justify-center"><Trash2 size={22} /></button>
                     </div>
                  </div>
               ))}
               {userCards.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">{t('noCardsYet')}</div>}
            </div>
          </div>
        )}
        {activeTab === 'editor' && (
          <Editor 
            lang={lang} 
            onSave={handleSave} 
            initialData={editingCard || undefined} 
            isAdminEdit={isAdmin} 
            templates={customTemplates} 
            onCancel={() => setActiveTab('manager')}
            forcedTemplateId={selectedTemplateId || undefined}
          />
        )}
        {activeTab === 'admin' && isAdmin && <AdminDashboard lang={lang} onEditCard={(c) => { setEditingCard(c); setSelectedTemplateId(c.templateId); setActiveTab('editor'); }} onDeleteRequest={(id, owner) => setDeleteConfirmation({ id, ownerId: owner })} />}
        {activeTab === 'account' && currentUser && <UserAccount lang={lang} />}
      </main>

      <footer className="w-full pt-16 pb-10 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {isRtl ? 'كافة الحقوق محفوظة 2025' : 'All Rights Reserved 2025'}
              <span className="mx-2 opacity-30">|</span>
              <a href="mailto:info@nextid.my" className="text-blue-600 hover:underline">info@nextid.my</a>
            </div>
            <div className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em]">
              {isRtl ? 'بواسطة هويتي الرقمية' : 'By My Digital Identity'}
            </div>
        </div>
      </footer>

      {showShareModal && editingCard && <ShareModal data={editingCard} lang={lang} onClose={() => setShowShareModal(false)} />}
      {showAuthModal && <AuthModal lang={lang} onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />}
      
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[360px] rounded-[3.5rem] p-10 text-center shadow-2xl animate-fade-in">
            <Trash2 size={48} className="mx-auto text-red-500 mb-6" />
            <h3 className="text-2xl font-black mb-10 dark:text-white">{isRtl ? "تأكيد الحذف" : "Confirm Delete"}</h3>
            <div className="flex flex-col gap-3">
              <button onClick={async () => {
                setSaveLoading(true);
                try {
                  await deleteUserCard(deleteConfirmation.ownerId, deleteConfirmation.id);
                  const cards = await getUserCards(currentUser!.uid);
                  setUserCards(cards as CardData[]);
                  setDeleteConfirmation(null);
                } catch (e) { alert("Error deleting card"); }
                finally { setSaveLoading(false); }
              }} className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase">نعم، احذف</button>
              <button onClick={() => setDeleteConfirmation(null)} className="py-5 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-3xl font-black text-sm uppercase">إلغاء</button>
            </div>
          </div>
        </div>
      )}
      
      {saveLoading && <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl"><Loader2 className="animate-spin text-blue-600 mb-6" size={64} /><p className="text-white font-black uppercase tracking-widest text-sm">{isRtl ? 'جاري المعالجة...' : 'Processing...'}</p></div>}
      
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --brand-primary: ${siteConfig.primaryColor};
          --brand-secondary: ${siteConfig.secondaryColor};
          --site-font: '${siteConfig.fontFamily}';
        }
        .bg-blue-600 { background-color: var(--brand-primary) !important; }
        .text-blue-600 { color: var(--brand-primary) !important; }
        .border-blue-600 { border-color: var(--brand-primary) !important; }
        .hover\\:bg-blue-600:hover { background-color: var(--brand-primary) !important; }
        .hover\\:text-blue-600:hover { color: var(--brand-primary) !important; }
        
        .mesh-1 { background: var(--brand-primary); }
        .mesh-2 { background: var(--brand-secondary); }
        body { font-family: var(--site-font), sans-serif !important; }
      `}} />
    </div>
  );
};

export default App;
