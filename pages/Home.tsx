
import React, { useEffect, useState } from 'react';
import { Language, PricingPlan } from '../types';
import { TRANSLATIONS } from '../constants';
import { getAllPricingPlans } from '../services/firebase';
import * as LucideIcons from 'lucide-react';
import { 
  Zap, Smartphone, Share2, ShieldCheck, 
  ArrowRight, Globe, Cpu, Palette, QrCode,
  Instagram, Twitter, Disc as Discord, Music, Youtube, MessageCircle,
  BarChart3, UserPlus, Leaf, Wand2, Sparkles, SmartphoneNfc, Check, Crown, Star, Shield,
  Loader2
} from 'lucide-react';

interface HomeProps {
  lang: Language;
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ lang, onStart }) => {
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  const isRtl = lang === 'ar';
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      const plans = await getAllPricingPlans();
      setPricingPlans(plans.filter(p => p.isActive));
      setLoadingPlans(false);
    };
    fetchPlans();
  }, []);

  const getIcon = (name: string) => {
    const Icon = (LucideIcons as any)[name] || Shield;
    return Icon;
  };

  const handleSubscribe = (plan: PricingPlan) => {
    if (plan.stripeLink) {
      window.open(plan.stripeLink, '_blank');
    } else {
      onStart();
    }
  };

  const phrases = isRtl 
    ? ["أسهل طريقة للمشاركة", "هويتك في جيبك دائماً", "تواصل ذكي بلمسة واحدة", "مستقبل بطاقات الأعمال هنا"]
    : ["The easiest way to share", "Your ID always in your pocket", "Smart one-tap networking", "Future of business cards is here"];
  
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(100);

  useEffect(() => {
    const handleType = () => {
      const fullPhrase = phrases[currentPhraseIdx];
      if (!isDeleting) {
        setDisplayText(fullPhrase.substring(0, displayText.length + 1));
        setTypingSpeed(100);
        if (displayText === fullPhrase) { setTimeout(() => setIsDeleting(true), 2000); }
      } else {
        setDisplayText(fullPhrase.substring(0, displayText.length - 1));
        setTypingSpeed(50);
        if (displayText === '') {
          setIsDeleting(false);
          setCurrentPhraseIdx((prev) => (prev + 1) % phrases.length);
        }
      }
    };
    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentPhraseIdx]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 10,
        y: (e.clientY / window.innerHeight - 0.5) * 10
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const floatingIcons = [
    { Icon: Instagram, color: 'text-pink-500', top: '10%', left: '15%', delay: '0s' },
    { Icon: Twitter, color: 'text-blue-400', top: '20%', left: '75%', delay: '1.2s' },
    { Icon: Discord, color: 'text-indigo-500', top: '70%', left: '10%', delay: '0.5s' },
    { Icon: Music, color: 'text-green-600', top: '80%', left: '60%', delay: '2s' },
    { Icon: Youtube, color: 'text-red-500', top: '40%', left: '85%', delay: '0.8s' },
    { Icon: MessageCircle, color: 'text-emerald-500', top: '60%', left: '80%', delay: '1.5s' },
  ];

  const features = [
    {
      title: isRtl ? 'مشاركة فورية (NFC/QR)' : 'Instant Share (NFC/QR)',
      desc: isRtl ? 'شارك بياناتك بلمسة واحدة عبر بطاقات NFC الذكية أو رمز الاستجابة السريع QR.' : 'Share your data in one tap via smart NFC cards or dynamic QR codes.',
      icon: SmartphoneNfc,
      color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
    },
    {
      title: isRtl ? 'تصاميم احترافية متغيرة' : 'Endless Pro Designs',
      desc: isRtl ? 'مكتبة متكاملة من القوالب التي تتيح لك تغيير الألوان، الأنماط والترويسات هندسياً.' : 'A library of templates allowing you to change colors, styles, and headers geometrically.',
      icon: Palette,
      color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
    },
    {
      title: isRtl ? 'ذكاء اصطناعي مدمج' : 'Built-in AI Power',
      desc: isRtl ? 'استخدم تقنية Gemini لكتابة نبذتك المهنية بأسلوب تسويقي جذاب ومقنع.' : 'Use Gemini AI technology to write your professional bio in an engaging marketing style.',
      icon: Wand2,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400'
    },
    {
      title: isRtl ? 'تحليلات الزوار المباشرة' : 'Live Visitor Analytics',
      desc: isRtl ? 'راقب أداء بطاقتك واعرف عدد المشاهدات والتفاعلات لحظة بلحظة وبكل دقة.' : 'Monitor your card performance and track views and interactions in real-time.',
      icon: BarChart3,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
    },
    {
      title: isRtl ? 'حفظ الاتصال بضغطة واحدة' : 'One-Tap Contact Save',
      desc: isRtl ? 'سهل على عملائك حفظ رقمك، بريدك، وروابطك مباشرة في سجل هواتفهم.' : 'Make it easy for clients to save your number, email, and links directly to their contacts.',
      icon: UserPlus,
      color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
    },
    {
      title: isRtl ? 'نظام عضويات ذكي' : 'Smart Membership System',
      desc: isRtl ? 'اعرض حالة اشتراكك، تاريخ الانتهاء، وتوثيق الحساب رسمياً على بطاقتك.' : 'Display your subscription status, expiry date, and official verification on your card.',
      icon: ShieldCheck,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
    }
  ];

  return (
    <div className={`relative min-h-screen bg-[#fcfdfe] dark:bg-[#050810] text-slate-900 dark:text-white transition-colors duration-700 overflow-hidden ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* Dynamic Background Animation */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-100/30 dark:bg-blue-600/5 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-indigo-50/30 dark:bg-purple-600/5 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] dark:opacity-[0.05] dark:invert"></div>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
        <div className="flex-1 relative w-full max-w-[550px] aspect-square group">
          <div className="relative w-full h-full transition-transform duration-700 ease-out" style={{ transform: `perspective(1200px) rotateY(${mousePos.x}deg) rotateX(${-mousePos.y}deg)` }}>
            <div className="absolute inset-0 bg-blue-400/10 dark:bg-blue-500/10 blur-[100px] rounded-full scale-90 animate-pulse"></div>
            <div className="relative bg-white dark:bg-[#0d111b] w-full h-[400px] md:h-[500px] rounded-[3.5rem] border border-slate-100 dark:border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] dark:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center">
              <div className="w-32 h-32 md:w-44 md:h-44 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative">
                 <div className="absolute inset-0 bg-white/20 blur-xl rounded-full animate-ping opacity-30"></div>
                 <Smartphone size={70} className="text-white relative z-10" />
              </div>
              <div className="absolute bottom-10 flex items-center gap-3 px-6 py-3 bg-white dark:bg-white/5 backdrop-blur-xl shadow-xl dark:shadow-none rounded-2xl border border-slate-50 dark:border-white/10 animate-bounce-slow">
                 <Zap size={18} className="text-amber-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest">{isRtl ? 'تواصل رقمي ذكي' : 'SMART DIGITAL NETWORKING'}</span>
              </div>
            </div>
            {floatingIcons.map((icon, idx) => (
              <div key={idx} className={`absolute ${icon.color} bg-white dark:bg-white/5 backdrop-blur-2xl p-4 md:p-5 rounded-2xl md:rounded-[1.8rem] border border-slate-100 dark:border-white/10 shadow-lg dark:shadow-2xl animate-float transition-all duration-700 hover:scale-110 hover:-rotate-12`} style={{ top: icon.top, left: icon.left, animationDelay: icon.delay, zIndex: 20 }}>
                <icon.Icon size={24} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 text-center lg:text-start space-y-10">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-7xl font-black leading-tight tracking-tighter">
              {isRtl ? 'هويتك الرقمية' : 'Your Digital ID'}
              <span className="block text-blue-600 dark:text-blue-500">
                {isRtl ? 'بلمسة عصرية' : 'Modern Touch'}
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-bold max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {isRtl ? 'أسهل طريقة لمشاركة ملفك المهني مع العالم بتصاميم ذكية تليق بمكانتك في عصر التحول الرقمي.' : 'The easiest way to share your professional profile with smart designs that fit your status in the digital age.'}
            </p>
          </div>
          <div className="flex flex-col items-center lg:items-start gap-5 justify-center lg:justify-start">
            <button onClick={onStart} className="group relative px-16 py-6 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-[0_20px_40px_rgba(37,99,235,0.25)] hover:shadow-[0_25px_50_px_rgba(37,99,235,0.4)] dark:shadow-[0_20px_40px_rgba(37,99,235,0.15)] hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-4 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span>{isRtl ? 'ابدأ الآن' : 'Start Now'}</span>
              <ArrowRight size={22} className={`transition-transform ${isRtl ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`} />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/10 rounded-full border border-blue-100 dark:border-blue-800/30 animate-fade-in min-h-[36px]">
               <Zap size={14} className="text-blue-600 animate-pulse" />
               <p className="text-[11px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest flex items-center">
                  {displayText}
                  <span className="w-[2px] h-3 bg-blue-600 ml-1 animate-pulse" style={{ display: 'inline-block' }}></span>
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black">{isRtl ? 'خطط التميز' : 'Premium Plans'}</h2>
              <p className="text-gray-400 font-bold max-w-xl mx-auto">{isRtl ? 'اختر الخطة المناسبة لاحتياجاتك وابدأ في بناء هويتك الرقمية الاحترافية اليوم.' : 'Choose the best plan for your needs and start building your professional digital ID today.'}</p>
           </div>
           
           {loadingPlans ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {pricingPlans.map((plan, idx) => {
                  const Icon = getIcon(plan.iconName);
                  return (
                    <div key={idx} className={`relative p-8 md:p-10 rounded-[3rem] border transition-all duration-500 hover:-translate-y-2 flex flex-col ${plan.isPopular ? 'bg-white dark:bg-[#0a0d15] border-blue-200 dark:border-blue-900/50 scale-105 z-10' : 'bg-gray-50/50 dark:bg-white/[0.02] border-gray-100 dark:border-white/5'}`}>
                       {plan.isPopular && (
                         <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                            {isRtl ? 'الأكثر طلباً' : 'Most Popular'}
                         </div>
                       )}
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${plan.isPopular ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-slate-100 text-slate-600'}`}>
                          <Icon size={28} />
                       </div>
                       <h3 className="text-2xl font-black mb-2">{isRtl ? plan.nameAr : plan.nameEn}</h3>
                       <div className="flex items-baseline gap-1 mb-8">
                          <span className="text-4xl font-black">${plan.price}</span>
                          <span className="text-gray-400 font-bold text-sm">/{isRtl ? plan.billingCycleAr : plan.billingCycleEn}</span>
                       </div>
                       <ul className="space-y-4 mb-10 flex-1">
                          {(isRtl ? plan.featuresAr : plan.featuresEn).map((f, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-500 dark:text-slate-400">
                               <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg"><Check size={12} strokeWidth={4} /></div>
                               {f}
                            </li>
                          ))}
                       </ul>
                       <button 
                         onClick={() => handleSubscribe(plan)} 
                         className={`w-full py-5 rounded-2xl font-black text-sm uppercase transition-all active:scale-95 ${plan.isPopular ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 hover:brightness-110' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}
                       >
                          {isRtl ? (plan.buttonTextAr || 'اشترك الآن') : (plan.buttonTextEn || 'Subscribe Now')}
                       </button>
                    </div>
                  );
                })}
             </div>
           )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-6 bg-slate-50/50 dark:bg-white/[0.02] border-y border-slate-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2 border border-blue-100 dark:border-blue-500/20">
               <Sparkles size={12} />
               {isRtl ? 'مستقبل الأعمال' : 'Business Future'}
            </div>
            <h2 className="text-3xl md:text-5xl font-black">{isRtl ? 'ماذا ستحصل عليه؟' : 'What You Get?'}</h2>
            <p className="text-slate-400 dark:text-slate-500 font-bold max-w-2xl mx-auto">{isRtl ? 'مميزات فريدة تجعل تواصلك المهني أكثر كفاءة، سرعة وذكاء بفضل أحدث التقنيات.' : 'Unique features that make your networking more efficient, fast, and smart with latest tech.'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feat, idx) => (
              <div key={idx} className="bg-white dark:bg-[#0d111b] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-sm hover:shadow-xl dark:hover:shadow-blue-500/5 hover:-translate-y-2 transition-all duration-500 group">
                <div className={`w-16 h-16 ${feat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <feat.icon size={30} />
                </div>
                <h3 className="text-xl font-black mb-3">{feat.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-bold leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white dark:bg-transparent">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="flex items-center gap-3"><ShieldCheck size={28}/> <span className="font-black text-lg uppercase tracking-tighter">Secure ID</span></div>
           <div className="flex items-center gap-3"><Globe size={28}/> <span className="font-black text-lg uppercase tracking-tighter">Global Access</span></div>
           <div className="flex items-center gap-3"><Cpu size={28}/> <span className="font-black text-lg uppercase tracking-tighter">NFC Enabled</span></div>
           <div className="flex items-center gap-3"><QrCode size={28}/> <span className="font-black text-lg uppercase tracking-tighter">Dynamic QR</span></div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Home;
