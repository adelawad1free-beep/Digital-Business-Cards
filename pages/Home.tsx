
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Sparkles } from 'lucide-react';

interface HomeProps {
  lang: Language;
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ lang, onStart }) => {
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];
  const isRtl = lang === 'ar';

  // دمج المجموعات في سطرين فقط لضمان حجم أكبر وتصميم أضيق
  const row1Logos = [
    { name: 'Google', url: 'https://www.vectorlogo.zone/logos/google/google-ar21.svg' },
    { name: 'Apple', url: 'https://www.vectorlogo.zone/logos/apple/apple-ar21.svg' },
    { name: 'Microsoft', url: 'https://www.vectorlogo.zone/logos/microsoft/microsoft-ar21.svg' },
    { name: 'Meta', url: 'https://www.vectorlogo.zone/logos/facebook/facebook-ar21.svg' },
    { name: 'LinkedIn', url: 'https://www.vectorlogo.zone/logos/linkedin/linkedin-ar21.svg' },
    { name: 'Amazon', url: 'https://www.vectorlogo.zone/logos/amazon/amazon-ar21.svg' },
    { name: 'Aramco', url: 'https://upload.wikimedia.org/wikipedia/en/b/be/Saudi_Aramco_logo.svg' },
    { name: 'STC', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/STC_Logo.svg' },
    { name: 'Alibaba', url: 'https://www.vectorlogo.zone/logos/alibaba/alibaba-ar21.svg' },
    { name: 'Samsung', url: 'https://www.vectorlogo.zone/logos/samsung/samsung-ar21.svg' },
    { name: 'Tesla', url: 'https://www.vectorlogo.zone/logos/tesla/tesla-ar21.svg' },
    { name: 'Adobe', url: 'https://www.vectorlogo.zone/logos/adobe/adobe-ar21.svg' },
  ];

  const row2Logos = [
    { name: 'Emirates', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Emirates_logo.svg' },
    { name: 'Almarai', url: 'https://upload.wikimedia.org/wikipedia/en/d/df/Almarai_logo.svg' },
    { name: 'Zain', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Zain_logo.svg' },
    { name: 'Etisalat', url: 'https://upload.wikimedia.org/wikipedia/commons/1/14/Etisalat_Logo.svg' },
    { name: 'SABIC', url: 'https://upload.wikimedia.org/wikipedia/commons/6/64/SABIC_Logo.svg' },
    { name: 'NEOM', url: 'https://upload.wikimedia.org/wikipedia/en/d/de/Neom_logo.svg' },
    { name: 'Tencent', url: 'https://www.vectorlogo.zone/logos/tencent/tencent-ar21.svg' },
    { name: 'Xiaomi', url: 'https://www.vectorlogo.zone/logos/xiaomi/xiaomi-ar21.svg' },
    { name: 'Sony', url: 'https://www.vectorlogo.zone/logos/sony/sony-ar21.svg' },
    { name: 'Toyota', url: 'https://www.vectorlogo.zone/logos/toyota/toyota-ar21.svg' },
    { name: 'Huawei', url: 'https://www.vectorlogo.zone/logos/huawei/huawei-ar21.svg' },
    { name: 'TikTok', url: 'https://www.vectorlogo.zone/logos/tiktok/tiktok-ar21.svg' },
  ];

  // Fix: Use Partial to satisfy Record<Language, string[]> when only en and ar are provided
  const seoKeywords: Partial<Record<Language, string[]>> = {
    en: [
      "DIGITAL IDENTITY", "SMART BUSINESS CARDS", "NFC TECHNOLOGY", "QR CODE NETWORKING", 
      "PROFESSIONAL PROFILES", "VIRTUAL BUSINESS CARDS", "BIO LINK", "CONTACTLESS NETWORKING", 
      "PERSONAL BRANDING", "SMART CONTACT SHARING", "E-BUSINESS CARD", "SMART PROFILE",
      "DIGITAL ECOSYSTEM", "VCARD PLUS", "NETWORKING SOLUTIONS", "CORPORATE ID",
      "ELECTRONIC BUSINESS CARD", "PAPERLESS NETWORKING", "MOBILE IDENTITY", "SMART TAGS",
      "PROFILE BUILDER", "CONTACTLESS CARDS", "TECH NETWORKING", "DIGITAL CV",
      "PROFESSIONAL BIO", "IDENTITY MANAGEMENT", "LINKTREE ALTERNATIVE", "FREE DIGITAL CARD",
      "NFC FOR BUSINESS", "CUSTOM QR CODES", "SMART CARD DESIGNER", "IDENTITY HUB"
    ],
    ar: [
      "بطاقات أعمال رقمية", "هوية مهنية ذكية", "تقنية NFC", "باركود الأعمال", 
      "روابط التواصل المهني", "بروفايل ذكي", "كرت شخصي إلكتروني", "تواصل لا تلامسي", 
      "مشاركة جهات الاتصال", "كروت ذكية", "هويتي الرقمية", "تحول رقمي مهني",
      "رابط البيو", "بطاقة تواصل", "هوية الشركات", "التسويق الشخصي",
      "كروت NFC", "كيو ار كود", "منصة هويتي", "بروفايل مهني متكامل",
      "سيرة ذاتية رقمية", "تكنولوجيا الأعمال", "مشاركة بيانات بلمسة", "بطاقة الزيارة الذكية",
      "بطاقات بدون تلامس", "إدارة الهوية الرقمية", "كرت عمل مجاني", "تصميم كروت أونلاين",
      "حلول الشركات الذكية", "تحول رقمي متكامل", "باقة الأعمال", "منصة المبدعين"
    ]
  };

  const currentKeywords = seoKeywords[lang] || seoKeywords['en'] || [];
  const seoHeader = {
    en: "ADVANCED DIGITAL IDENTITY ECOSYSTEM & SERVICES",
    ar: "المنظومة المتكاملة لتقنيات وخدمات الهوية الرقمية الذكية"
  };

  const MarqueeRow = ({ logos, speedClass = "animate-marquee", reverse = false }: { logos: any[], speedClass?: string, reverse?: boolean }) => (
    <div className={`marquee-container relative w-full overflow-hidden ltr py-4 ${reverse ? 'flex-row-reverse' : ''}`}>
      <div className={`flex whitespace-nowrap ${speedClass} items-center`}>
        {logos.map((brand, i) => (
          <div key={`brand-1-${i}`} className="mx-8 md:mx-16 flex items-center justify-center shrink-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <img 
              src={brand.url} 
              alt={brand.name} 
              className="h-10 md:h-16 w-auto object-contain dark:invert" 
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ))}
        {logos.map((brand, i) => (
          <div key={`brand-2-${i}`} className="mx-8 md:mx-16 flex items-center justify-center shrink-0 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            <img 
              src={brand.url} 
              alt={brand.name} 
              className="h-10 md:h-16 w-auto object-contain dark:invert" 
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <main className={`min-h-[85vh] flex flex-col items-center justify-between bg-transparent ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 text-center animate-fade-in-up mt-12 md:mt-20">
        <div className="inline-flex items-center px-5 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold mb-12 shadow-sm border border-blue-100 dark:border-blue-800/30">
          <span className={isRtl ? 'order-2' : 'order-1'}>{t('heroBadge')}</span>
          <Sparkles size={16} className={`${isRtl ? 'mr-2 order-1' : 'ml-2 order-2'}`} aria-hidden="true" />
        </div>

        <h1 className="text-4xl md:text-[5.5rem] font-black text-[#1e293b] dark:text-white mb-8 tracking-tight leading-[1.1] md:leading-[1.1]">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600">
            {t('heroTitle')}
          </span>
        </h1>

        <h2 className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-16 leading-relaxed font-medium">
          {t('heroDesc')}
        </h2>

        <div className="flex justify-center items-center mb-16">
          <button 
            onClick={onStart}
            className="w-full sm:w-auto px-14 py-6 bg-[#0f172a] dark:bg-blue-600 text-white rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/10"
          >
            {t('createBtn')}
          </button>
        </div>
      </section>

      {/* Global Brands Section - Compact 2-Row Layout */}
      <section className="w-full py-12 md:py-16 bg-transparent overflow-hidden space-y-4">
        <div className="text-center mb-4">
           <h3 className="text-[10px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-[0.5em]">
             {isRtl ? 'موثوق من قبل رواد الأعمال عالمياً' : 'TRUSTED BY PROFESSIONALS WORLDWIDE'}
           </h3>
        </div>
        
        <MarqueeRow logos={row1Logos} speedClass="animate-marquee" />
        <MarqueeRow logos={row2Logos} speedClass="animate-marquee" reverse={true} />
      </section>

      {/* Expanded SEO Keywords Block */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-16 border-t border-gray-100 dark:border-gray-800/50 mt-auto">
        <div className="flex flex-col items-center gap-8">
          <h3 className="text-[10px] md:text-[12px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-[0.4em] text-center border-b border-gray-100 dark:border-gray-800 pb-4 w-full max-w-md">
            {(seoHeader as any)[lang] || (seoHeader as any)['en']}
          </h3>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 max-w-6xl opacity-60 dark:opacity-50 text-center">
            {currentKeywords.map((keyword, index) => (
              <React.Fragment key={index}>
                <span className="text-[9px] md:text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest hover:text-blue-500 transition-all cursor-default hover:scale-105">
                  {keyword}
                </span>
                {index < currentKeywords.length - 1 && (
                  <span className="text-gray-200 dark:text-gray-800 select-none font-thin" aria-hidden="true">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Home;
