import React, { useEffect, useState } from 'react';
import { CardData, Language, TemplateConfig } from '../types';
import CardPreview from '../components/CardPreview';
import { TRANSLATIONS, PATTERN_PRESETS } from '../constants';
import { downloadVCard } from '../utils/vcard';
import { Plus, UserPlus, Share2, AlertCircle, Coffee, Loader2, PowerOff } from 'lucide-react';
import { generateShareUrl } from '../utils/share';

interface PublicProfileProps {
  data: CardData;
  lang: Language;
  customConfig?: TemplateConfig; 
  siteIcon?: string;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ data, lang, customConfig, siteIcon }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];
  const [isCapturing, setIsCapturing] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const root = document.documentElement;

    root.style.setProperty('--brand-primary', primary);
    root.style.setProperty('--brand-secondary', secondary);
    
    const customPageBg = data.pageBgColor || customConfig?.pageBgColor;
    const baseBg = customPageBg || (data.isDark ? '#050507' : '#f8fafc');
    
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
        background-image: none !important;
      }
      .mesh-bg::after { display: none !important; }
    `;

    const metaTheme = document.getElementById('meta-theme-color');
    if (metaTheme) metaTheme.setAttribute('content', primary);

    const clientName = data.name || (isRtl ? 'مستخدم هويتي' : 'NextID User');
    const clientTitle = data.title || (isRtl ? 'بطاقة شخصية ذكية' : 'Digital Business Card');
    const fullTitle = `${clientName} | ${clientTitle} | NextID`;
    document.title = fullTitle;

    const metaDesc = document.querySelector('meta[name="description"]');
    const descText = isRtl 
      ? `تواصل مع ${clientName} (${clientTitle}) عبر بطاقته الرقمية الذكية على منصة هويتي. شارك جهات الاتصال بلمسة واحدة.`
      : `Connect with ${clientName} (${clientTitle}) via their professional digital card on NextID. Smart contact sharing in one tap.`;
    if (metaDesc) metaDesc.setAttribute('content', descText);

    const updateMeta = (selector: string, attr: string, value: string) => {
      const el = document.querySelector(selector);
      if (el) el.setAttribute(attr, value);
    };

    updateMeta('meta[property="og:title"]', 'content', fullTitle);
    updateMeta('meta[property="og:description"]', 'content', descText);
    updateMeta('meta[name="twitter:title"]', 'content', fullTitle);
    updateMeta('meta[name="twitter:description"]', 'content', descText);
    
    const favicon = document.getElementById('site-favicon') as HTMLLinkElement;
    if (data.profileImage && favicon) {
      updateMeta('meta[property="og:image"]', 'content', data.profileImage);
      updateMeta('meta[name="twitter:image"]', 'content', data.profileImage);
      favicon.href = data.profileImage;
    }

    return () => { 
      if (styleEl) styleEl.innerHTML = ''; 
      if (favicon && siteIcon) {
        favicon.href = siteIcon;
      }
    };
  }, [data, lang, isRtl, customConfig, siteIcon]);

  const handleShare = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    const url = generateShareUrl(data);
    const professionalText = isRtl 
      ? `*${data.name}*\nتواصل معي عبر بطاقتي الرقمية:\n${url}`
      : `*${data.name}*\nConnect with me via my digital card:\n${url}`;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const target = document.getElementById('public-capture-area');
      if (!target) throw new Error("Target not found");

      // @ts-ignore
      const canvas = await window.html2canvas(target, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
        backgroundColor: data.isDark ? '#0a0a0c' : '#ffffff',
        width: 400,
        height: 700
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));

      if (blob && navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'card.jpg', { type: 'image/jpeg' })] })) {
        await navigator.share({
          files: [new File([blob], `${data.id}.jpg`, { type: 'image/jpeg' })],
          title: data.name,
          text: professionalText
        });
      } else {
        if (navigator.share) {
          await navigator.share({
            title: data.name,
            text: professionalText,
            url: url
          });
        } else {
          navigator.clipboard.writeText(url);
          alert(isRtl ? "تم نسخ الرابط" : "Link copied");
        }
      }
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  if (data.isActive === false) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${data.isDark ? 'bg-[#050507] text-white' : 'bg-slate-50 text-gray-900'}`}>
         <div className="w-24 h-24 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl">
            <PowerOff size={48} />
         </div>
         <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter">
            {isRtl ? 'البطاقة معطلة حالياً' : 'Card Disabled'}
         </h1>
         <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-8 font-bold leading-relaxed">
            {isRtl 
              ? 'قام صاحب هذه البطاقة بإيقاف تفعيلها مؤقتاً. يرجى المحاولة مرة أخرى لاحقاً أو التواصل معه عبر وسيلة أخرى.' 
              : 'The owner of this card has temporarily disabled it. Please try again later or contact them via other means.'}
         </p>
         <a href="/" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">
            {isRtl ? 'العودة للرئيسية' : 'Back Home'}
         </a>
      </div>
    );
  }

  const { primary } = getColors();
  const rgb = hexToRgb(primary);
  
  // منطق الترويسة الممتدة: تعمل فقط على أجهزة الكمبيوتر (شاشة أكبر من 1024)
  const isDesktop = windowWidth >= 1024;
  const isFullHeaderEnabled = customConfig?.desktopLayout === 'full-width-header' && isDesktop;

  // فصل منطق الإزاحة التام:
  // في الجوال: نستخدم mobileBodyOffsetY كإزاحة داخلية لجسم البطاقة.
  // في سطح المكتب (الترويسة الممتدة): نستخدم desktopBodyOffsetY لسحب البطاقة بالكامل للأعلى.
  const cardBodyOffset = isDesktop ? 0 : (customConfig?.mobileBodyOffsetY ?? 0);
  const containerMarginTop = isFullHeaderEnabled 
    ? (customConfig?.desktopBodyOffsetY ?? -60) 
    : 0;

  return (
    <article className={`min-h-screen flex flex-col items-center relative transition-colors duration-1000 ${data.isDark ? 'dark' : ''}`}>
      
      <div className="fixed top-0 left-0 -translate-x-[3000px] pointer-events-none" style={{ width: '400px' }}>
          <div id="public-capture-area" className="bg-white dark:bg-black overflow-hidden" style={{ width: '400px', minHeight: '700px' }}>
             <CardPreview data={data} lang={lang} customConfig={customConfig} hideSaveButton={true} isFullFrame={true} />
          </div>
      </div>

      {/* الترويسة الممتدة (تظهر فقط في وضع سطح المكتب إذا تم اختيارها) */}
      {isFullHeaderEnabled && (
        <div className="w-full overflow-hidden relative shrink-0" style={{ height: `${customConfig?.headerHeight}px` }}>
           <div className="absolute inset-0 z-0">
              {data.themeType === 'image' && data.backgroundImage && (
                <img src={data.backgroundImage} className="w-full h-full object-cover" alt="Full Header" />
              )}
              {data.themeType === 'gradient' && (
                <div className="w-full h-full" style={{ background: data.themeGradient }} />
              )}
              {data.themeType === 'color' && (
                <div className="w-full h-full" style={{ backgroundColor: data.themeColor }} />
              )}
              {customConfig?.headerPatternId && customConfig.headerPatternId !== 'none' && (
                <div className="absolute inset-0 pointer-events-none opacity-[0.2]" 
                     style={{ 
                       backgroundImage: `url("data:image/svg+xml;base64,${window.btoa((PATTERN_PRESETS.find(p => p.id === customConfig.headerPatternId)?.svg || '').replace('currentColor', data.isDark ? '#ffffff' : '#000000'))}")`,
                       backgroundSize: `${customConfig.headerPatternScale || 100}%`,
                       opacity: (customConfig.headerPatternOpacity || 20) / 100
                     }} />
              )}
           </div>
           {customConfig?.headerGlassy && (
              <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: data.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)' }} />
           )}
        </div>
      )}

      <main 
        className="w-full z-10 animate-fade-in-up pb-32 transition-all duration-700 mx-auto flex justify-center" 
        style={{ 
          maxWidth: isFullHeaderEnabled ? '100%' : `${customConfig?.cardMaxWidth || 500}px`,
          marginTop: `${containerMarginTop}px`
        }}
      >
        <div className="w-full" style={{ maxWidth: `${customConfig?.cardMaxWidth || 500}px` }}>
           <CardPreview 
             data={data} 
             lang={lang} 
             customConfig={customConfig} 
             hideSaveButton={true} 
             hideHeader={isFullHeaderEnabled} 
             bodyOffsetYOverride={cardBodyOffset}
           />
           
           <div className="mt-12 text-center flex flex-col items-center gap-8 px-6">
              <nav>
                <a href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-black text-sm shadow-2xl hover:scale-105 transition-all border group">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white group-hover:rotate-12 transition-transform" style={{ backgroundColor: primary }}>
                     <Plus size={18} />
                  </div>
                  {lang === 'ar' ? 'أنشئ بطاقتك الرقمية الآن' : 'Create Your Digital Card Now'}
                </a>
              </nav>

              <a href="https://buymeacoffee.com/guidai" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <Coffee size={14} className="text-[#FFDD00] group-hover:animate-bounce" />
                <span className="text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-white transition-colors">{isRtl ? 'ادعم استمرار المشروع' : 'Support this project'}</span>
              </a>

              <div className="flex flex-col items-center gap-1 opacity-40">
                 <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em]">{lang === 'ar' ? `هوية رقمية بواسطة ${TRANSLATIONS.appName.ar}` : `Digital ID by ${TRANSLATIONS.appName.en}`}</p>
                 <div className="w-12 h-0.5 rounded-full" style={{ backgroundColor: primary }} />
              </div>
            </div>
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100] animate-bounce-in">
         <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-[2.5rem] p-3 shadow-[0_25px_50_px_-12px_rgba(0,0,0,0.5)] flex items-center gap-3">
            <button 
              onClick={() => downloadVCard(data)}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase shadow-lg transition-all active:scale-95"
              style={{ backgroundColor: primary, boxShadow: `0 10px 25px -5px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)` }}
            >
               <UserPlus size={18} />
               <span>{t('saveContact')}</span>
            </button>
            <button 
              onClick={handleShare}
              disabled={isCapturing}
              className="p-4 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-3xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              aria-label="Share"
            >
               {isCapturing ? <Loader2 size={20} className="animate-spin" /> : <Share2 size={20} />}
            </button>
         </div>
      </div>
    </article>
  );
};

export default PublicProfile;