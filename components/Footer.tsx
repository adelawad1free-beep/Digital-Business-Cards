
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Heart, Coffee, Mail, Instagram, Twitter, Linkedin, Github } from 'lucide-react';

interface FooterProps {
  lang: Language;
}

const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  const isRtl = lang === 'ar';

  return (
    <footer className={`w-full py-10 px-6 mt-auto border-t border-gray-100 dark:border-white/5 bg-white/50 dark:bg-[#050507]/50 backdrop-blur-sm ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* Brand & Rights */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-[10px]">ID</div>
            <span className="text-lg font-black dark:text-white tracking-tighter uppercase">NextID</span>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            © 2025 {t('rightsReserved')}
          </p>
        </div>

        {/* Minimal Support Button */}
        <div className="flex flex-col items-center gap-3">
          <a 
            href="https://buymeacoffee.com/guidai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-6 py-3 bg-[#FFDD00] text-black rounded-2xl font-black text-[11px] shadow-lg shadow-amber-500/10 hover:scale-105 active:scale-95 transition-all group"
          >
            <Coffee size={16} className="group-hover:rotate-12 transition-transform" />
            <span>{t('buyMeCoffee')}</span>
          </a>
          <div className="flex items-center gap-1.5 opacity-40">
             <Heart size={10} className="text-red-500 fill-current" />
             <span className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em]">{isRtl ? 'صنع بكل حب للمبدعين' : 'Made with love for creators'}</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          {[Instagram, Twitter, Linkedin, Github].map((Icon, idx) => (
            <a 
              key={idx} 
              href="#" 
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Icon size={18} />
            </a>
          ))}
          <div className="h-4 w-px bg-gray-200 dark:bg-gray-800 mx-1"></div>
          <a href="mailto:info@nextid.my" className="text-[10px] font-black text-gray-400 hover:text-blue-600 transition-colors uppercase">
            Contact
          </a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
