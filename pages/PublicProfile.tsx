
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

  useEffect(() => {
    if (!data || data.isActive === false) return;

    // تجهيز البيانات الديناميكية للعميل
    const clientName = data.name || (isRtl ? 'مستخدم هويتي' : 'NextID User');
    const clientTitle = data.title || '';
    const fullPageTitle = clientTitle ? `${clientName} | ${clientTitle}` : clientName;
    const clientBio = data.bio || (isRtl ? `تفضل بزيارة بطاقتي الرقمية وتواصل معي.` : `View my digital business card.`);
    const previewImage = data.profileImage || siteIcon || 'https://api.dicebear.com/7.x/shapes/svg?seed=identity';

    // 1. تحديث عنوان التبويب في المتصفح
    document.title = fullPageTitle;

    // 2. وظيفة ذكية لتحديث أو إنشاء وسوم الميتا (Meta Tags) لضمان المعاينة
    const setMetaTag = (property: string, content: string, isProperty = true) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // تحديث كافة الوسوم المطلوبة لمنصات التواصل (WhatsApp, FB, X)
    setMetaTag('description', clientBio, false);
    setMetaTag('og:title', fullPageTitle);
    setMetaTag('og:description', clientBio);
    setMetaTag('og:image', previewImage);
    setMetaTag('og:url', window.location.href);
    setMetaTag('og:type', 'profile');
    
    setMetaTag('twitter:card', 'summary_large_image', false);
    setMetaTag('twitter:title', fullPageTitle, false);
    setMetaTag('twitter:description', clientBio, false);
    setMetaTag('twitter:image', previewImage, false);

    // تحديث أيقونة الموقع المصغرة لتكون صورة العميل (لمسة احترافية إضافية)
    const favicon = document.getElementById('site-favicon') as HTMLLinkElement;
    if (favicon && data.profileImage) {
      favicon.href = data.profileImage;
    }

    // تنظيف العناوين عند مغادرة الصفحة (اختياري)
    return () => {
      document.title = isRtl ? 'هويتي الرقمية' : 'My Digital Identity';
    };
  }, [data, lang, siteIcon, isRtl]);

  if (data.isActive === false) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${data.isDark ? 'bg-[#050507] text-white' : 'bg-slate-50 text-gray-900'}`}>
         <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl">
            <AlertCircle size={48} />
         </div>
         <h1 className="text-3xl font-black mb-4">
            {isRtl ? 'البطاقة غير متاحة حالياً' : 'Card Currently Unavailable'}
         </h1>
         <p className="text-gray-500 dark:text-gray-400 max-w-xs font-bold leading-relaxed mb-10">
            {isRtl ? 'تم تعطيل هذه البطاقة مؤقتاً بواسطة المسؤول أو صاحب البطاقة.' : 'This card has been temporarily disabled.'}
         </p>
         <a href="/" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">
            {isRtl ? 'العودة للرئيسية' : 'Back to Home'}
         </a>
      </div>
    );
  }

  const getPageBackgroundStyle = () => {
    if (data.themeType === 'gradient') return { background: `${data.themeGradient}15` }; 
    if (data.themeType === 'color') return { backgroundColor: `${data.themeColor}08` }; 
    return {};
  };

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
  
  return (
    <article className={`min-h-screen flex flex-col items-center p-4 relative overflow-x-hidden transition-colors ${data.isDark ? 'bg-[#050507]' : 'bg-slate-50'}`} style={getPageBackgroundStyle()}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div 
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 animate-pulse"
          style={data.themeType === 'gradient' ? { background: data.themeGradient } : { backgroundColor: data.themeColor }}
        />
      </div>

      <main className="w-full max-w-sm z-10 animate-fade-in-up pt-10 pb-32">
        <CardPreview data={data} lang={lang} customConfig={customConfig} hideSaveButton={true} />
        
        <div className="mt-12 text-center flex flex-col items-center gap-8">
          <nav>
            <a href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-black text-sm shadow-2xl hover:scale-105 transition-all border group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
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

          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
            {lang === 'ar' ? `هوية رقمية بواسطة ${TRANSLATIONS.appName.ar}` : `Digital ID by ${TRANSLATIONS.appName.en}`}
          </p>
        </div>
      </main>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-[100] animate-bounce-in">
         <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-800 rounded-[2.5rem] p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] flex items-center gap-3">
            <button 
              onClick={() => downloadVCard(data)}
              className="flex-1 flex items-center justify-center gap-3 py-4 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
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
