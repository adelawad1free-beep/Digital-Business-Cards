
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Sparkles, Zap, Smartphone, Share2, ShieldCheck, ArrowRight, MousePointer2 } from 'lucide-react';

interface HomeProps {
  lang: Language;
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ lang, onStart }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  const isRtl = lang === 'ar';

  const features = [
    {
      icon: Zap,
      title: isRtl ? 'تواصل فوري' : 'Instant Connection',
      desc: isRtl ? 'شارك بياناتك بلمسة واحدة عبر تقنية NFC أو الباركود.' : 'Share your info with one tap via NFC or QR code.'
    },
    {
      icon: Smartphone,
      title: isRtl ? 'تصميم متجاوب' : 'Responsive Design',
      desc: isRtl ? 'بطاقتك تظهر بأناقة على جميع أنواع الهواتف والأجهزة.' : 'Your card looks elegant on all phones and devices.'
    },
    {
      icon: Share2,
      title: isRtl ? 'تحديث غير محدود' : 'Unlimited Updates',
      desc: isRtl ? 'عدل بياناتك في أي وقت وسيتم تحديثها تلقائياً عند الجميع.' : 'Edit your info anytime and it updates instantly for everyone.'
    },
    {
      icon: ShieldCheck,
      title: isRtl ? 'أمان وخصوصية' : 'Secure & Private',
      desc: isRtl ? 'بياناتك محمية ومشفرة بأعلى معايير الأمان العالمية.' : 'Your data is protected and encrypted with top security standards.'
    }
  ];

  return (
    <div className={`flex flex-col items-center w-full ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/20 blur-[120px] rounded-full animate-pulse"></div>
        </div>

        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-black mb-8 border border-blue-100 dark:border-blue-800/30 animate-fade-in">
          <Sparkles size={14} />
          {t('heroBadge')}
        </div>

        <h1 className="text-5xl md:text-[6.5rem] font-black text-[#0f172a] dark:text-white mb-10 tracking-tighter leading-[1] md:leading-[0.95]">
          <span className="block">{isRtl ? 'هويتك الرقمية' : 'Your Digital'}</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600">
            {isRtl ? 'بلمسة واحدة' : 'Identity In A Tap'}
          </span>
        </h1>

        <p className="text-lg md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
          {t('heroDesc')}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
          <button 
            onClick={onStart}
            className="group w-full sm:w-auto px-16 py-7 bg-blue-600 text-white rounded-3xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-4"
          >
            {t('createBtn')}
            <ArrowRight size={24} className={`transition-transform group-hover:translate-x-2 ${isRtl ? 'rotate-180 group-hover:-translate-x-2' : ''}`} />
          </button>
        </div>

        {/* Floating Mockup Preview */}
        <div className="mt-24 relative w-full max-w-3xl mx-auto animate-float">
          <div className="absolute inset-0 bg-blue-600/5 blur-[100px] rounded-full"></div>
          <div className="relative bg-white dark:bg-gray-900 rounded-[3rem] p-4 border-[12px] border-gray-900 dark:border-gray-800 shadow-2xl aspect-[16/9] md:aspect-[21/9] flex items-center justify-center">
             <div className="flex items-center gap-8 px-10">
                <div className="hidden md:block w-32 h-32 rounded-3xl bg-blue-50 dark:bg-blue-900/20 animate-pulse"></div>
                <div className="space-y-4">
                   <div className="w-48 md:w-64 h-8 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                   <div className="w-32 md:w-40 h-4 bg-gray-50 dark:bg-gray-800/50 rounded-full"></div>
                   <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20"></div>
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20"></div>
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20"></div>
                   </div>
                </div>
             </div>
             <div className="absolute -bottom-6 -right-6 md:-right-12 bg-white dark:bg-gray-800 p-4 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-3">
                <div className="p-3 bg-emerald-500 text-white rounded-2xl"><Zap size={24}/></div>
                <div className="text-start">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'تحديث مباشر' : 'LIVE UPDATE'}</p>
                   <p className="text-sm font-black dark:text-white">{isRtl ? 'جاهز للمشاركة' : 'Ready to Share'}</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-7xl mx-auto px-6 py-24 border-t border-gray-100 dark:border-gray-800/50">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-10 bg-white dark:bg-[#121215] rounded-[3rem] border border-gray-100 dark:border-gray-800 hover:border-blue-500/50 transition-all duration-500 group shadow-sm hover:shadow-xl">
              <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <f.icon size={32} />
              </div>
              <h3 className="text-xl font-black dark:text-white mb-4 uppercase tracking-tight">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed font-bold">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer */}
      <section className="w-full max-w-5xl mx-auto px-6 py-20 mb-20">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[4rem] p-12 md:p-20 text-center text-white shadow-2xl shadow-blue-500/30 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><Share2 size={200} /></div>
           <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">{isRtl ? 'هل أنت مستعد للانضمام لمستقبل التواصل؟' : 'Ready to Join the Future of Networking?'}</h2>
           <p className="text-lg md:text-xl text-blue-100 mb-12 max-w-2xl mx-auto font-bold opacity-80">
             {isRtl ? 'ابدأ الآن مجاناً وأنشئ هويتك الرقمية الاحترافية في أقل من دقيقة.' : 'Start now for free and create your professional digital identity in less than a minute.'}
           </p>
           <button 
             onClick={onStart}
             className="px-14 py-6 bg-white text-blue-600 rounded-2xl font-black text-xl hover:scale-110 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-4 mx-auto"
           >
             <MousePointer2 size={24} />
             {isRtl ? 'أنشئ بطاقتك الآن' : 'Create Your Card Now'}
           </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
