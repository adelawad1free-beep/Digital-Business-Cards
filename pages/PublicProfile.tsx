
import React, { useEffect } from 'react';
import { CardData, Language, TemplateConfig } from '../types';
import CardPreview from '../components/CardPreview';
import { TRANSLATIONS } from '../constants';
import { downloadVCard } from '../utils/vcard';
import { Plus, UserPlus, Share2, AlertCircle, Coffee } from 'lucide-react';

interface PublicProfileProps {
  data: CardData;
  lang: Language;
  customConfig?: TemplateConfig; 
  siteIcon?: string;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ data, lang, customConfig, siteIcon }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];

  const hexToRgb = (hex: string) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return { r, g, b, string: `${r}, ${g}, ${b}` };
  };

  const getColors = () => {
    const primary = data.themeColor || '#3b82f6';
    let secondary = primary;
    if (data.themeType === 'gradient' && data.themeGradient) {
      const match = data.themeGradient.match(/#[a-fA-F0-9]{3,6}/g);
      if (match && match.length > 1) secondary = match[match.length - 1];
    }
    return { primary, secondary };
  };

  useEffect(() => {
    if (!data || data.isActive === false) return;

    const { primary, secondary } = getColors();
    const rgb = hexToRgb(primary);
    const root = document.documentElement;

    root.style.setProperty('--brand-primary', primary);
    root.style.setProperty('--brand-secondary', secondary);
    
    // الأولوية للون خلفية الصفحة المختار من لوحة التحكم
    const bgStrategy = data.pageBgStrategy || customConfig?.pageBgStrategy || 'solid';
    const customPageBg = data.pageBgColor || customConfig?.pageBgColor;
    const baseBg = customPageBg || (data.isDark ? '#050507' : '#f8fafc');
    
    const styleId = 'dynamic-card-bg';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    
    let backgroundCss = `background-color: ${baseBg} !important;`;
    
    // تطبيق استراتيجية الخلفية المطابقة للهيدر
    if (bgStrategy === 'mirror-header') {
      if (data.themeType === 'image' && data.backgroundImage) {
        backgroundCss = `
          background-color: ${baseBg} !important;
          background-image: url("${data.backgroundImage}") !important;
          background-size: cover !important;
          background-position: center bottom !important;
          background-attachment: fixed !important;
        `;
      } else if (data.themeType === 'gradient' && data.themeGradient) {
        backgroundCss = `
          background-color: ${baseBg} !important;
          background-image: ${data.themeGradient} !important;
          background-attachment: fixed !important;
        `;
      } else {
        backgroundCss = `background-color: ${data.themeColor} !important;`;
      }
      
      // إضافة طبقة زجاجية مشتتة فوق الخلفية المكررة
      backgroundCss += `
        position: relative;
      `;
    } else {
      // الوضع الطبيعي (Radial Gradients)
      const bgOpacity = data.isDark ? 0.12 : 0.06;
      backgroundCss += `
        background-image: radial-gradient(circle at 50% 30%, rgba(${rgb.r},${rgb.g},${rgb.b}, ${bgOpacity}), transparent 70%),
                          radial-gradient(circle at 50% 70%, rgba(${rgb.r},${rgb.g},${rgb.b}, ${bgOpacity}), transparent 70%) !important;
      `;
    }
    
    styleEl.innerHTML = `
      .mesh-bg { 
        ${backgroundCss}
      }
      ${bgStrategy === 'mirror-header' ? `
      .mesh-bg::after {
        content: '';
        position: absolute;
        inset: 0;
        backdrop-filter: blur(80px) saturate(150%);
        -webkit-backdrop-filter: blur(80px) saturate(150%);
        background: ${data.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.4)'};
        z-index: -1;
      }
      ` : ''}
      .mesh-circle { 
        opacity: ${data.isDark ? 0.15 : 0.25} !important; 
        left: 50% !important;
        right: auto !important;
        margin-left: -400px !important; 
      }
      .mesh-1 { top: -10% !important; }
      .mesh-2 { bottom: -10% !important; }
    `;

    const metaTheme = document.getElementById('meta-theme-color');
    if (metaTheme) metaTheme.setAttribute('content', primary);

    const clientName = data.name || (isRtl ? 'مستخدم هويتي' : 'NextID User');
    const fullPageTitle = data.title ? `${clientName} | ${data.title}` : clientName;
    document.title = fullPageTitle;

    const favicon = document.getElementById('site-favicon') as HTMLLinkElement;
    if (favicon && data.profileImage) favicon.href = data.profileImage;

    return () => {
      if (styleEl) styleEl.innerHTML = '';
    };
  }, [data, lang, isRtl, customConfig]);

  if (data.isActive === false) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${data.isDark ? 'bg-[#050507] text-white' : 'bg-slate-50 text-gray-900'}`}>
         <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl">
            <AlertCircle size={48} />
         </div>
         <h1 className="text-3xl font-black mb-4">{isRtl ? 'البطاقة غير متاحة' : 'Unavailable'}</h1>
         <a href="/" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">{isRtl ? 'العودة للرئيسية' : 'Back Home'}</a>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.name,
          text: isRtl ? `تواصل معي عبر بطاقتي الرقمية: ${data.name}` : `Connect with me: ${data.name}`,
          url: window.location.href,
        });
      } catch (err) {}
    }
  };

  const { primary } = getColors();
  const rgb = hexToRgb(primary);

  return (
    <article 
      className={`min-h-screen flex flex-col items-center p-4 relative transition-colors duration-1000 ${data.isDark ? 'dark' : ''}`}
    >
      <main className="w-full max-w-sm z-10 animate-fade-in-up pt-10 pb-32">
        <CardPreview data={data} lang={lang} customConfig={customConfig} hideSaveButton={true} />
        
        <div className="mt-12 text-center flex flex-col items-center gap-8">
          <nav>
            <a href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-black text-sm shadow-2xl hover:scale-105 transition-all border group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white group-hover:rotate-12 transition-transform" style={{ backgroundColor: primary }}>
                 <Plus size={18} />
              </div>
              {lang === 'ar' ? 'أنشئ بطاقتك الرقمية الآن' : 'Create Your Digital Card Now'}
            </a>
          </nav>

          <a 
            href="https://buymeacoffee.com/guidai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Coffee size={14} className="text-[#FFDD00] group-hover:animate-bounce" />
            <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors">
              {isRtl ? 'ادعم استمرار المشروع' : 'Support this project'}
            </span>
          </a>

          <div className="flex flex-col items-center gap-1 opacity-40">
             <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em]">
               {lang === 'ar' ? `هوية رقمية بواسطة ${TRANSLATIONS.appName.ar}` : `Digital ID by ${TRANSLATIONS.appName.en}`}
             </p>
             <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: primary }} />
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[100] animate-bounce-in">
         <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-[2.5rem] p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex items-center gap-3">
            <button 
              onClick={() => downloadVCard(data)}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase shadow-lg transition-all active:scale-95"
              style={{ backgroundColor: primary, boxShadow: `0 10px 25px -5px rgba(${rgb.string}, 0.4)` }}
            >
               <UserPlus size={18} />
               <span>{t('saveContact')}</span>
            </button>
            <button 
              onClick={handleShare}
              className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label="Share"
            >
               <Share2 size={20} />
            </button>
         </div>
      </div>
    </article>
  );
};

export default PublicProfile;
