
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Heart, Coffee, Mail } from 'lucide-react';

interface FooterProps {
  lang: Language;
}

const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  const isRtl = lang === 'ar';

  return (
    <footer className={`w-full py-16 px-6 flex flex-col items-center text-center space-y-10 border-t border-gray-100 dark:border-gray-800/50 bg-white dark:bg-[#050507] ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Support Badge */}
      <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FFF9E5] text-[#854D0E] text-xs font-black border border-[#FEF3C7] shadow-sm animate-fade-in">
        <Heart size={14} className="fill-current" />
        {t('heroBadge')}
      </div>

      {/* Main Support Text */}
      <h2 className="text-2xl md:text-4xl font-black text-[#1e293b] dark:text-white max-w-2xl leading-tight">
        {t('supportProjectText')}
      </h2>

      {/* Buy Me a Coffee Button */}
      <a 
        href="https://buymeacoffee.com/guidai" 
        target="_blank" 
        rel="noopener noreferrer"
        className="group flex items-center gap-4 px-12 py-6 bg-[#FFDD00] text-black rounded-[2.5rem] font-black text-xl shadow-xl shadow-[#FFDD00]/20 hover:scale-105 active:scale-95 transition-all"
      >
        <span className="md:order-1">{t('buyMeCoffee')}</span>
        <Coffee size={32} className="md:order-2 group-hover:animate-bounce" />
      </a>

      {/* Lower Bar: Email & Copyright */}
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-6 pt-10 border-t border-gray-50 dark:border-gray-800/30">
        
        {/* Email Badge */}
        <a 
          href="mailto:info@nextid.my" 
          className="flex items-center gap-3 px-8 py-4 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 rounded-3xl border border-gray-100 dark:border-gray-700 font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm"
        >
          <span>info@nextid.my</span>
          <Mail size={18} className="text-gray-400" />
        </a>

        {/* Separator for Desktop */}
        <div className="hidden md:block w-px h-6 bg-gray-200 dark:bg-gray-700 mx-2"></div>

        {/* Copyright */}
        <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500 font-black text-sm uppercase tracking-tighter">
          <span className="text-blue-600 font-black">2025</span>
          <span>{t('rightsReserved')}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
