
// Import React to ensure React.FC and other JSX-related types are available in the global or local namespace.
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
import { generateSerialId } from './utils/share';
import { auth, getCardBySerial, saveCardToDB, ADMIN_EMAIL, getUserCards, getSiteSettings, deleteUserCard, getAllTemplates } from './services/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Sun, Moon, Loader2, Plus, Edit2, Trash2, ExternalLink, User as UserIcon, Mail, Coffee, Heart, Layout, Home as HomeIcon, CreditCard, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const savedLang = localStorage.getItem('preferred_lang');
    if (Object.keys(LANGUAGES_CONFIG).includes(savedLang as string)) return savedLang as Language;
    return 'ar';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userCards, setUserCards] = useState<CardData[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [publicCard, setPublicCard] = useState<CardData | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'admin' | 'home' | 'manager' | 'account' | 'templates'>('home');
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
    if (!TRANSLATIONS[key]) return key;
    return TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'] || key;
  };

  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    root.dir = LANGUAGES_CONFIG[lang].dir;
    root.lang = lang;
    localStorage.setItem('preferred_lang', lang);
  }, [isDarkMode, lang]);

  useEffect(() => {
    const initializeAppData = async () => {
      try {
        const settings = await getSiteSettings();
        if (settings) setSiteConfig(settings as any);
      } catch (e) {
        console.warn("Notice: Could not load site settings.");
      }

      try {
        const templates = await getAllTemplates();
        if (templates && templates.length > 0) {
          setCustomTemplates(templates as CustomTemplate[]);
        }
      } catch (e) {
        console.warn("Notice: Could not load custom templates.");
      }

      const params = new URLSearchParams(window.location.search);
      const slug = params.get('u') || window.location.pathname.split('/').filter(p => p)[0];
      const reserved = ['editor', 'admin', 'preview', 'home', 'manager', 'auth', 'account', 'templates'];
      
      if (slug && !reserved.includes(slug.toLowerCase())) {
        try {
          const card = await getCardBySerial(slug);
          if (card) {
            setPublicCard(card as CardData);
            setIsDarkMode(card.isDark);
            setIsInitializing(false);
            return;
          }
        } catch (e) {
          console.error("Public Profile Error:", e);
        }
      }

      onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          try {
            const cards = await getUserCards(user.uid);
            setUserCards(cards as CardData[]);
          } catch (error: any) {
            if (error.code !== 'permission-denied') {
              console.error("User Cards Fetch Error:", error);
            }
          }
        }
        setIsInitializing(false);
      });
    };
    initializeAppData();
  }, []);

  const handleCreateNew = (templateId: string) => {
    const sample = (SAMPLE_DATA[lang] || SAMPLE_DATA['en']) as CardData;
    const newCard: CardData = {
      ...sample,
      id: generateSerialId(),
      templateId: templateId,
      ownerId: undefined, 
    } as CardData;
    setEditingCard(newCard);
    setActiveTab('editor');
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
      const cards = await getUserCards(auth.currentUser.uid);
      setUserCards(cards as CardData[]);
      setEditingCard(data);
      setShowShareModal(true);
      setActiveTab('manager');
    } catch (error: any) {
      console.error("Save Error:", error);
      if (error.code === 'permission-denied') {
        alert(isRtl ? "خطأ في التصاريح" : "Permission Denied");
      } else {
        alert(isRtl ? "فشل حفظ البطاقة" : "Failed to save card");
      }
    } finally { setSaveLoading(false); }
  };

  const handleAuthSuccess = (userId: string) => {
    setShowAuthModal(false);
    if (pendingSaveData) {
      handleSave(pendingSaveData.data, pendingSaveData.oldId);
      setPendingSaveData(null);
    } else {
      getUserCards(userId).then(cards => setUserCards(cards as CardData[]));
    }
  };

  if (isInitializing) return <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-[#050507]"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
  
  if (publicCard) {
    const customTmpl = customTemplates.find(t => t.id === publicCard.templateId);
    return <PublicProfile data={publicCard} lang={lang} customConfig={customTmpl?.config} />;
  }

  // تحديد ما إذا كان يجب إخفاء المنيو السفلي العام
  const isEditing = activeTab === 'editor';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0c]' : 'bg-[#f8fafc]'} ${isRtl ? 'rtl' : 'ltr'}`}>
      <header className="sticky top-0 z-[100] w-full bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg overflow-hidden">
                {siteConfig.siteLogo ? <img src={siteConfig.siteLogo} className="w-full h-full object-contain p-1" /> : "ID"}
              </div>
              <span className="text-xl font-black dark:text-white">{displaySiteName}</span>
            </div>
            <nav className="hidden md:flex items-center gap-2">
              <button onClick={() => setActiveTab('home')} className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-100'}`}>{t('home')}</button>
              <button onClick={() => setActiveTab('templates')} className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'templates' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-100'}`}>{t('templates')}</button>
              {currentUser && <button onClick={() => setActiveTab('manager')} className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'manager' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-100'}`}>{t('myCards')}</button>}
              {isAdmin && <button onClick={() => setActiveTab('admin')} className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase transition-all ${activeTab === 'admin' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 hover:bg-gray-100'}`}>{t('admin')}</button>}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <LanguageToggle currentLang={lang} onToggle={(l) => setLang(l)} />
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-3 text-gray-400 hover:text-blue-500 bg-gray-50 dark:bg-gray-800/50 rounded-2xl transition-all">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            {currentUser ? (
              <button onClick={() => signOut(auth).then(() => window.location.reload())} className="px-5 py-3 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2">{t('logout')}</button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="px-8 py-3 bg-blue-600 text-white rounded-[1.5rem] text-xs font-black uppercase shadow-xl">{t('login')}</button>
            )}
          </div>
        </div>
      </header>

      <main className={`flex-1 p-4 md:p-12 ${isEditing ? 'pb-32' : 'pb-32'} md:pb-12`}>
        {activeTab === 'home' && <Home lang={lang} onStart={() => setActiveTab('templates')} />}
        {activeTab === 'templates' && <TemplatesGallery lang={lang} onSelect={handleCreateNew} />}
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
                          <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-gray-50 shadow-lg">
                             {card.profileImage ? <img src={card.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-100 flex items-center justify-center"><UserIcon size={40} className="text-gray-300"/></div>}
                          </div>
                          <div className="min-w-0">
                             <p className="font-black text-2xl truncate dark:text-white">{card.name || '---'}</p>
                             <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest">/{card.id}</span>
                          </div>
                       </div>
                       <div className="grid grid-cols-3 gap-4">
                          <button onClick={() => { setEditingCard(card); setActiveTab('editor'); }} className="p-5 rounded-[1.8rem] bg-gray-50 dark:bg-gray-800/50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"><Edit2 size={22} /></button>
                          <a href={`?u=${card.id}`} target="_blank" className="p-5 rounded-[1.8rem] bg-gray-50 dark:bg-gray-800/50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex justify-center"><ExternalLink size={22} /></a>
                          <button onClick={() => setDeleteConfirmation({ id: card.id, ownerId: card.ownerId || '' })} className="p-5 rounded-[1.8rem] bg-gray-50 dark:bg-gray-800/50 text-red-600 hover:bg-red-600 hover:text-white transition-all"><Trash2 size={22} /></button>
                       </div>
                    </div>
                 ))}
                 {userCards.length === 0 && <div className="col-span-full py-20 text-center text-gray-400 font-bold">{t('noCardsYet')}</div>}
              </div>
           </div>
        )}
        {activeTab === 'editor' && <Editor lang={lang} onSave={handleSave} initialData={editingCard || undefined} isAdminEdit={isAdmin} templates={customTemplates} onCancel={() => setActiveTab('manager')} />}
        {activeTab === 'admin' && isAdmin && <AdminDashboard lang={lang} onEditCard={(c) => { setEditingCard(c); setActiveTab('editor'); }} onDeleteRequest={(id, owner) => setDeleteConfirmation({ id, ownerId: owner })} />}
        {activeTab === 'account' && currentUser && <UserAccount lang={lang} />}
      </main>

      {/* شريط التنقل السفلي للجوال - يختفي عند التحرير */}
      {!isEditing && (
        <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] z-[150] animate-fade-in-up">
          <div className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-[2.5rem] p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] flex items-center justify-around">
            <button 
              onClick={() => setActiveTab('home')} 
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${activeTab === 'home' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
            >
              <HomeIcon size={20} />
              <span className="text-[8px] font-black uppercase">{t('home')}</span>
            </button>
            <button 
              onClick={() => setActiveTab('templates')} 
              className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${activeTab === 'templates' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
            >
              <Layout size={20} />
              <span className="text-[8px] font-black uppercase">{t('templates')}</span>
            </button>
            {currentUser && (
              <button 
                onClick={() => setActiveTab('manager')} 
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${activeTab === 'manager' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
              >
                <CreditCard size={20} />
                <span className="text-[8px] font-black uppercase">{t('myCards')}</span>
              </button>
            )}
            {isAdmin && (
              <button 
                onClick={() => setActiveTab('admin')} 
                className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all ${activeTab === 'admin' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
              >
                <ShieldCheck size={20} />
                <span className="text-[8px] font-black uppercase">{t('admin')}</span>
              </button>
            )}
          </div>
        </nav>
      )}

      <footer className="w-full pt-16 pb-10 mt-12 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8 text-center">
          
          <div className="bg-amber-50/50 dark:bg-amber-900/10 p-8 rounded-[3rem] border border-amber-100 dark:border-amber-900/20 max-w-xl w-full flex flex-col sm:flex-row items-center justify-between gap-6 group transition-all hover:shadow-xl">
             <div className="flex items-center gap-4 text-start">
                <div className="w-14 h-14 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                   < Coffee size={28} />
                </div>
                <div>
                   <h4 className="font-black dark:text-white">{t('buyMeCoffee')}</h4>
                   <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{t('supportProject')}</p>
                </div>
             </div>
             <a 
               href="https://buymeacoffee.com/guidai" 
               target="_blank" 
               rel="noopener noreferrer"
               className="px-8 py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
             >
                <Heart size={16} fill="white" />
                {t('buyMeCoffee')}
             </a>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              {isRtl ? 'كافة الحقوق محفوظة 2025' : 'All Rights Reserved 2025'}
              <span className="mx-2 opacity-30">|</span>
              <a href="mailto:info@nextid.my" className="flex items-center gap-1.5 text-blue-600 dark:text-blue-500 hover:underline">
                <Mail size={12} />
                info@nextid.my
              </a>
            </div>
            <div className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-[0.3em]">
              {isRtl ? 'بواسطة هويتي الرقمية' : 'By My Digital Identity'}
            </div>
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
                  if (currentUser) {
                    const cards = await getUserCards(currentUser.uid);
                    setUserCards(cards as CardData[]);
                  }
                  setDeleteConfirmation(null);
                } catch (error) {
                  alert(isRtl ? "خطأ في حذف البطاقة" : "Error deleting card");
                } finally {
                  setSaveLoading(false);
                }
              }} className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase">{isRtl ? "نعم، احذف" : "Yes, Delete"}</button>
              <button onClick={() => setDeleteConfirmation(null)} className="py-5 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-3xl font-black text-sm uppercase">{isRtl ? "إلغاء" : "Cancel"}</button>
            </div>
          </div>
        </div>
      )}
      
      {saveLoading && <div className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl"><Loader2 className="animate-spin text-blue-600 mb-6" size={64} /><p className="text-white font-black uppercase tracking-widest text-sm">{isRtl ? 'جاري المعالجة...' : 'Processing...'}</p></div>}
    </div>
  );
};

export default App;
