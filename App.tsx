
import React, { useState, useEffect } from 'react';
import { Language, CardData } from './types';
import { TRANSLATIONS } from './constants';
import Editor from './pages/Editor';
import LanguageToggle from './components/LanguageToggle';
import { Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [userCard, setUserCard] = useState<CardData | null>(null);
  
  // التحكم في ثيم الموقع (ليلي/نهاري)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return false; // الافتراضي نهاري
  });

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

  // إدارة كلاس الـ Dark على مستوى الـ HTML
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

  const handleSaveCard = (data: CardData) => {
    setUserCard(data);
    localStorage.setItem('connectflow_card', JSON.stringify(data));
    alert(lang === 'en' ? 'Card saved successfully!' : 'تم حفظ البطاقة بنجاح!');
  };

  const isRtl = lang === 'ar';

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'dark bg-[#0f1115]' : 'bg-[#fcfcfd]'} ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* هيدر الموقع - أبيض ناصع في النهار */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-6 py-4 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
              C
            </div>
            <span className={`text-xl font-black text-gray-900 dark:text-white ${isRtl ? 'mr-3' : 'ml-3'}`}>
              {TRANSLATIONS.appName[lang]}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
              title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <LanguageToggle currentLang={lang} onToggle={setLang} />
          </div>
        </div>
      </header>

      <main className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto">
          <Editor 
            lang={lang} 
            onSave={handleSaveCard}
            onBack={() => {}} 
            initialData={userCard || undefined}
            isStandalone={true}
          />
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-gray-400 dark:text-gray-500 text-sm font-bold uppercase tracking-widest">
            {TRANSLATIONS.appName[lang]} © {new Date().getFullYear()}
          </div>
          <div className="flex gap-8">
            <span className="text-gray-400 dark:text-gray-500 text-sm hover:text-blue-600 cursor-pointer transition-colors">Privacy</span>
            <span className="text-gray-400 dark:text-gray-500 text-sm hover:text-blue-600 cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
