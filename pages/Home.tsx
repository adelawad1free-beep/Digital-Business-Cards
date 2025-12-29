
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Smartphone, Zap, Shield, Sparkles } from 'lucide-react';

interface HomeProps {
  lang: Language;
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ lang, onStart }) => {
  const t = (key: string) => TRANSLATIONS[key][lang];
  const isRtl = lang === 'ar';

  return (
    <div className={`min-h-screen bg-white ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-bold mb-8 animate-bounce">
            <Sparkles size={16} className={isRtl ? 'ml-2' : 'mr-2'} />
            {lang === 'en' ? 'AI-Powered Digital Cards' : 'بطاقات رقمية مدعومة بالذكاء الاصطناعي'}
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight leading-tight">
            {lang === 'en' ? 'Networking, ' : 'التواصل، '} 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              {lang === 'en' ? 'Reimagined.' : 'بأسلوب جديد.'}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('tagline')} {lang === 'en' ? 'Replace paper business cards with a smart, eco-friendly digital profile.' : 'استبدل بطاقاتك الورقية بملف شخصي ذكي وصديق للبيئة.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={onStart}
              className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              {t('createBtn')}
            </button>
            <button className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all">
              {lang === 'en' ? 'How it Works' : 'كيف يعمل؟'}
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 text-center md:text-start">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto md:mx-0">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{lang === 'en' ? 'Instant Sharing' : 'مشاركة فورية'}</h3>
            <p className="text-gray-600">
              {lang === 'en' ? 'Share your contact details via QR code, link, or NFC in seconds.' : 'شارك تفاصيل اتصالك عبر رمز QR أو رابط أو تقنية NFC في ثوانٍ.'}
            </p>
          </div>
          <div className="space-y-4 text-center md:text-start">
            <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center mx-auto md:mx-0">
              <Smartphone size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{lang === 'en' ? 'Mobile First' : 'الأولوية للجوال'}</h3>
            <p className="text-gray-600">
              {lang === 'en' ? 'Optimized for mobile devices. No app needed to view your profile.' : 'محسن للأجهزة المحمولة. لا يحتاج الطرف الآخر لتطبيق لمشاهدة ملفك.'}
            </p>
          </div>
          <div className="space-y-4 text-center md:text-start">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto md:mx-0">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{lang === 'en' ? 'Secure & Professional' : 'آمن واحترافي'}</h3>
            <p className="text-gray-600">
              {lang === 'en' ? 'Your data is yours. Control what you share and when you share it.' : 'بياناتك ملكك. تحكم فيما تشاركه ومتى تشاركه.'}
            </p>
          </div>
        </div>
      </div>

      {/* Showcase Image */}
      <div className="max-w-4xl mx-auto px-6 pb-24">
        <div className="rounded-[40px] overflow-hidden shadow-2xl border-8 border-gray-100 hover:scale-[1.01] transition-transform duration-500">
          <img 
            src="https://picsum.photos/seed/connect/1200/600" 
            alt="Product Showcase" 
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
