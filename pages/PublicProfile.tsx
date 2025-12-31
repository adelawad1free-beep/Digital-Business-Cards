
import React, { useEffect } from 'react';
import { CardData, Language, TemplateConfig } from '../types';
import CardPreview from '../components/CardPreview';
import { TRANSLATIONS } from '../constants';
import { Plus, ShieldCheck, Zap } from 'lucide-react';

interface PublicProfileProps {
  data: CardData;
  lang: Language;
  customConfig?: TemplateConfig; // دعم إعدادات القالب المخصص من الأدمن
}

const PublicProfile: React.FC<PublicProfileProps> = ({ data, lang, customConfig }) => {
  const isRtl = lang === 'ar';

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
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors ${data.isDark ? 'bg-[#050507]' : 'bg-slate-50'}`} style={getPageBackgroundStyle()}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 animate-pulse"
          style={data.themeType === 'gradient' ? { background: data.themeGradient } : { backgroundColor: data.themeColor }}
        />
      </div>

      <div className="w-full max-w-sm z-10 animate-fade-in-up">
        <CardPreview data={data} lang={lang} customConfig={customConfig} />
        
        <div className="mt-12 text-center pb-12">
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
    </div>
  );
};

export default PublicProfile;
