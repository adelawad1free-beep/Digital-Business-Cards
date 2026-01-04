
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Heart, Coffee, Mail, Instagram, Twitter, Linkedin, Github, Globe, ArrowRight } from 'lucide-react';

interface FooterProps {
  lang: Language;
}

const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  const isRtl = lang === 'ar';

  return (
    <footer className={`w-full py-24 px-6 flex flex-col items-center bg-gray-50 dark:bg-[#050507] border-t border-gray-100 dark:border-white/5 ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Support Visual Box */}
      <div className="w-full max-w-4xl relative group mb-20">
         <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[3rem] blur opacity-10 group-hover:opacity-30 transition-all duration-1000"></div>
         <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] p-10 md:p-16 border border-gray-100 dark:border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-12 text-center md:text-start overflow-hidden">
            
            <div className="absolute top-0 right-0 p-10 opacity-5 -mr-20 -mt-10 group-hover:rotate-12 transition-transform duration-700">
               <Coffee size={240} />
            </div>

            <div className="relative z-10 shrink-0">
               <div className="w-24 h-24 bg-amber-50 dark:bg-amber-500/10 rounded-[2rem] flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Coffee size={48} className="animate-bounce" />
               </div>
            </div>

            <div className="relative z-10 flex-1 space-y-4">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-500/20">
                  <Heart size={12} className="fill-current" />
                  {isRtl ? 'ادعم الإبداع العربي' : 'Support Creative Tech'}
               </div>
               <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white leading-tight">
                 {isRtl ? 'ساعدنا ليبقى الموقع مجاناً للجميع' : 'Keep NextID Free for Everyone'}
               </h2>
               <p className="text-gray-500 dark:text-gray-400 font-bold max-w-md">
                 {isRtl ? 'تبرعك بكوب قهوة يساهم في تغطية تكاليف الخوادم وتطوير ميزات جديدة مذهلة.' : 'Your small donation covers server costs and fuels new amazing features.'}
               </p>
            </div>

            <div className="relative z-10">
               <a 
                href="https://buymeacoffee.com/guidai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group/btn flex items-center gap-4 px-10 py-5 bg-[#FFDD00] text-black rounded-2xl font-black text-lg shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                <span>{t('buyMeCoffee')}</span>
                {/* Added ArrowRight icon fixed by import above */}
                <ArrowRight size={20} className={`transition-transform ${isRtl ? 'rotate-180 group-hover/btn:-translate-x-2' : 'group-hover/btn:translate-x-2'}`} />
              </a>
            </div>
         </div>
      </div>

      {/* Brand & Social Bar */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 items-center gap-10 pt-10 border-t border-gray-100 dark:border-white/5">
         
         <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">ID</div>
              <span className="text-2xl font-black dark:text-white uppercase tracking-tighter">NextID</span>
            </div>
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 max-w-[200px] text-center md:text-start leading-relaxed">
              {isRtl ? 'منصة رائدة تهدف لتمكين المحترفين من خلال هويات رقمية ذكية وأنيقة.' : 'Leading platform empowering professionals with smart and elegant digital identities.'}
            </p>
         </div>

         <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
               {[Instagram, Twitter, Linkedin, Github].map((Icon, idx) => (
                  <a key={idx} href="#" className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:text-blue-600 hover:border-blue-600 hover:shadow-xl transition-all duration-300">
                     <Icon size={20} />
                  </a>
               ))}
            </div>
            <a href="mailto:info@nextid.my" className="flex items-center gap-2 text-xs font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
               <Mail size={16} />
               info@nextid.my
            </a>
         </div>

         <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex items-center gap-2 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
               <span className="text-blue-600">2025</span>
               <span>{t('rightsReserved')}</span>
            </div>
            <div className="flex items-center gap-4 opacity-40">
               <div className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.3em]">
                 <Globe size={10} />
                 <span>Global Presence</span>
               </div>
               <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
               <div className="text-[8px] font-black uppercase tracking-[0.3em]">Scalable Tech</div>
            </div>
         </div>
      </div>

      <div className="mt-20 flex flex-col items-center gap-4 opacity-20 group">
         <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.5em] group-hover:tracking-[0.7em] transition-all duration-1000">Designed for the future</p>
         <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-blue-600 to-transparent rounded-full"></div>
      </div>
    </footer>
  );
};

export default Footer;
