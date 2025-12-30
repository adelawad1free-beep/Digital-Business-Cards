
import React, { useState, useEffect } from 'react';
import { Language, CardData } from './types';
import { TRANSLATIONS, SAMPLE_DATA, THEME_COLORS } from './constants';
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
import { Sun, Moon, LayoutDashboard, Eye, Share2, Loader2, ShieldAlert, LogIn, LogOut, Trash2, Home as HomeIcon, SearchX, Plus, Settings, CreditCard, ExternalLink, Edit2, AlertTriangle, X, User as UserIcon, ChevronDown } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
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
  const isRtl = lang === 'ar';
  const displaySiteName = isRtl ? siteConfig.siteNameAr : siteConfig.siteNameEn;

  // تحديث أيقونة الموقع (Favicon) ديناميكياً
  useEffect(() => {
    if (siteConfig.siteIcon) {
      const favicon = document.getElementById('site-favicon') as HTMLLinkElement;
      if (favicon) {
        favicon.href = siteConfig.siteIcon;
      }
    }
  }, [siteConfig.siteIcon]);

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
      const pathParts = window.location.pathname.split('/').filter(p => p);
      const pathSlug = pathParts[0];
      const isFile = pathSlug?.includes('.');
      const reserved = ['editor', 'admin', 'preview', 'home', 'manager', 'auth', 'account'];
      const slug = querySlug || (isFile ? null : (!reserved.includes(pathSlug?.toLowerCase()) ? pathSlug : null));

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
        if (user) {
          await refreshUserCards(user.uid);
          if (pendingSaveData) {
            handleSave({ ...pendingSaveData.data, ownerId: user.uid }, pendingSaveData.oldId);
            setPendingSaveData(null);
          }
        }
        setIsInitializing(false);
      });

      return unsubscribe;
    };

    initializeApp();
  }, [pendingSaveData]);

  useEffect(() => {
    const root = window.document.documentElement;
    isDarkMode ? root.classList.add('dark') : root.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleCreateNew = () => {
    const newCard: CardData = {
      id: generateSerialId(),
      name: '', title: '', company: '', bio: '', email: '', phone: '', whatsapp: '', website: '', location: '', locationUrl: '', profileImage: '',
      themeColor: THEME_COLORS[0], isDark: false, socialLinks: [],
      ownerId: currentUser?.uid || undefined,
      ...SAMPLE_DATA[lang]
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
    
    const finalOwnerId = deleteConfirmation.ownerId || currentUser?.uid;
    if (!finalOwnerId) return;

    setSaveLoading(true);
    try {
      await deleteUserCard(finalOwnerId, deleteConfirmation.id);
      if (currentUser) await refreshUserCards(currentUser.uid);
      setDeleteConfirmation(null);
      if (activeTab === 'editor') setActiveTab('manager');
    } catch (e: any) {
      alert(isRtl 
        ? "تعذر الحذف بالكامل. يرجى تعديل البطاقة وحفظها مرة أخرى ثم محاولة الحذف." 
        : "Partial delete failure. Try editing and saving the card again before deleting.");
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
      const targetUserId = data.ownerId || auth.currentUser.uid;
      await saveCardToDB(targetUserId, data, oldId);
      
      await refreshUserCards(auth.currentUser.uid);
      setEditingCard(data);
      setShowShareModal(true);
      setActiveTab('manager');
    } catch (error) {
      alert(isRtl ? "فشل الحفظ" : "Save failed");
    } finally {
      setSaveLoading(false);
    }
  };

  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-white dark:bg-[#050507]">
        <div className="relative">
           <div className="w-24 h-24 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
           {siteConfig.siteLogo && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <img src={siteConfig.siteLogo} className="w-12 h-12 object-contain" alt="Loading Logo" />
              </div>
           )}
        </div>
        <p className="mt-6 font-black text-gray-400 text-xs uppercase tracking-[0.3em]">{displaySiteName}</p>
      </div>
    );
  }

  if (siteConfig.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#050507] text-center">
        {siteConfig.siteLogo ? (
           <img src={siteConfig.siteLogo} className="w-32 h-32 object-contain mb-8" alt="Maintenance Logo" />
        ) : (
           <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mb-8"><Settings size={48} /></div>
        )}
        <h1 className="text-3xl font-black mb-4 dark:text-white">{isRtl ? 'الموقع تحت الصيانة' : 'Under Maintenance'}</h1>
      </div>
    );
  }

  if (publicCard) return <PublicProfile data={publicCard} lang={lang} />;

  const NavItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button onClick={() => setActiveTab(id)} className={`flex flex-col items-center justify-center flex-1 py-3 transition-all ${activeTab === id ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-gray-400'}`}>
      <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
      <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0c]' : 'bg-[#f8fafc]'} ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Formal Top Navbar - Extended, No Shadow */}
      <header className="hidden md:block sticky top-0 z-[100] w-full bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-4 cursor-pointer group shrink-0" onClick={() => setActiveTab('home')}>
            {siteConfig.siteLogo ? (
               <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center p-1.5 transition-transform border border-gray-100 dark:border-gray-700">
                  <img src={siteConfig.siteLogo} className="w-full h-full object-contain" alt="Logo" />
               </div>
            ) : (
               <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">هـ</div>
            )}
            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">{displaySiteName}</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center">
            <button 
              onClick={() => setActiveTab('home')} 
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'home' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
            </button>
            
            {currentUser && (
              <>
                <button 
                  onClick={() => setActiveTab('manager')} 
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'manager' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <span>{isRtl ? 'بطاقاتي' : 'Cards'}</span>
                </button>
                <button 
                  onClick={() => setActiveTab('account')} 
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'account' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <span>{isRtl ? 'الحساب' : 'Account'}</span>
                </button>
              </>
            )}
            
            {isAdmin && (
              <button 
                onClick={() => setActiveTab('admin')} 
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'admin' ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'}`}
              >
                <span>{isRtl ? 'الإدارة' : 'Admin'}</span>
              </button>
            )}
          </nav>

          {/* Controls Section */}
          <div className="flex items-center gap-4 shrink-0">
            <LanguageToggle currentLang={lang} onToggle={setLang} />
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            
            <div className="h-6 w-px bg-gray-100 dark:bg-gray-800"></div>
            
            {currentUser ? (
              <button 
                onClick={() => signOut(auth).then(() => window.location.reload())}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-xs font-black uppercase transition-all hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500"
              >
                <LogOut size={16} /> {isRtl ? 'خروج' : 'Logout'}
              </button>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)} 
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-blue-500/10 hover:bg-blue-700 transition-all"
              >
                <LogIn size={18} /> {isRtl ? 'دخول' : 'Login'}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="transition-all duration-300 pb-24 md:pb-12 pt-4">
        <div className="max-w-[1440px] mx-auto p-4 md:p-12">
           {activeTab === 'home' && <Home lang={lang} onStart={handleCreateNew} />}
           
           {activeTab === 'manager' && (
             <div className="space-y-10 animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div>
                      <h2 className="text-3xl font-black dark:text-white">{isRtl ? 'إدارة البطاقات' : 'Card Manager'}</h2>
                      <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">{isRtl ? 'تحكم ببطاقاتك الرقمية بسهولة' : 'Manage your digital identity easily'}</p>
                   </div>
                   <button onClick={handleCreateNew} className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-500/10 hover:scale-105 active:scale-95 transition-all">
                      <Plus size={20} /> {isRtl ? 'إنشاء بطاقة جديدة' : 'New Digital Card'}
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                   {userCards.map((card) => (
                      <div key={card.id} className="bg-white dark:bg-[#121215] p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl group hover:border-blue-500 transition-all relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] rounded-full"></div>
                         <div className="flex items-center gap-5 mb-8 relative z-10">
                            <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border-2 border-gray-50 dark:border-gray-800 shadow-lg">
                               {card.profileImage ? <img src={card.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400"><CreditCard size={32} /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="font-black text-xl truncate dark:text-white leading-tight mb-1">{card.name || '---'}</p>
                               <div className="inline-flex px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider">{card.id}</div>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-3 gap-3 relative z-10">
                            <button onClick={() => handleEditCard(card)} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                               <Edit2 size={18} /> <span className="text-[10px] font-black uppercase">{isRtl ? 'تعديل' : 'Edit'}</span>
                            </button>
                            <a href={`?u=${card.id}`} target="_blank" className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                               <ExternalLink size={18} /> <span className="text-[10px] font-black uppercase">{isRtl ? 'زيارة' : 'View'}</span>
                            </a>
                            <button onClick={() => setDeleteConfirmation({ id: card.id, ownerId: card.ownerId || currentUser?.uid || '' })} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                               <Trash2 size={18} /> <span className="text-[10px] font-black uppercase">{isRtl ? 'حذف' : 'Delete'}</span>
                            </button>
                         </div>
                      </div>
                   ))}
                   {userCards.length === 0 && (
                      <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[4rem] bg-white/50 dark:bg-gray-900/20">
                         <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 text-gray-400 rounded-full flex items-center justify-center mb-6"><Plus size={40} /></div>
                         <p className="text-gray-400 font-black text-xl mb-2">{isRtl ? 'ابدأ هويتك الرقمية الآن' : 'Start your digital ID now'}</p>
                         <button onClick={handleCreateNew} className="text-blue-600 font-bold hover:underline">{isRtl ? 'اضغط هنا لإنشاء بطاقتك الأولى' : 'Click here to create your first card'}</button>
                      </div>
                   )}
                </div>
             </div>
           )}

           {activeTab === 'editor' && <Editor lang={lang} onSave={handleSave} initialData={editingCard || undefined} isAdminEdit={isAdmin} />}
           {activeTab === 'admin' && isAdmin && <AdminDashboard lang={lang} onEditCard={handleEditCard} onDeleteRequest={(id, owner) => setDeleteConfirmation({ id, ownerId: owner })} />}
           {activeTab === 'account' && currentUser && <UserAccount lang={lang} />}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 flex px-4 z-[200] h-20 safe-area-inset-bottom rounded-t-3xl shadow-lg">
        <NavItem id="home" icon={HomeIcon} label={isRtl ? 'الرئيسية' : 'Home'} />
        {currentUser && <NavItem id="manager" icon={CreditCard} label={isRtl ? 'بطاقاتي' : 'Cards'} />}
        {currentUser && <NavItem id="account" icon={UserIcon} label={isRtl ? 'حسابي' : 'Account'} />}
        {isAdmin && <NavItem id="admin" icon={ShieldAlert} label={isRtl ? 'إدارة' : 'Admin'} />}
      </nav>

      {/* Shared Components */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[340px] rounded-[3rem] p-8 text-center shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            <h3 className="text-xl font-black mb-3 dark:text-white">
              {isRtl ? "تأكيد الحذف" : "Confirm Delete"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 font-bold leading-relaxed px-4">
              {isRtl ? "هل أنت متأكد من حذف هذه البطاقة؟ لا يمكن استعادتها مرة أخرى." : "Are you sure you want to delete this card? This cannot be undone."}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setDeleteConfirmation(null)} 
                className="py-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black text-xs uppercase tracking-wider transition-all hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button 
                onClick={confirmDeleteCard} 
                className="py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-xl shadow-red-600/20 hover:scale-[1.03] active:scale-95 transition-all"
              >
                {isRtl ? "تأكيد" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {saveLoading && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-md">
           <div className="bg-white dark:bg-gray-900 p-12 rounded-[4rem] flex flex-col items-center gap-6 shadow-2xl border border-gray-100 dark:border-gray-800 animate-fade-in">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="text-blue-600 animate-pulse" size={24} /></div>
              </div>
              <p className="font-black text-xl dark:text-white uppercase tracking-widest">{isRtl ? 'جاري التنفيذ...' : 'Processing...'}</p>
           </div>
        </div>
      )}

      {showShareModal && editingCard && <ShareModal data={editingCard} lang={lang} onClose={() => setShowShareModal(false)} />}
      {showAuthModal && <AuthModal lang={lang} onClose={() => setShowAuthModal(false)} onSuccess={(uid) => { setShowAuthModal(false); }} />}
    </div>
  );
};

export default App;
