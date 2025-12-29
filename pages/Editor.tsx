
import React, { useState, useEffect, useRef } from 'react';
import { CardData, Language, SocialLink } from '../types';
import { TRANSLATIONS, THEME_COLORS, SOCIAL_PLATFORMS, SAMPLE_DATA, AVATAR_STYLES } from '../constants';
import { generateProfessionalBio } from '../services/geminiService';
import { generateSerialId } from '../utils/share';
import { isSlugAvailable, auth, uploadProfileImage } from '../services/firebase';
import CardPreview from '../components/CardPreview';
import SocialIcon from '../components/SocialIcon';
import { Save, Plus, X, Loader2, Sparkles, UserCircle2, Moon, Sun, Hash, Mail, Phone, Globe, MessageCircle, Star, Pipette, Link as LinkIcon, CheckCircle2, ShieldCheck, AlertCircle, UploadCloud } from 'lucide-react';

interface EditorProps {
  lang: Language;
  onSave: (data: CardData) => void;
  initialData?: CardData;
  isAdminEdit?: boolean;
}

const Editor: React.FC<EditorProps> = ({ lang, onSave, initialData, isAdminEdit }) => {
  const t = (key: string) => TRANSLATIONS[key][lang];
  const isRtl = lang === 'ar';
  const colorInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const getDefaults = (l: Language): CardData => ({
    id: generateSerialId(),
    name: '', title: '', company: '', bio: '', email: '', phone: '', whatsapp: '', website: '', location: '', locationUrl: '', profileImage: '',
    themeColor: THEME_COLORS[0], isDark: false, socialLinks: [],
    ...SAMPLE_DATA[l]
  });

  const [formData, setFormData] = useState<CardData>(initialData || getDefaults(lang));
  const [activeImgTab, setActiveImgTab] = useState<'upload' | 'social' | 'avatar' | 'link'>('upload');
  const [socialHandle, setSocialHandle] = useState('');
  const [socialProvider, setSocialProvider] = useState('twitter');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [socialInput, setSocialInput] = useState({ platformId: SOCIAL_PLATFORMS[0].id, url: '' });
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (field: keyof CardData, value: any) => {
    if (field === 'id') {
      value = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setSlugStatus('idle');
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!auth.currentUser) {
      alert(lang === 'ar' ? 'يجب تسجيل الدخول لرفع الصور' : 'Please login to upload images');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert(lang === 'ar' ? 'حجم الصورة كبير جداً (الأقصى 2 ميجا)' : 'File too large (Max 2MB)');
      return;
    }

    setIsUploading(true);
    try {
      const downloadUrl = await uploadProfileImage(auth.currentUser.uid, file);
      handleChange('profileImage', downloadUrl);
    } catch (error) {
      console.error("Upload error:", error);
      alert(lang === 'ar' ? 'فشل رفع الصورة' : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const checkAvailability = async () => {
    if (!formData.id || formData.id.length < 3) {
      alert(lang === 'ar' ? 'يجب أن يكون الرابط 3 أحرف على الأقل' : 'Link must be at least 3 characters');
      return;
    }
    setSlugStatus('checking');
    const available = await isSlugAvailable(formData.id, auth.currentUser?.uid);
    setSlugStatus(available ? 'available' : 'taken');
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

  const handleFinalSave = async () => {
    if (slugStatus !== 'available' && !isAdminEdit) {
      setSlugStatus('checking');
      const available = await isSlugAvailable(formData.id, auth.currentUser?.uid);
      if (!available) {
        setSlugStatus('taken');
        alert(lang === 'ar' ? "هذا الرابط مستخدم بالفعل" : "This link is already taken");
        return;
      }
      setSlugStatus('available');
    }
    onSave(formData);
  };

  const inputClasses = "w-full px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all shadow-sm placeholder:text-gray-300 font-medium text-sm";
  const labelClasses = "block text-xs font-black text-gray-400 dark:text-gray-500 mb-2 px-1 uppercase tracking-widest";

  return (
    <div className="flex flex-col lg:flex-row gap-12 pb-20">
      <div className="flex-1 space-y-10">
        {isAdminEdit && (
          <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-200 dark:border-amber-800/20 flex items-center gap-4 animate-pulse">
            <ShieldCheck className="text-amber-600" />
            <p className="text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-widest">
              {lang === 'ar' ? 'وضع تعديل المسؤول' : 'Admin Edit Mode'}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-[#121215] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 space-y-10">
          
          <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border-2 border-dashed border-blue-200 dark:border-blue-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h3 className="text-lg font-black text-blue-900 dark:text-blue-100">{t('customLink')}</h3>
                  <p className="text-xs font-bold text-blue-600/70">{t('linkHint')} <span className="underline">{window.location.host}/{formData.id || '...'}</span></p>
               </div>
               <button 
                onClick={checkAvailability}
                disabled={slugStatus === 'checking'}
                className="px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl font-black text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-2 border border-blue-100 dark:border-blue-900/30"
               >
                 {slugStatus === 'checking' ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                 {lang === 'ar' ? 'تحقق من التوفر' : 'Check Availability'}
               </button>
            </div>
            
            <div className="relative">
              <input 
                type="text" 
                value={formData.id} 
                onChange={e => handleChange('id', e.target.value)} 
                className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} text-lg font-black tracking-wider border-blue-200 dark:border-blue-800 focus:ring-blue-500/10`} 
                placeholder="username" 
                disabled={isAdminEdit}
              />
              <Hash className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-400`} size={20} />
              <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2`}>
                {slugStatus === 'available' && <CheckCircle2 className="text-emerald-500" size={24} />}
                {slugStatus === 'taken' && <AlertCircle className="text-red-500" size={24} />}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-6">
            <label className={labelClasses}>{t('imageSource')}</label>
            <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gray-200 relative group">
                 {formData.profileImage ? (
                   <img src={formData.profileImage} className="w-full h-full object-cover" alt="Profile" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-gray-400"><UserCircle2 size={40} /></div>
                 )}
                 {isUploading && (
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                     <Loader2 className="animate-spin text-white" />
                   </div>
                 )}
               </div>
               <div className="flex-1 w-full space-y-4">
                  <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto no-scrollbar">
                    <button onClick={() => setActiveImgTab('upload')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all shrink-0 ${activeImgTab === 'upload' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>
                      {lang === 'ar' ? 'رفع ملف' : 'Upload File'}
                    </button>
                    <button onClick={() => setActiveImgTab('social')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all shrink-0 ${activeImgTab === 'social' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{t('socialSync')}</button>
                    <button onClick={() => setActiveImgTab('avatar')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all shrink-0 ${activeImgTab === 'avatar' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{t('avatarLib')}</button>
                    <button onClick={() => setActiveImgTab('link')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all shrink-0 ${activeImgTab === 'link' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{t('directLink')}</button>
                  </div>
                  
                  {activeImgTab === 'upload' && (
                    <div className="space-y-2">
                       <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                       <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl flex flex-col items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                       >
                         <UploadCloud className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                         <span className="text-xs font-bold text-gray-500">{isUploading ? (lang === 'ar' ? 'جاري الرفع...' : 'Uploading...') : (lang === 'ar' ? 'اختر صورة من جهازك' : 'Choose a file')}</span>
                       </button>
                    </div>
                  )}
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
                         <button key={s.id} onClick={() => handleChange('profileImage', `https://api.dicebear.com/7.x/${s.id}/svg?seed=${formData.name || 'User'}`)} className="shrink-0 w-12 h-12 rounded-lg bg-white border border-gray-100 overflow-hidden"><img src={`https://api.dicebear.com/7.x/${s.id}/svg?seed=preview`} alt="Avatar" /></button>
                       ))}
                    </div>
                  )}
                  {activeImgTab === 'link' && <input type="url" value={formData.profileImage} onChange={e => handleChange('profileImage', e.target.value)} placeholder="URL..." className={inputClasses} />}
               </div>
            </div>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className={labelClasses}>{t('email')}</label><div className="relative"><Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} /><input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div></div>
             <div><label className={labelClasses}>{t('phone')}</label><div className="relative"><Phone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} /><input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div></div>
             <div><label className={labelClasses}>{t('whatsapp')}</label><div className="relative"><MessageCircle className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} /><input type="tel" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div></div>
             <div><label className={labelClasses}>{t('website')}</label><div className="relative"><Globe className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} /><input type="url" value={formData.website} onChange={e => handleChange('website', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div></div>
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4 px-1">
                <label className={labelClasses}>{t('theme')}</label>
                <div className="flex items-center gap-2">
                   <input type="color" ref={colorInputRef} value={formData.themeColor} onChange={(e) => handleChange('themeColor', e.target.value)} className="sr-only" />
                   <button onClick={() => colorInputRef.current?.click()} className="text-[10px] font-black text-blue-600 flex items-center gap-1 uppercase hover:underline"><Pipette size={14} />{lang === 'ar' ? 'لون مخصص' : 'Custom'}</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {THEME_COLORS.map(color => (
                  <button key={color} onClick={() => handleChange('themeColor', color)} className={`w-10 h-10 rounded-full transition-all hover:scale-110 shadow-lg relative ${formData.themeColor === color ? 'ring-4 ring-blue-500 ring-offset-4 dark:ring-offset-gray-900 scale-110' : ''}`} style={{ backgroundColor: color }}>
                    {color === '#C5A059' && <span className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm"><Star size={8} className="text-[#C5A059] fill-[#C5A059]" /></span>}
                  </button>
                ))}
                {!THEME_COLORS.includes(formData.themeColor) && (
                   <button onClick={() => colorInputRef.current?.click()} className="w-10 h-10 rounded-full transition-all scale-110 shadow-lg ring-4 ring-blue-500 ring-offset-4 dark:ring-offset-gray-900 relative" style={{ backgroundColor: formData.themeColor }}>
                    <span className="absolute inset-0 flex items-center justify-center text-white mix-blend-difference"><Pipette size={12} /></span>
                  </button>
                )}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                 <label className={labelClasses}>{lang === 'ar' ? 'نمط البطاقة' : 'Card Theme'}</label>
                 <p className="text-[10px] font-bold text-gray-400">{formData.isDark ? (lang === 'ar' ? 'الوضع الليلي نشط' : 'Dark Mode Active') : (lang === 'ar' ? 'الوضع الفاتح نشط' : 'Light Mode Active')}</p>
              </div>
              <button onClick={() => handleChange('isDark', !formData.isDark)} className={`p-4 rounded-2xl transition-all ${formData.isDark ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-400 border border-gray-100'}`}>
                {formData.isDark ? <Sun size={24} /> : <Moon size={24} />}
              </button>
            </div>
          </div>

          <button 
            onClick={handleFinalSave}
            className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            <Save size={24} />
            {isAdminEdit ? (lang === 'ar' ? 'تحديث البطاقة (إدارة)' : 'Update Card (Admin)') : t('save')}
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
