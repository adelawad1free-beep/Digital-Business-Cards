
import React, { useState, useEffect, useRef } from 'react';
import { CardData, Language, SocialLink } from '../types';
import { TRANSLATIONS, THEME_COLORS, SOCIAL_PLATFORMS, SAMPLE_DATA, AVATAR_STYLES } from '../constants';
import { generateProfessionalBio } from '../services/geminiService';
import { generateSerialId } from '../utils/share';
import CardPreview from '../components/CardPreview';
import SocialIcon from '../components/SocialIcon';
// Added CheckCircle2 to fix the reported error on line 101
import { Save, Plus, X, Loader2, Sparkles, UserCircle2, Moon, Sun, Hash, Mail, Phone, Globe, MessageCircle, Star, Pipette, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

interface EditorProps {
  lang: Language;
  onSave: (data: CardData) => void;
  initialData?: CardData;
}

const Editor: React.FC<EditorProps> = ({ lang, onSave, initialData }) => {
  const t = (key: string) => TRANSLATIONS[key][lang];
  const isRtl = lang === 'ar';
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  const getDefaults = (l: Language): CardData => ({
    id: generateSerialId(),
    name: '', title: '', company: '', bio: '', email: '', phone: '', whatsapp: '', website: '', location: '', locationUrl: '', profileImage: '',
    themeColor: THEME_COLORS[0], isDark: false, socialLinks: [],
    ...SAMPLE_DATA[l]
  });

  const [formData, setFormData] = useState<CardData>(initialData || getDefaults(lang));
  const [activeImgTab, setActiveImgTab] = useState<'social' | 'avatar' | 'link'>('social');
  const [socialHandle, setSocialHandle] = useState('');
  const [socialProvider, setSocialProvider] = useState('twitter');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [socialInput, setSocialInput] = useState({ platformId: SOCIAL_PLATFORMS[0].id, url: '' });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof CardData, value: any) => {
    if (field === 'id') {
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSocialLink = () => {
    if (!socialInput.url) return;
    const platform = SOCIAL_PLATFORMS.find(p => p.id === socialInput.platformId);
    if (!platform) return;
    const newLink: SocialLink = { platform: platform.name, url: socialInput.url, platformId: platform.id };
    setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, newLink] }));
    setSocialInput({ ...socialInput, url: '' });
  };

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateAIBio = async () => {
    if (!formData.name || !formData.title) {
      alert(lang === 'ar' ? 'يرجى إدخال الاسم والمسمى الوظيفي أولاً' : 'Please fill Name and Title first');
      return;
    }
    setIsGeneratingBio(true);
    try {
      const generatedBio = await generateProfessionalBio(formData.name, formData.title, formData.company, formData.bio, lang);
      if (generatedBio) handleChange('bio', generatedBio);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const inputClasses = "w-full px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all shadow-sm placeholder:text-gray-300 font-medium text-sm";
  const labelClasses = "block text-xs font-black text-gray-400 dark:text-gray-500 mb-2 px-1 uppercase tracking-widest";

  return (
    <div className="flex flex-col lg:flex-row gap-12 pb-20">
      <div className="flex-1 space-y-10">
        <div className="bg-white dark:bg-[#121215] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 space-y-10">
          
          {/* 0. الرابط المخصص - مباشر بعد الدومين */}
          <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-900/20 space-y-4">
            <label className={`${labelClasses} text-blue-600 dark:text-blue-400`}>{t('customLink')}</label>
            <div className="relative">
              <LinkIcon className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-400`} size={18} />
              <input 
                type="text" 
                value={formData.id} 
                onChange={e => handleChange('id', e.target.value)} 
                className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} border-blue-200 dark:border-blue-800 focus:ring-blue-500/10`} 
                placeholder="username" 
              />
            </div>
            <p className="text-[11px] font-black text-blue-600/80 px-1 flex items-center gap-2">
               {/* CheckCircle2 is now imported correctly above */}
               <CheckCircle2 size={12} />
               <span>{t('linkHint')} <span className="underline decoration-blue-300">{window.location.host}/{formData.id || '...'}</span></span>
            </p>
          </div>

          {/* 1. الصورة الشخصية */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-6">
            <label className={labelClasses}>{t('imageSource')}</label>
            <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gray-200">
                 {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400"><UserCircle2 size={40} /></div>}
               </div>
               <div className="flex-1 w-full space-y-4">
                  <div className="flex gap-2 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <button onClick={() => setActiveImgTab('social')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeImgTab === 'social' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{t('socialSync')}</button>
                    <button onClick={() => setActiveImgTab('avatar')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeImgTab === 'avatar' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{t('avatarLib')}</button>
                    <button onClick={() => setActiveImgTab('link')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeImgTab === 'link' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{t('directLink')}</button>
                  </div>
                  {activeImgTab === 'social' && (
                    <div className="flex gap-2">
                       <select value={socialProvider} onChange={e => setSocialProvider(e.target.value)} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-blue-500">
                          <option value="twitter">X / Twitter</option>
                          <option value="github">GitHub</option>
                          <option value="instagram">Instagram</option>
                       </select>
                       <input type="text" value={socialHandle} onChange={e => setSocialHandle(e.target.value)} placeholder="Username..." className={inputClasses} />
                       <button onClick={() => handleChange('profileImage', `https://unavatar.io/${socialProvider}/${socialHandle}`)} className="px-4 bg-blue-600 text-white rounded-xl text-xs font-bold">Sync</button>
                    </div>
                  )}
                  {activeImgTab === 'avatar' && (
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                       {AVATAR_STYLES.map(s => (
                         <button key={s.id} onClick={() => handleChange('profileImage', `https://api.dicebear.com/7.x/${s.id}/svg?seed=${formData.name || 'User'}`)} className="shrink-0 w-12 h-12 rounded-lg bg-white border border-gray-100 overflow-hidden"><img src={`https://api.dicebear.com/7.x/${s.id}/svg?seed=preview`} /></button>
                       ))}
                    </div>
                  )}
                  {activeImgTab === 'link' && <input type="url" value={formData.profileImage} onChange={e => handleChange('profileImage', e.target.value)} placeholder="URL..." className={inputClasses} />}
               </div>
            </div>
          </div>

          {/* 2. البيانات الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div><label className={labelClasses}>{t('fullName')}</label><input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} placeholder={t('placeholderName')} /></div>
               <div><label className={labelClasses}>{t('jobTitle')}</label><input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClasses} placeholder={t('placeholderTitle')} /></div>
               <div><label className={labelClasses}>{t('company')}</label><input type="text" value={formData.company} onChange={e => handleChange('company', e.target.value)} className={inputClasses} placeholder="Company Co." /></div>
            </div>
            <div>
               <div className="flex items-center justify-between mb-2 px-1"><label className={labelClasses}>{t('bio')}</label><button onClick={handleGenerateAIBio} disabled={isGeneratingBio} className="text-[10px] font-black text-blue-600 flex items-center gap-1 uppercase">{isGeneratingBio ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {lang === 'ar' ? 'توليد ذكي' : 'AI Bio'}</button></div>
               <textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} rows={7} className={`${inputClasses} resize-none`} placeholder="..." />
            </div>
          </div>

          {/* 3. معلومات الاتصال */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className={labelClasses}>{t('email')}</label><div className="relative"><Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-300`} size={18} /><input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div></div>
             <div><label className={labelClasses}>{t('phone')}</label><div className="relative"><Phone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-300`} size={18} /><input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div></div>
             <div><label className={labelClasses}>{t('whatsapp')}</label><div className="relative"><MessageCircle className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-300`} size={18} /><input type="tel" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div></div>
             <div><label className={labelClasses}>{t('website')}</label><div className="relative"><Globe className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-300`} size={18} /><input type="url" value={formData.website} onChange={e => handleChange('website', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div></div>
          </div>

          {/* 4. روابط التواصل الاجتماعي */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4">
             <label className={labelClasses}>{t('socials')}</label>
             <div className="flex gap-2">
                <select value={socialInput.platformId} onChange={e => setSocialInput({...socialInput, platformId: e.target.value})} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 text-xs font-bold outline-none">
                  {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input type="url" value={socialInput.url} onChange={e => setSocialInput({...socialInput, url: e.target.value})} placeholder="URL..." className={inputClasses} />
                <button onClick={addSocialLink} className="p-4 bg-blue-600 text-white rounded-xl shadow-lg hover:scale-105 transition-all"><Plus size={20} /></button>
             </div>
             <div className="flex flex-wrap gap-3 mt-4">
               {formData.socialLinks.map((link, idx) => (
                 <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                   <SocialIcon platformId={link.platformId} size={16} color="#3b82f6" />
                   <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300 uppercase">{link.platform}</span>
                   <button onClick={() => removeSocialLink(idx)} className="text-red-400 hover:text-red-600 ml-2"><X size={14} /></button>
                 </div>
               ))}
             </div>
          </div>

          {/* 5. مظهر البطاقة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4 px-1">
                <label className={labelClasses}>{t('theme')}</label>
                <div className="flex items-center gap-2">
                   <input 
                     type="color" 
                     ref={colorInputRef} 
                     value={formData.themeColor} 
                     onChange={(e) => handleChange('themeColor', e.target.value)}
                     className="sr-only" 
                   />
                   <button 
                     onClick={() => colorInputRef.current?.click()}
                     className="text-[10px] font-black text-blue-600 flex items-center gap-1 uppercase hover:underline"
                   >
                     <Pipette size={14} />
                     {lang === 'ar' ? 'لون مخصص' : 'Custom'}
                   </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {THEME_COLORS.map(color => (
                  <button 
                    key={color} 
                    onClick={() => handleChange('themeColor', color)}
                    className={`w-10 h-10 rounded-full transition-all hover:scale-110 shadow-lg relative ${formData.themeColor === color ? 'ring-4 ring-blue-500 ring-offset-4 dark:ring-offset-gray-900 scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                  >
                    {color === '#C5A059' && <span className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"><Star size={8} className="text-[#C5A059] fill-[#C5A059]" /></span>}
                  </button>
                ))}
                
                {!THEME_COLORS.includes(formData.themeColor) && (
                   <button 
                    onClick={() => colorInputRef.current?.click()}
                    className="w-10 h-10 rounded-full transition-all scale-110 shadow-lg ring-4 ring-blue-500 ring-offset-4 dark:ring-offset-gray-900 relative"
                    style={{ backgroundColor: formData.themeColor }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-white mix-blend-difference">
                      <Pipette size={12} />
                    </span>
                  </button>
                )}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                 <label className={labelClasses}>{lang === 'ar' ? 'نمط البطاقة' : 'Card Theme'}</label>
                 <p className="text-[10px] font-bold text-gray-400">{formData.isDark ? (lang === 'ar' ? 'الوضع الليلي نشط' : 'Dark Mode Active') : (lang === 'ar' ? 'الوضع الفاتح نشط' : 'Light Mode Active')}</p>
              </div>
              <button 
                onClick={() => handleChange('isDark', !formData.isDark)}
                className={`p-4 rounded-2xl transition-all ${formData.isDark ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-400 border border-gray-100'}`}
              >
                {formData.isDark ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </div>
          </div>

          <button 
            onClick={() => onSave(formData)}
            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <Save size={24} />
            {t('save')}
          </button>
        </div>
      </div>

      <div className="hidden lg:block w-[380px] sticky top-12 self-start">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl">
           <CardPreview data={formData} lang={lang} />
        </div>
      </div>
    </div>
  );
};

export default Editor;
