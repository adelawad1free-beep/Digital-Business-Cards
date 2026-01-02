
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Sparkles } from 'lucide-react';

interface HomeProps {
  lang: Language;
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ lang, onStart }) => {
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];
  const isRtl = lang === 'ar';

  const seoKeywords: Partial<Record<Language, string[]>> = {
    en: [
      "DIGITAL IDENTITY", "SMART BUSINESS CARDS", "NFC TECHNOLOGY", "QR CODE NETWORKING", 
      "PROFESSIONAL PROFILES", "VIRTUAL BUSINESS CARDS", "BIO LINK", "CONTACTLESS NETWORKING", 
      "PERSONAL BRANDING", "SMART CONTACT SHARING", "E-BUSINESS CARD", "SMART PROFILE",
      "DIGITAL ECOSYSTEM", "VCARD PLUS", "NETWORKING SOLUTIONS", "CORPORATE ID",
      "ELECTRONIC BUSINESS CARD", "PAPERLESS NETWORKING", "MOBILE IDENTITY", "SMART TAGS"
    ],
    ar: [
      "بطاقات أعمال رقمية", "هوية مهنية ذكية", "تقنية NFC", "باركود الأعمال", 
      "روابط التواصل المهني", "بروفايل ذكي", "كرت شخصي إلكتروني", "تواصل لا تلامسي", 
      "مشاركة جهات الاتصال", "كروت ذكية", "هويتي الرقمية", "تحول رقمي مهني",
      "رابط البيو", "بطاقة تواصل", "هوية الشركات", "التسويق الشخصي"
    ]
  };

  const currentKeywords = seoKeywords[lang] || seoKeywords['en'] || [];
  const seoHeader = {
    en: "ADVANCED DIGITAL IDENTITY ECOSYSTEM & SERVICES",
    ar: "المنظومة المتكاملة لتقنيات وخدمات الهوية الرقمية الذكية"
  };

  return (
    <main className={`min-h-[85vh] flex flex-col items-center justify-between bg-transparent ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 text-center animate-fade-in-up mt-12 md:mt-20 relative z-10">
        <div className="inline-flex items-center px-5 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold mb-12 shadow-sm border border-blue-100 dark:border-blue-800/30">
          <span className={isRtl ? 'order-2' : 'order-1'}>{t('heroBadge')}</span>
          <Sparkles size={16} className={`${isRtl ? 'mr-2 order-1' : 'ml-2 order-2'}`} aria-hidden="true" />
        </div>

        <h1 className="text-4xl md:text-[5.5rem] font-black text-[#1e293b] dark:text-white mb-8 tracking-tight leading-[1.1] md:leading-[1.1]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600">
            {t('heroTitle')}
          </span>
        </h1>

        <h2 className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
          {t('heroDesc')}
        </h2>

        <div className="flex justify-center items-center mb-16">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-14 py-6 bg-[#0f172a] dark:bg-blue-600 text-white rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/10"
          >
            {t('createBtn')}
          </button>
        </div>
      </section>

      {/* Expanded SEO Keywords Block */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-16 border-t border-gray-100 dark:border-gray-800/50 mt-auto">
        <div className="flex flex-col items-center gap-8">
          <h3 className="text-[10px] md:text-[12px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.4em] text-center border-b border-gray-100 dark:border-gray-800 pb-4 w-full max-w-md">
            {(seoHeader as any)[lang] || (seoHeader as any)['en']}
          </h3>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 max-w-6xl opacity-60 dark:opacity-50 text-center">
            {currentKeywords.map((keyword, index) => (
              <React.Fragment key={index}>
                <span className="text-[9px] md:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-blue-500 transition-all cursor-default hover:scale-105">
                  {keyword}
                </span>
                {index < currentKeywords.length - 1 && (
                  <span className="text-gray-200 dark:text-gray-800 select-none font-thin" aria-hidden="true">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
