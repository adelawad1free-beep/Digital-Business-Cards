
import React, { useState, useEffect } from 'react';
import { Language, CardData } from './types';
import { TRANSLATIONS, SAMPLE_DATA } from './constants';
import Editor from './pages/Editor';
import PublicProfile from './pages/PublicProfile';
import CardPreview from './components/CardPreview';
import LanguageToggle from './components/LanguageToggle';
import ShareModal from './components/ShareModal';
import { decodeCardData } from './utils/share';
import { Sun, Moon, LayoutDashboard, Eye, Settings, Share2, Mail } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [userCard, setUserCard] = useState<CardData | null>(null);
  const [publicCard, setPublicCard] = useState<CardData | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'settings'>('editor');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('c');
    if (code) {
      const decoded = decodeCardData(code);
      if (decoded) {
        setPublicCard(decoded);
        setIsDarkMode(decoded.isDark);
      }
    }
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('connectflow_card');
    if (saved) {
      try {
        setUserCard(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading card", e);
      }
    }
  }, []);

  const handleSaveCard = (data: CardData) => {
    setUserCard(data);
    localStorage.setItem('connectflow_card', JSON.stringify(data));
    setShowShareModal(true);
  };

  const isRtl = lang === 'ar';

  if (publicCard) {
    return <PublicProfile data={publicCard} lang={lang} />;
  }

  const NavItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center flex-1 py-3 transition-all ${activeTab === id ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-gray-400'}`}
    >
      <Icon size={22} strokeWidth={activeTab === id ? 2.5 : 2} />
      <span className="text-[10px] font-bold mt-1 uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0c]' : 'bg-[#f8fafc]'} ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* الجانب الأيسر (Desktop Sidebar) */}
      <aside className={`hidden md:flex w-72 h-screen fixed top-0 bottom-0 z-50 flex-col bg-white dark:bg-[#121215] border-x border-gray-100 dark:border-gray-800 shadow-xl transition-colors ${isRtl ? 'right-0' : 'left-0'}`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              {lang === 'ar' ? 'هـ' : 'D'}
            </div>
            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              {TRANSLATIONS.appName[lang]}
            </span>
          </div>

          <nav className="space-y-2">
            <button onClick={() => setActiveTab('editor')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'editor' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <LayoutDashboard size={20} />
              <span>{lang === 'en' ? 'Card Editor' : 'محرر البطاقة'}</span>
            </button>
            <button onClick={() => setActiveTab('preview')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold transition-all ${activeTab === 'preview' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <Eye size={20} />
              <span>{lang === 'en' ? 'Live Preview' : 'معاينة مباشرة'}</span>
            </button>
            {userCard && (
               <button onClick={() => setShowShareModal(true)} className="w-full flex items-center gap-3 p-4 rounded-2xl text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold transition-all">
                <Share2 size={20} />
                <span>{lang === 'en' ? 'Publish & Share' : 'نشر ومشاركة'}</span>
               </button>
            )}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              <span className="text-xs font-bold">{lang === 'en' ? 'Appearance' : 'المظهر'}</span>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          <div className="flex items-center justify-between gap-2">
             <LanguageToggle currentLang={lang} onToggle={setLang} />
          </div>
        </div>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className={`flex-1 transition-all duration-300 ${isRtl ? 'md:mr-72' : 'md:ml-72'} pb-24 md:pb-0`}>
        <div className="max-w-[1440px] mx-auto p-4 md:p-12">
          
          {/* Header للجوال */}
          <div className="md:hidden flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                {lang === 'ar' ? 'هـ' : 'D'}
              </div>
              <span className="font-black text-lg">{TRANSLATIONS.appName[lang]}</span>
            </div>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <div className="animate-fade-in-up">
            {activeTab === 'editor' && (
              <Editor lang={lang} onSave={handleSaveCard} initialData={userCard || undefined} />
            )}
            
            {activeTab === 'preview' && (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-sm">
                   <div className="mb-6 text-center">
                      <h2 className="text-2xl font-black">{lang === 'ar' ? 'كيف يراك الآخرون' : 'How others see you'}</h2>
                      <p className="text-sm text-gray-500">{lang === 'ar' ? 'معاينة حقيقية لصفحتك العامة' : 'Real-time preview of your public page'}</p>
                   </div>
                   <CardPreview data={userCard || (SAMPLE_DATA[lang] as CardData)} lang={lang} />
                   <button 
                    onClick={() => userCard ? setShowShareModal(true) : setActiveTab('editor')}
                    className="w-full mt-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl flex items-center justify-center gap-2"
                   >
                     <Share2 size={20} />
                     {lang === 'ar' ? 'نشر هذه البطاقة' : 'Publish this Card'}
                   </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="max-w-md mx-auto space-y-6">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl">
                    <h2 className="text-xl font-black mb-6">{lang === 'ar' ? 'إعدادات المنصة' : 'Platform Settings'}</h2>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                          <span className="font-bold">{lang === 'ar' ? 'اللغة' : 'Language'}</span>
                          <LanguageToggle currentLang={lang} onToggle={setLang} />
                       </div>
                       <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                          <span className="font-bold">{lang === 'ar' ? 'المظهر الليلي' : 'Dark Appearance'}</span>
                          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                          </button>
                       </div>
                    </div>
                 </div>
                 <div className="text-center text-gray-400 text-xs">
                    <p>© 2025 {TRANSLATIONS.appName[lang]}</p>
                    <p>Contact: info@ai-guid.com</p>
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Nav للجوال */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 flex px-4 z-[100] pb-safe">
        <NavItem id="editor" icon={LayoutDashboard} label={lang === 'ar' ? 'المحرر' : 'Editor'} />
        <NavItem id="preview" icon={Eye} label={lang === 'ar' ? 'المعاينه' : 'Preview'} />
        <NavItem id="settings" icon={Settings} label={lang === 'ar' ? 'الإعدادات' : 'Settings'} />
      </nav>

      {showShareModal && userCard && (
        <ShareModal data={userCard} lang={lang} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
};

export default App;
