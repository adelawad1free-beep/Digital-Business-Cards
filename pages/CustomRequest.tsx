
import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  Send, Users, Zap, ShieldCheck, Mail, Building2, 
  Palette, LayoutGrid, CheckCircle2, 
  Loader2, ArrowRight, MessageSquare, Phone, AlertCircle, Tag
} from 'lucide-react';

interface CustomRequestProps {
  lang: Language;
}

const CustomRequest: React.FC<CustomRequestProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    count: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // إرسال البيانات إلى ملف contact.php الموجود في جذر الموقع
      const response = await fetch('./contact.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', company: '', email: '', phone: '', count: '', message: '' });
      } else {
        throw new Error('Server returned error');
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(isRtl ? 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.' : 'An error occurred while sending your request. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      title: t('featureSecurity'),
      desc: isRtl ? 'حماية فائقة من سوء الاستخدام مع نظام توثيق الحسابات الرسمي.' : 'Advanced protection from misuse with an official account verification system.',
      icon: ShieldCheck,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: t('featureCustomDesign'),
      desc: isRtl ? 'تصاميم حصرية تعكس هوية شركتك البصرية بدقة.' : 'Exclusive designs that accurately reflect your brand identity.',
      icon: Palette,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: t('featureDashboard'),
      desc: isRtl ? 'لوحة تحكم مركزية لإدارة كافة بطاقات فريق عملك.' : 'Centralized dashboard to manage all your team cards.',
      icon: LayoutGrid,
      color: 'bg-emerald-50 text-emerald-600'
    }
  ];

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#050507] pb-24 ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Banner Section */}
      <section className="relative overflow-hidden bg-blue-600 dark:bg-blue-900 py-24 md:py-32 px-6">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white text-[10px] font-black uppercase tracking-widest border border-white/20">
             <Zap size={14} className="text-amber-400" />
             {isRtl ? 'خدمات الشركات والفرق' : 'Corporate & Team Services'}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
            {t('corporateTitle')}
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-bold max-w-2xl mx-auto opacity-90 leading-relaxed">
            {t('corporateDesc')}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left: Form */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 dark:border-gray-800 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-10">
               <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl shadow-sm">
                  <MessageSquare size={24} />
               </div>
               <div>
                  <h2 className="text-2xl font-black dark:text-white uppercase leading-none mb-1">{t('orderNow')}</h2>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isRtl ? 'سنقوم بالرد عليك خلال أقل من 24 ساعة' : 'We will respond within 24 hours'}</p>
               </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 animate-shake">
                <AlertCircle className="text-red-500" size={20} />
                <p className="text-xs font-bold text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {submitted ? (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="text-2xl font-black dark:text-white mb-4">{t('requestSuccess')}</h3>
                <p className="text-gray-500 font-bold mb-8">{isRtl ? 'شكراً لاهتمامك، سنقوم بالتواصل معك عبر البريد الإلكتروني قريباً.' : 'Thank you for your interest, we will contact you via email shortly.'}</p>
                <button onClick={() => setSubmitted(false)} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all">
                  {isRtl ? 'إرسال طلب آخر' : 'Send Another Request'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('fullName')}</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('companyName')}</label>
                    <input type="text" required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('email')}</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('phone')}</label>
                    <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('staffCount')}</label>
                  <input type="number" required value={formData.count} onChange={e => setFormData({...formData, count: e.target.value})} placeholder="Ex: 50" className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('messageSubject')}</label>
                  <textarea rows={4} required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 transition-all resize-none" />
                </div>

                <button type="submit" disabled={loading} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all">
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                  {t('submitRequest')}
                </button>
              </form>
            )}
          </div>

          {/* Right: Info & Features */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-800 shadow-xl space-y-10 animate-fade-in-right">
              <div>
                <h3 className="text-2xl font-black dark:text-white uppercase leading-none mb-4">{isRtl ? 'لماذا تختار هويتي لفريقك؟' : 'Why Choose NextID for Teams?'}</h3>
                <p className="text-sm font-bold text-gray-400 leading-relaxed">{isRtl ? 'نقدم حلولاً متكاملة للشركات والمؤسسات الكبيرة التي تسعى للتميز والتحول الرقمي الكامل.' : 'We provide integrated solutions for large companies and organizations seeking excellence and full digital transformation.'}</p>
              </div>

              <div className="space-y-6">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className={`w-14 h-14 shrink-0 rounded-2xl ${f.color} flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                      <f.icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-black dark:text-white mb-1 uppercase tracking-tight">{f.title}</h4>
                      <p className="text-xs font-bold text-gray-400 leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="text-emerald-500" size={20} />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'دعم فني مخصص 24/7' : 'Priority 24/7 Support'}</span>
                 </div>
                 <div className="p-6 bg-slate-50 dark:bg-black/20 rounded-3xl space-y-4">
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{isRtl ? 'تواصل مباشر' : 'Direct Contact'}</p>
                    <div className="space-y-3">
                       <a href="mailto:info@nextid.my" className="flex items-center gap-3 text-sm font-bold dark:text-white hover:text-blue-600 transition-colors">
                          <Mail size={18} className="text-gray-400" /> info@nextid.my
                       </a>
                       <a href="tel:966560817601" className="flex items-center gap-3 text-sm font-bold dark:text-white hover:text-blue-600 transition-colors">
                          <Phone size={18} className="text-gray-400" /> 966560817601
                       </a>
                    </div>
                 </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
               <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Tag size={24} />
                  </div>
                  <h3 className="text-2xl font-black uppercase leading-tight">
                    {isRtl ? 'عروض مميزة وأسعار مناسبة' : 'Special Offers & Best Prices'}
                  </h3>
                  <p className="text-blue-100 text-xs font-bold leading-relaxed opacity-80">
                    {isRtl ? 'نقدم باقات تنافسية تلبي احتياجات فريقك بأفضل جودة وأنسب الأسعار، لا تتردد في الاتصال بنا الآن.' : 'We offer competitive packages that meet your team\'s needs with top quality and the best prices. Don\'t hesitate to contact us now.'}
                  </p>
               </div>
               <div className="absolute bottom-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-700">
                  <Tag size={180} />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomRequest;
