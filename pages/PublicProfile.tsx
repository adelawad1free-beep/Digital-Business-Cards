
import React, { useEffect } from 'react';
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

  useEffect(() => {
    // 1. إعداد البيانات للحقن الديناميكي
    const cardName = data.name || (lang === 'ar' ? 'صاحب البطاقة' : 'Card Owner');
    const cardTitle = data.name ? `${data.name} | ${data.title}` : (lang === 'ar' ? 'هويتي الرقمية' : 'My Digital ID');
    const cardDesc = data.bio || (lang === 'ar' ? `تفضل بزيارة بطاقة أعمالي الرقمية وتواصل معي.` : `Connect with me via my Digital ID.`);
    const cardImg = data.profileImage || 'https://api.dicebear.com/7.x/shapes/svg?seed=identity';

    // 2. تحديث عنوان الصفحة
    document.title = cardTitle;

    // وظيفة مساعدة لتحديث أو إنشاء وسوم Meta بدقة عالية
    const updateOrCreateMeta = (attribute: string, attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // تحديث الوسوم الأساسية (Open Graph للفيسبوك وواتساب)
    updateOrCreateMeta('property', 'og:title', cardTitle);
    updateOrCreateMeta('property', 'og:description', cardDesc);
    updateOrCreateMeta('property', 'og:image', cardImg);
    updateOrCreateMeta('property', 'og:image:secure_url', cardImg);
    updateOrCreateMeta('property', 'og:url', window.location.href);
    updateOrCreateMeta('property', 'og:type', 'profile');
    updateOrCreateMeta('property', 'og:site_name', isRtl ? 'هويتي الرقمية' : 'My Digital Identity');

    // تحديث وسوم تويتر
    updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMeta('name', 'twitter:title', cardTitle);
    updateOrCreateMeta('name', 'twitter:description', cardDesc);
    updateOrCreateMeta('name', 'twitter:image', cardImg);

    // تحديث الوصف العام
    updateOrCreateMeta('name', 'description', cardDesc);

    // تحديث الأيقونة لتكون صورة الشخص فوراً
    const favicon = document.getElementById('site-favicon') as HTMLLinkElement;
    if (favicon && data.profileImage) {
      favicon.href = data.profileImage;
    }

  }, [data, lang]);

  const getPageBackgroundStyle = () => {
    if (data.themeType === 'gradient') {
      return { background: `${data.themeGradient}15` }; 
    }
    if (data.themeType === 'color') {
      return { backgroundColor: `${data.themeColor}08` }; 
    }
    return {};
  };
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors ${data.isDark ? 'bg-[#050507]' : 'bg-slate-50'}`} style={getPageBackgroundStyle()}>
      
      {/* عناصر خلفية ديناميكية */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 animate-pulse"
          style={data.themeType === 'gradient' ? { background: data.themeGradient } : { backgroundColor: data.themeColor }}
        />
        <div 
          className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-10"
          style={data.themeType === 'gradient' ? { background: data.themeGradient } : { backgroundColor: data.themeColor }}
        />
      </div>

      <div className="w-full max-w-sm z-10 animate-fade-in-up">
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
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
