
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

  // دالة لتحويل الـ Hex إلى RGB
  const hexToRgb = (hex: string) => {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
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

    // 1. تحديث متغيرات الألوان للدوائر المتحركة (الـ Mesh)
    root.style.setProperty('--brand-primary', primary);
    root.style.setProperty('--brand-secondary', secondary);
    
    // 2. صبغ خلفية الموقع بالكامل بلون البطاقة (Tinting)
    // في الوضع الفاتح نستخدم اللون بنسبة 4% وفي المظلم بنسبة 8%
    const bgOpacity = data.isDark ? 0.08 : 0.04;
    const baseBg = data.isDark ? '#050507' : '#f8fafc';
    
    // حقن استايل مخصص للخلفية لضمان عدم ظهور الأبيض والأسود الصريح
    const styleId = 'dynamic-card-bg';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.innerHTML = `
      .mesh-bg { 
        background-color: ${baseBg} !important; 
        background-image: radial-gradient(circle at top right, rgba(${rgb.r},${rgb.g},${rgb.b}, ${bgOpacity}), transparent),
                          radial-gradient(circle at bottom left, rgba(${rgb.r},${rgb.g},${rgb.b}, ${bgOpacity}), transparent) !important;
      }
      .mesh-circle { opacity: ${data.isDark ? 0.2 : 0.3} !important; }
    `;

    // 3. تحديث الميتا وتفاصيل الصفحة
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
  }, [data, lang, isRtl]);

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

      {/* شريط الإجراءات السفلي */}
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
