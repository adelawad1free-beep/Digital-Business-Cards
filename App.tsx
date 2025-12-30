
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
import { Sun, Moon, LayoutDashboard, Eye, Share2, Loader2, ShieldAlert, LogIn, LogOut, Trash2, Home as HomeIcon, SearchX, Plus, Settings, CreditCard, ExternalLink, Edit2, AlertTriangle, X, User as UserIcon } from 'lucide-react';

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
    maintenanceMode: false 
  });
  const [isInitializing, setIsInitializing] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [pendingSaveData, setPendingSaveData] = useState<{data: CardData, oldId?: string} | null>(null);

  const isAdmin = currentUser?.email === ADMIN_EMAIL;
  const isRtl = lang === 'ar';
  const displaySiteName = isRtl ? siteConfig.siteNameAr : siteConfig.siteNameEn;

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
        <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-6 font-black text-gray-400 text-xs uppercase tracking-[0.3em]">{displaySiteName}</p>
      </div>
    );
  }

  if (siteConfig.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-[#050507] text-center">
        <div className="w-24 h-24 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded-full flex items-center justify-center mb-8"><Settings size={48} /></div>
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
      <aside className={`hidden md:flex w-72 h-screen fixed top-0 bottom-0 z-50 flex-col bg-white dark:bg-[#121215] border-x border-gray-100 dark:border-gray-800 shadow-xl transition-colors ${isRtl ? 'right-0' : 'left-0'}`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">هـ</div>
            <span className="text-xl font-black text-gray-900 dark:text-white truncate">{displaySiteName}</span>
          </div>
          <nav className="space-y-2">
            <button onClick={() => setActiveTab('home')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'home' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <HomeIcon size={20} /> <span>{isRtl ? 'الرئيسية' : 'Home'}</span>
            </button>
            {currentUser && (
              <>
                <button onClick={() => setActiveTab('manager')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'manager' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <CreditCard size={20} /> <span>{isRtl ? 'بطاقاتي' : 'My Cards'}</span>
                </button>
                <button onClick={() => setActiveTab('account')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'account' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                  <UserIcon size={20} /> <span>{isRtl ? 'إعدادات الحساب' : 'Account'}</span>
                </button>
              </>
            )}
            {isAdmin && (
              <button onClick={() => setActiveTab('admin')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'admin' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <ShieldAlert size={20} /> <span>{isRtl ? 'الإدارة' : 'Admin'}</span>
              </button>
            )}
          </nav>
        </div>
        <div className="mt-auto p-8 space-y-4 border-t border-gray-100 dark:border-gray-800">
          {currentUser ? (
             <button onClick={() => signOut(auth).then(() => window.location.reload())} className="w-full py-3 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 border border-gray-100 dark:border-gray-700">
               <LogOut size={14} /> {isRtl ? 'تسجيل خروج' : 'Logout'}
             </button>
          ) : (
            <button onClick={() => setShowAuthModal(true)} className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black uppercase shadow-lg flex items-center justify-center gap-2"><LogIn size={18} /> {isRtl ? 'دخول' : 'Login'}</button>
          )}
          <LanguageToggle currentLang={lang} onToggle={setLang} />
        </div>
      </aside>

      <main className={`flex-1 transition-all duration-300 ${isRtl ? 'md:mr-72' : 'md:ml-72'} pb-24 md:pb-0`}>
        <div className="max-w-[1440px] mx-auto p-4 md:p-12">
           {activeTab === 'home' && <Home lang={lang} onStart={handleCreateNew} />}
           
           {activeTab === 'manager' && (
             <div className="space-y-10 animate-fade-in-up">
                <div className="flex items-center justify-between">
                   <h2 className="text-3xl font-black dark:text-white">{isRtl ? 'إدارة البطاقات' : 'Card Manager'}</h2>
                   <button onClick={handleCreateNew} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl hover:scale-105 transition-all">
                      <Plus size={18} /> {isRtl ? 'بطاقة جديدة' : 'New Card'}
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                   {userCards.map((card) => (
                      <div key={card.id} className="bg-white dark:bg-[#121215] p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl group hover:border-blue-500 transition-all">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-50 dark:border-gray-800 shadow-sm">
                               {card.profileImage ? <img src={card.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400"><CreditCard size={24} /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="font-black text-lg truncate dark:text-white leading-tight">{card.name || '---'}</p>
                               <p className="text-xs font-bold text-gray-400 truncate mt-1">{card.title || '---'}</p>
                            </div>
                         </div>
                         <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => handleEditCard(card)} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white transition-all">
                               <Edit2 size={16} /> <span className="text-[10px] font-black uppercase">تعديل</span>
                            </button>
                            <a href={`?u=${card.id}`} target="_blank" className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all">
                               <ExternalLink size={16} /> <span className="text-[10px] font-black uppercase">رابط</span>
                            </a>
                            <button onClick={() => setDeleteConfirmation({ id: card.id, ownerId: card.ownerId || currentUser?.uid || '' })} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-all">
                               <Trash2 size={16} /> <span className="text-[10px] font-black uppercase">حذف</span>
                            </button>
                         </div>
                      </div>
                   ))}
                   {userCards.length === 0 && (
                      <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[3rem]">
                         <p className="text-gray-400 font-bold">{isRtl ? 'لا يوجد لديك بطاقات بعد' : 'No cards created yet'}</p>
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 flex px-4 z-[100] h-20">
        <NavItem id="home" icon={HomeIcon} label={isRtl ? 'الرئيسية' : 'Home'} />
        {currentUser && <NavItem id="manager" icon={CreditCard} label={isRtl ? 'بطاقاتي' : 'Cards'} />}
        {currentUser && <NavItem id="account" icon={UserIcon} label={isRtl ? 'حسابي' : 'Account'} />}
        {isAdmin && <NavItem id="admin" icon={ShieldAlert} label={isRtl ? 'إدارة' : 'Admin'} />}
      </nav>

      {deleteConfirmation && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[340px] rounded-[2.5rem] p-8 text-center shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-black mb-2 dark:text-white">
              {isRtl ? "تأكيد الحذف" : "Confirm Delete"}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-8 font-bold leading-relaxed">
              {isRtl ? "هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure? This action cannot be undone."}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setDeleteConfirmation(null)} 
                className="py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black text-xs uppercase tracking-wider transition-all hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button 
                onClick={confirmDeleteCard} 
                className="py-3.5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/20 hover:scale-[1.03] active:scale-95 transition-all"
              >
                {isRtl ? "نعم، احذف" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {saveLoading && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
           <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] flex flex-col items-center gap-4 shadow-2xl">
              <Loader2 className="animate-spin text-blue-600" size={56} />
              <p className="font-black text-xl dark:text-white">{isRtl ? 'جاري التنفيذ...' : 'Processing...'}</p>
           </div>
        </div>
      )}

      {showShareModal && editingCard && <ShareModal data={editingCard} lang={lang} onClose={() => setShowShareModal(false)} />}
      {showAuthModal && <AuthModal lang={lang} onClose={() => setShowAuthModal(false)} onSuccess={(uid) => { setShowAuthModal(false); }} />}
    </div>
  );
};

export default App;
