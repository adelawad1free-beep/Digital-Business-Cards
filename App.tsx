
import React, { useState, useEffect } from 'react';
import { Language, CardData } from './types';
import { TRANSLATIONS } from './constants';
import Editor from './pages/Editor';
import LanguageToggle from './components/LanguageToggle';
import { Sun, Moon } from 'lucide-react';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [userCard, setUserCard] = useState<CardData | null>(null);
  
  // الحالة الافتراضية للثيم
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark';
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

  // تطبيق الثيم على مستوى المستند
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
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-950' : 'bg-gray-50'} ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* الهيدر - تم تعديل الألوان لضمان الشفافية والوضوح في الوضعين */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* الشعار واسم الموقع */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg transform hover:scale-105 transition-transform">
              C
            </div>
            <span className={`text-xl font-bold text-gray-900 dark:text-white ${isRtl ? 'mr-3' : 'ml-3'}`}>
              {TRANSLATIONS.appName[lang]}
            </span>
          </div>
          
          {/* التحكم في اللغة والثيم */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 shadow-sm"
              title={isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <LanguageToggle currentLang={lang} onToggle={setLang} />
          </div>
        </div>
      </header>

      {/* محتوى المحرر */}
      <main className="pt-24 pb-12">
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

      {/* الفوتر */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-10 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-400 dark:text-gray-500 text-sm font-medium">
            © {new Date().getFullYear()} {TRANSLATIONS.appName[lang]}. {lang === 'en' ? 'Digital Identity Platform' : 'منصة الهوية الرقمية'}
          </div>
          <div className="flex gap-6">
            <span className="text-gray-400 dark:text-gray-500 text-sm hover:text-blue-500 transition-colors cursor-pointer">Privacy</span>
            <span className="text-gray-400 dark:text-gray-500 text-sm hover:text-blue-500 transition-colors cursor-pointer">Terms</span>
            <span className="text-gray-400 dark:text-gray-500 text-sm hover:text-blue-500 transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
