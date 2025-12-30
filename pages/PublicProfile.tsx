
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
    // 1. تحديث لون المتصفح
    const metaThemeColor = document.getElementById('meta-theme-color');
    if (metaThemeColor) {
      const color = data.themeType === 'color' ? data.themeColor : '#3b82f6';
      metaThemeColor.setAttribute('content', color);
    }

    // 2. تحديث معلومات المعاينة (SEO & Open Graph)
    const cardTitle = `${data.name} | ${data.title}`;
    const cardDesc = data.bio || (lang === 'ar' ? `تواصل مع ${data.name} عبر هويته الرقمية.` : `Connect with ${data.name} via their Digital ID.`);
    const cardImg = data.profileImage || 'https://picsum.photos/seed/digital-id/1200/630';

    document.title = cardTitle;
    document.getElementById('og-title')?.setAttribute('content', cardTitle);
    document.getElementById('twitter-title')?.setAttribute('content', cardTitle);
    
    document.getElementById('meta-description')?.setAttribute('content', cardDesc);
    document.getElementById('og-description')?.setAttribute('content', cardDesc);
    document.getElementById('twitter-description')?.setAttribute('content', cardDesc);
    
    document.getElementById('og-image')?.setAttribute('content', cardImg);
    document.getElementById('twitter-image')?.setAttribute('content', cardImg);
    document.getElementById('og-url')?.setAttribute('content', window.location.href);

    // 3. Schema.org
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": data.name,
      "jobTitle": data.title,
      "worksFor": {
        "@type": "Organization",
        "name": data.company
      },
      "url": window.location.href,
      "image": cardImg,
      "description": data.bio,
      "sameAs": data.socialLinks.map(link => link.url)
    };

    const scriptId = 'json-ld-schema';
    let scriptQuery = document.getElementById(scriptId);
    if (scriptQuery) {
      scriptQuery.innerText = JSON.stringify(schemaData);
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      script.innerText = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }

    return () => {
      const script = document.getElementById(scriptId);
      if (script) script.remove();
    };
  }, [data, lang]);

  const getPageBackgroundStyle = () => {
    if (data.themeType === 'gradient') {
      return { background: `${data.themeGradient}22` }; // Very light version of the gradient
    }
    if (data.themeType === 'color') {
      return { backgroundColor: `${data.themeColor}11` }; // Very light version of the color
    }
    return {};
  };
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors ${data.isDark ? 'bg-[#050507]' : 'bg-slate-50'}`} style={getPageBackgroundStyle()}>
      
      {/* Dynamic Background Elements */}
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
