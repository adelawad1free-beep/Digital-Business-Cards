
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Sparkles } from 'lucide-react';

interface HomeProps {
  lang: Language;
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ lang, onStart }) => {
  const t = (key: string) => TRANSLATIONS[key][lang];
  const isRtl = lang === 'ar';

  return (
    <div className={`min-h-[80vh] flex flex-col items-center justify-center bg-transparent ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="max-w-4xl mx-auto px-6 text-center animate-fade-in-up">
        
        {/* Badge Component */}
        <div className="inline-flex items-center px-5 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold mb-10 shadow-sm border border-blue-100 dark:border-blue-800/30">
          <span className={isRtl ? 'order-2' : 'order-1'}>{lang === 'en' ? 'AI-Powered Digital Cards' : 'بطاقات رقمية مدعومة بالذكاء الاصطناعي'}</span>
          <Sparkles size={16} className={`${isRtl ? 'mr-2 order-1' : 'ml-2 order-2'}`} />
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-black text-[#1e293b] dark:text-white mb-8 tracking-tight leading-[1.15]">
          {lang === 'en' ? 'Networking, ' : 'التواصل، '} 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600">
            {lang === 'en' ? 'Reimagined.' : 'بأسلوب جديد.'}
          </span>
        </h1>

        {/* Description Text */}
        <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto mb-14 leading-relaxed font-medium">
          {t('tagline')} {lang === 'en' ? 'Replace paper business cards with a smart, eco-friendly digital profile.' : 'استبدل بطاقاتك الورقية بملف شخصي ذكي وصديق للبيئة.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row-reverse justify-center items-center gap-5">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-10 py-5 bg-[#0f172a] dark:bg-blue-600 text-white rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/10"
          >
            {t('createBtn')}
          </button>
          
          <button className="w-full sm:w-auto px-10 py-5 bg-[#f1f5f9] dark:bg-gray-800 text-[#334155] dark:text-gray-200 rounded-2xl font-black text-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
            {lang === 'en' ? 'How it Works?' : 'كيف يعمل؟'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
