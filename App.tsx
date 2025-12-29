
import React, { useState, useEffect } from 'react';
import { Language, CardData } from './types';
import { TRANSLATIONS } from './constants';
import Editor from './pages/Editor';
import LanguageToggle from './components/LanguageToggle';
import { Sun, Moon, LayoutDashboard, Mail } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [userCard, setUserCard] = useState<CardData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

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
    alert(lang === 'en' ? 'Saved!' : 'تم الحفظ!');
  };

  const isRtl = lang === 'ar';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0c]' : 'bg-[#f8fafc]'} ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Sidebar القائمة الجانبية */}
      <aside className={`w-full md:w-72 md:h-screen md:fixed top-0 bottom-0 z-50 flex flex-col bg-white dark:bg-[#121215] border-x border-gray-100 dark:border-gray-800 shadow-xl transition-colors ${isRtl ? 'right-0' : 'left-0'}`}>
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">C</div>
            <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight leading-none">
              {TRANSLATIONS.appName[lang]}
            </span>
          </div>

          <nav className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold shadow-sm">
              <LayoutDashboard size={20} />
              <span>{lang === 'en' ? 'Editor' : 'المحرر'}</span>
            </div>
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500">{lang === 'en' ? 'Theme' : 'المظهر'}</span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-500">{lang === 'en' ? 'Language' : 'اللغة'}</span>
            <LanguageToggle currentLang={lang} onToggle={setLang} />
          </div>

          <div className="pt-4">
            <p className="text-[10px] text-gray-400 font-medium text-center">
              © {new Date().getFullYear()} {TRANSLATIONS.appName[lang]}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${isRtl ? 'md:pr-72' : 'md:pl-72'}`}>
        <div className="max-w-7xl mx-auto p-6 md:p-12 flex flex-col min-h-screen">
          <div className="flex-1">
            <Editor 
              lang={lang} 
              onSave={handleSaveCard}
              initialData={userCard || undefined}
            />
          </div>
          
          {/* التذييل في سطر واحد بسيط */}
          <footer className="mt-16 py-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium">
            <span className="text-gray-500 dark:text-gray-400">
              {lang === 'ar' ? 'جميع الحقوق محفوظة 2025 ©' : 'All Rights Reserved 2025 ©'}
            </span>
            <span className="hidden sm:inline text-gray-300 dark:text-gray-700">|</span>
            <a href="mailto:adelawad1@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
              <Mail size={14} />
              adelawad1@gmail.com
            </a>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default App;
