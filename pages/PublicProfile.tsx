
import React, { useEffect } from 'react';
import { CardData, Language, TemplateConfig } from '../types';
import CardPreview from '../components/CardPreview';
import { TRANSLATIONS } from '../constants';
import { downloadVCard } from '../utils/vcard';
import { Plus, UserPlus, Share2, AlertCircle } from 'lucide-react';

interface PublicProfileProps {
  data: CardData;
  lang: Language;
  customConfig?: TemplateConfig; 
  siteIcon?: string; // إضافة تمرير أيقونة الموقع
}

const PublicProfile: React.FC<PublicProfileProps> = ({ data, lang, customConfig, siteIcon }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];

  useEffect(() => {
    if (!data || data.isActive === false) return;

    // تجهيز البيانات للاستخدام في الـ Meta Tags
    const cardTitle = data.name ? `${data.name} | ${data.title}` : (lang === 'ar' ? 'هويتي الرقمية' : 'My Digital ID');
    const cardDesc = data.bio || (lang === 'ar' ? `تفضل بزيارة بطاقة أعمالي الرقمية وتواصل معي.` : `Connect with me via my Digital ID.`);
    // استخدام صورة البروفايل كصورة معاينة للمشاركة
    const cardImg = data.profileImage || siteIcon || 'https://api.dicebear.com/7.x/shapes/svg?seed=identity';

    // تحديث عنوان التبويب
    document.title = cardTitle;

    // وظيفة لتحديث أو إنشاء وسوم الميتا
    const updateMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector);
      if (el) {
        el.setAttribute(attr, value);
      } else {
        const newMeta = document.createElement('meta');
        if (selector.includes('property')) {
          newMeta.setAttribute('property', selector.split('"')[1]);
        } else if (selector.includes('name')) {
          newMeta.setAttribute('name', selector.split('"')[1]);
        }
        newMeta.setAttribute(attr, value);
        document.head.appendChild(newMeta);
      }
    };

    // تحديث كافة وسوم المعاينة (Open Graph)
    updateMeta('title', 'text', cardTitle);
    updateMeta('meta[name="description"]', 'content', cardDesc);
    updateMeta('meta[property="og:title"]', 'content', cardTitle);
    updateMeta('meta[property="og:description"]', 'content', cardDesc);
    updateMeta('meta[property="og:image"]', 'content', cardImg);
    updateMeta('meta[property="og:url"]', 'content', window.location.href);
    updateMeta('meta[name="twitter:title"]', 'content', cardTitle);
    updateMeta('meta[name="twitter:description"]', 'content', cardDesc);
    updateMeta('meta[name="twitter:image"]', 'content', cardImg);

    // تحديث الفافيكون (Favicon) ليكون صورة الشخص أو أيقونة الموقع
    const favicon = document.getElementById('site-favicon') as HTMLLinkElement;
    if (favicon) {
      favicon.href = data.profileImage || siteIcon || favicon.href;
    }

  }, [data, lang, siteIcon]);

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
            {isRtl ? 'تم تعطيل هذه البطاقة مؤقتاً بواسطة المسؤول أو صاحب البطاقة. يرجى المحاولة لاحقاً.' : 'This card has been temporarily disabled. Please try again later.'}
         </p>
         <a href="/" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">
            {isRtl ? 'أنشئ بطاقتك الخاصة' : 'Create Your Own Card'}
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
        
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            {lang === 'ar' ? `هوية رقمية بواسطة ${TRANSLATIONS.appName.ar}` : `Digital ID by ${TRANSLATIONS.appName.en}`}
          </p>
          <nav>
            <a href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-black text-sm shadow-2xl hover:scale-105 transition-all border group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
                 <Plus size={18} />
              </div>
              {lang === 'ar' ? 'أنشئ بطاقتك الرقمية الآن' : 'Create Your Digital Card Now'}
            </a>
          </nav>
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
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-in {
          0% { transform: translate(-50%, 100px); opacity: 0; }
          60% { transform: translate(-50%, -10px); opacity: 1; }
          100% { transform: translate(-50%, 0); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}} />
    </article>
  );
};

export default PublicProfile;
