
import React from 'react';
import { CardData, Language } from '../types';
import CardPreview from '../components/CardPreview';
import { TRANSLATIONS } from '../constants';
import { Plus, ShieldCheck, Zap } from 'lucide-react';

interface PublicProfileProps {
  data: CardData;
  lang: Language;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ data, lang }) => {
  const isRtl = lang === 'ar';
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors ${data.isDark ? 'bg-[#050507]' : 'bg-slate-50'}`}>
      
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 animate-pulse"
          style={{ backgroundColor: data.themeColor }}
        />
        <div 
          className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-10"
          style={{ backgroundColor: data.themeColor }}
        />
      </div>

      <div className="w-full max-w-sm z-10 animate-fade-in-up">
        {/* Semantic Header for SEO */}
        <header className="sr-only">
          <h1>{data.name} - {data.title}</h1>
          <p>{data.bio}</p>
        </header>

        <CardPreview data={data} lang={lang} />
        
        <div className="mt-12 text-center pb-12">
          <div className="flex items-center justify-center gap-6 mb-8 text-gray-400">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck size={20} className="text-emerald-500/60" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{lang === 'ar' ? 'موثوق' : 'Verified'}</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Zap size={20} className="text-amber-500/60" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{lang === 'ar' ? 'سريع' : 'Instant'}</span>
            </div>
          </div>

          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            {lang === 'ar' ? `هوية رقمية بواسطة ${TRANSLATIONS.appName.ar}` : `Digital ID by ${TRANSLATIONS.appName.en}`}
          </p>
          
          <a 
            href={window.location.origin + window.location.pathname}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-black text-sm shadow-2xl hover:scale-105 transition-all border border-gray-100 dark:border-gray-800 group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
               <Plus size={18} />
            </div>
            {lang === 'ar' ? 'أنشئ بطاقتك الرقمية الآن' : 'Create Your Digital Card Now'}
          </a>

          {/* SEO Optimized Footer Text */}
          <div className="mt-12 max-w-xs mx-auto text-[9px] text-gray-400 leading-loose opacity-50">
            {lang === 'ar' 
              ? 'هويتي الرقمية هي وسيلتك العصرية لتبادل جهات الاتصال وبناء شبكة علاقات مهنية قوية. بطاقات أعمال ذكية تدعم كود QR وتقنيات المشاركة الفورية.' 
              : 'My Digital Identity is your modern way to exchange contacts and build a strong professional network. Smart business cards supporting QR codes and instant sharing.'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
