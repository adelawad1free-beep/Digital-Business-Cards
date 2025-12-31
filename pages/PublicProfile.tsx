
import React, { useEffect } from 'react';
import { CardData, Language, TemplateConfig } from '../types';
import CardPreview from '../components/CardPreview';
import { TRANSLATIONS } from '../constants';
import { downloadVCard } from '../utils/vcard';
import { Plus, UserPlus, Share2 } from 'lucide-react';

interface PublicProfileProps {
  data: CardData;
  lang: Language;
  customConfig?: TemplateConfig; 
}

const PublicProfile: React.FC<PublicProfileProps> = ({ data, lang, customConfig }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];

  useEffect(() => {
    const cardTitle = data.name ? `${data.name} | ${data.title}` : (lang === 'ar' ? 'هويتي الرقمية' : 'My Digital ID');
    const cardDesc = data.bio || (lang === 'ar' ? `تفضل بزيارة بطاقة أعمالي الرقمية وتواصل معي.` : `Connect with me via my Digital ID.`);
    const cardImg = data.profileImage || 'https://api.dicebear.com/7.x/shapes/svg?seed=identity';

    document.title = cardTitle;

    const updateOrCreateMeta = (attribute: string, attrValue: string, content: string) => {
      let el = document.querySelector(`meta[${attribute}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attribute, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateOrCreateMeta('property', 'og:title', cardTitle);
    updateOrCreateMeta('property', 'og:description', cardDesc);
    updateOrCreateMeta('property', 'og:image', cardImg);
    updateOrCreateMeta('property', 'og:url', window.location.href);
    updateOrCreateMeta('property', 'og:type', 'profile');
    updateOrCreateMeta('name', 'twitter:card', 'summary_large_image');
    updateOrCreateMeta('name', 'description', cardDesc);

    const favicon = document.getElementById('site-favicon') as HTMLLinkElement;
    if (favicon && data.profileImage) favicon.href = data.profileImage;
  }, [data, lang]);

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
          text: data.title,
          url: window.location.href,
        });
      } catch (err) {}
    }
  };
  
  return (
    <div className={`min-h-screen flex flex-col items-center p-4 relative overflow-x-hidden transition-colors ${data.isDark ? 'bg-[#050507]' : 'bg-slate-50'}`} style={getPageBackgroundStyle()}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 animate-pulse"
          style={data.themeType === 'gradient' ? { background: data.themeGradient } : { backgroundColor: data.themeColor }}
        />
      </div>

      <div className="w-full max-w-sm z-10 animate-fade-in-up pt-10 pb-32">
        {/* نمرر hideSaveButton={true} هنا لمنع التكرار */}
        <CardPreview data={data} lang={lang} customConfig={customConfig} hideSaveButton={true} />
        
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            {lang === 'ar' ? `هوية رقمية بواسطة ${TRANSLATIONS.appName.ar}` : `Digital ID by ${TRANSLATIONS.appName.en}`}
          </p>
          <a href="/" className="inline-flex items-center gap-3 px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl font-black text-sm shadow-2xl hover:scale-105 transition-all border group">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white group-hover:rotate-12 transition-transform">
               <Plus size={18} />
            </div>
            {lang === 'ar' ? 'أنشئ بطاقتك الرقمية الآن' : 'Create Your Digital Card Now'}
          </a>
        </div>
      </div>

      {/* الشريط السفلي العائم هو الزر الوحيد الظاهر الآن */}
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
    </div>
  );
};

export default PublicProfile;
