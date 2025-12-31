
import React, { useState, useEffect, useRef } from 'react';
import { CardData, Language, SocialLink, ThemeType } from '../types';
import { TRANSLATIONS, THEME_COLORS, THEME_GRADIENTS, SOCIAL_PLATFORMS, SAMPLE_DATA } from '../constants';
import { generateProfessionalBio } from '../services/geminiService';
import { generateSerialId } from '../utils/share';
import { isSlugAvailable, auth } from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import CardPreview from '../components/CardPreview';
import SocialIcon from '../components/SocialIcon';
import { Save, Plus, X, Loader2, Sparkles, Moon, Sun, Hash, Mail, Phone, Globe, MessageCircle, Star, Pipette, Link as LinkIcon, CheckCircle2, ShieldCheck, AlertCircle, UploadCloud, Image as ImageIcon, Palette, Layout } from 'lucide-react';

interface EditorProps {
  lang: Language;
  onSave: (data: CardData, oldId?: string) => void;
  initialData?: CardData;
  isAdminEdit?: boolean;
}

const Editor: React.FC<EditorProps> = ({ lang, onSave, initialData, isAdminEdit }) => {
  const t = (key: string) => {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[lang] || entry['en'] || key;
  };

  const isRtl = lang === 'ar';
  const colorInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  
  const originalIdRef = useRef<string | null>(initialData?.id || null);

  const getDefaults = (l: Language): CardData => ({
    id: generateSerialId(),
    name: '', title: '', company: '', bio: '', email: '', phone: '', whatsapp: '', website: '', location: '', locationUrl: '', profileImage: '',
    themeType: 'color', themeColor: THEME_COLORS[0], themeGradient: THEME_GRADIENTS[0], backgroundImage: '',
    isDark: false, socialLinks: [],
    ...(SAMPLE_DATA[l] || SAMPLE_DATA['en'] || {})
  });

  const [formData, setFormData] = useState<CardData>(initialData || getDefaults(lang));
  const [activeImgTab, setActiveImgTab] = useState<'upload' | 'link'>('upload');
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [socialInput, setSocialInput] = useState({ platformId: SOCIAL_PLATFORMS[0].id, url: '' });
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      originalIdRef.current = initialData.id;
      setSlugStatus('available'); 
    } else {
      setFormData(getDefaults(lang));
      originalIdRef.current = null;
      setSlugStatus('idle');
    }
  }, [initialData, lang]);

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
    setIsUploading(true);
    try {
      const base64Image = await uploadImageToCloud(file);
      if (base64Image) handleChange('profileImage', base64Image);
    } catch (error: any) {
      alert(lang === 'ar' ? 'فشلت معالجة الصورة' : 'Image processing failed');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBgFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBg(true);
    try {
      const base64Image = await uploadImageToCloud(file);
      if (base64Image) handleChange('backgroundImage', base64Image);
    } catch (error: any) {
      alert(lang === 'ar' ? 'فشلت معالجة الخلفية' : 'Background processing failed');
    } finally {
      setIsUploadingBg(false);
      if (bgFileInputRef.current) bgFileInputRef.current.value = '';
    }
  };

  const checkAvailability = async () => {
    if (!formData.id || formData.id.length < 3) {
      alert(lang === 'ar' ? 'يجب أن يكون الرابط 3 أحرف على الأقل' : 'Link must be at least 3 characters');
      return;
    }
    if (formData.id.toLowerCase() === originalIdRef.current?.toLowerCase()) {
      setSlugStatus('available');
      return;
    }
    setSlugStatus('checking');
    const available = await isSlugAvailable(formData.id, formData.ownerId || auth.currentUser?.uid);
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
    setFormData(prev => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== index) }));
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
    if (slugStatus !== 'available' && formData.id.toLowerCase() !== originalIdRef.current?.toLowerCase()) {
      setSlugStatus('checking');
      const available = await isSlugAvailable(formData.id, formData.ownerId || auth.currentUser?.uid);
      if (!available) {
        setSlugStatus('taken');
        alert(lang === 'ar' ? "هذا الرابط مستخدم بالفعل" : "Link already taken");
        return;
      }
    }
    onSave(formData, originalIdRef.current || undefined);
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
          
          {/* 1. Custom Link Section */}
          <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border-2 border-dashed border-blue-200 dark:border-blue-800 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               <div>
                  <h3 className="text-lg font-black text-blue-900 dark:text-blue-100">{t('customLink')}</h3>
                  <p className="text-xs font-bold text-blue-600/70">{t('linkHint')} <span className="underline">{window.location.host}/{formData.id || '...'}</span></p>
               </div>
               <button onClick={checkAvailability} disabled={slugStatus === 'checking'} className="px-6 py-3 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl font-black text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 border border-blue-100 dark:border-blue-900/30">
                 {slugStatus === 'checking' ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                 {lang === 'ar' ? 'تحقق من التوفر' : 'Check Availability'}
               </button>
            </div>
            <div className="relative">
              <input type="text" value={formData.id} onChange={e => handleChange('id', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} text-lg font-black tracking-wider border-blue-200 dark:border-blue-800 focus:ring-blue-500/10`} placeholder="username" />
              <Hash className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-400`} size={20} />
              <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2`}>
                {slugStatus === 'available' && <CheckCircle2 className="text-emerald-500" size={24} />}
                {slugStatus === 'taken' && <AlertCircle className="text-red-500" size={24} />}
              </div>
            </div>
          </div>

          {/* 2. Profile Image Section */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-6">
            <label className={labelClasses}>{t('imageSource')}</label>
            <div className="flex flex-col md:flex-row items-center gap-8">
               <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl bg-gray-200 relative group shrink-0">
                 {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" alt="Profile" /> : <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-300"><Sparkles size={32}/></div>}
                 {isUploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
               </div>
               <div className="flex-1 w-full space-y-4">
                  <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 w-fit">
                    <button onClick={() => setActiveImgTab('upload')} className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeImgTab === 'upload' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                      <UploadCloud size={14} /> {lang === 'ar' ? 'رفع صورة' : 'Upload Image'}
                    </button>
                    <button onClick={() => setActiveImgTab('link')} className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeImgTab === 'link' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                      <LinkIcon size={14} /> {t('directLink')}
                    </button>
                  </div>
                  {activeImgTab === 'upload' ? (
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  ) : (
                    <input type="url" value={formData.profileImage} onChange={e => handleChange('profileImage', e.target.value)} placeholder="https://..." className={inputClasses} />
                  )}
               </div>
            </div>
          </div>

          {/* 3. Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div><label className={labelClasses}>{t('fullName')}</label><input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} placeholder={t('placeholderName')} /></div>
               <div><label className={labelClasses}>{t('jobTitle')}</label><input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClasses} placeholder={t('placeholderTitle')} /></div>
               <div><label className={labelClasses}>{t('company')}</label><input type="text" value={formData.company} onChange={e => handleChange('company', e.target.value)} className={inputClasses} placeholder="Company Co." /></div>
            </div>
            <div>
               <div className="flex items-center justify-between mb-2 px-1"><label className={labelClasses}>{t('bio')}</label><button onClick={handleGenerateAIBio} disabled={isGeneratingBio} className="text-[10px] font-black text-blue-600 flex items-center gap-1 uppercase">{isGeneratingBio ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {t('aiBio')}</button></div>
               <textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} rows={7} className={`${inputClasses} resize-none`} placeholder="..." />
            </div>
          </div>

          {/* 4. Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div><label className={labelClasses}>{t('email')}</label><div className="relative"><Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} /><input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div></div>
             <div><label className={labelClasses}>{t('phone')}</label><div className="relative"><Phone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} /><input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div></div>
             <div><label className={labelClasses}>{t('whatsapp')}</label><div className="relative"><MessageCircle className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} /><input type="tel" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div></div>
             <div><label className={labelClasses}>{t('website')}</label><div className="relative"><Globe className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} /><input type="url" value={formData.website} onChange={e => handleChange('website', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div></div>
          </div>

          {/* 5. Social Links */}
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

          {/* 6. Theme & Background Section - Updated for Mobile optimization (Matching User Image) */}
          <div className="bg-white dark:bg-gray-950 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-10 shadow-sm">
             <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 ${isRtl ? 'text-right' : 'text-left'}`}>
                <div className="order-1 md:order-2">
                  <h3 className="text-2xl font-black dark:text-white leading-none mb-1">{t('theme')}</h3>
                  <p className="text-xs font-bold text-gray-400/80 leading-relaxed max-w-[150px] md:max-w-none">
                    {lang === 'ar' ? 'اختر النمط البصري لبطاقتك' : 'Choose visual style'}
                  </p>
                </div>
                
                {/* Visual Type Selector - Card Style from Image */}
                <div className="order-2 md:order-1 flex bg-gray-50 dark:bg-gray-900 p-1.5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-inner w-full md:w-auto">
                  <button 
                    onClick={() => handleChange('themeType', 'image')} 
                    className={`flex-1 md:w-24 p-3 rounded-[1.5rem] transition-all flex flex-col items-center gap-1 ${formData.themeType === 'image' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
                  >
                    <ImageIcon size={20} />
                    <span className="text-[10px] font-black uppercase">{lang === 'ar' ? 'صورة' : 'Image'}</span>
                  </button>
                  <button 
                    onClick={() => handleChange('themeType', 'gradient')} 
                    className={`flex-1 md:w-24 p-3 rounded-[1.5rem] transition-all flex flex-col items-center gap-1 ${formData.themeType === 'gradient' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
                  >
                    <Sparkles size={20} />
                    <span className="text-[10px] font-black uppercase">{lang === 'ar' ? 'تدرج' : 'Gradient'}</span>
                  </button>
                  <button 
                    onClick={() => handleChange('themeType', 'color')} 
                    className={`flex-1 md:w-24 p-3 rounded-[1.5rem] transition-all flex flex-col items-center gap-1 ${formData.themeType === 'color' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
                  >
                    <Palette size={20} />
                    <span className="text-[10px] font-black uppercase">{lang === 'ar' ? 'ألوان' : 'Color'}</span>
                  </button>
                </div>
             </div>

             <div className="pt-2 animate-fade-in">
                {formData.themeType === 'color' && (
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-5">
                    {THEME_COLORS.map(color => (
                      <button 
                        key={color} 
                        onClick={() => handleChange('themeColor', color)} 
                        className={`w-14 h-14 rounded-full transition-all hover:scale-105 shadow-md relative flex items-center justify-center`} 
                        style={{ backgroundColor: color }}
                      >
                         {formData.themeColor === color && (
                           <div className="absolute -inset-1.5 border-[3.5px] border-blue-600 rounded-full" />
                         )}
                         {formData.themeColor === color && (
                           <div className="absolute -inset-1 border-[2.5px] border-white dark:border-gray-950 rounded-full" />
                         )}
                      </button>
                    ))}
                    <button 
                      onClick={() => colorInputRef.current?.click()} 
                      className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-all"
                    >
                      <Plus size={24}/>
                    </button>
                    <input type="color" ref={colorInputRef} className="sr-only" onChange={e => handleChange('themeColor', e.target.value)} />
                  </div>
                )}

                {formData.themeType === 'gradient' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {THEME_GRADIENTS.map((grad, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => handleChange('themeGradient', grad)} 
                        className={`h-20 rounded-[1.5rem] transition-all hover:scale-105 shadow-md relative overflow-hidden`} 
                        style={{ background: grad }}
                      >
                        {formData.themeGradient === grad && (
                          <div className="absolute inset-0 border-4 border-blue-600 rounded-[1.5rem] mix-blend-overlay" />
                        )}
                        {formData.themeGradient === grad && (
                          <div className="absolute top-2 right-2 bg-white text-blue-600 p-1 rounded-full shadow-sm">
                            <CheckCircle2 size={12} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {formData.themeType === 'image' && (
                  <div className="space-y-4">
                     <div className="relative group overflow-hidden h-40 rounded-[2rem] bg-gray-50 dark:bg-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center">
                        {formData.backgroundImage ? (
                          <>
                            <img src={formData.backgroundImage} className="w-full h-full object-cover" alt="BG" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => handleChange('backgroundImage', '')} className="p-3 bg-red-600 text-white rounded-2xl"><X size={20}/></button>
                            </div>
                          </>
                        ) : (
                          <button onClick={() => bgFileInputRef.current?.click()} className="flex flex-col items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
                             <UploadCloud size={32} />
                             <span className="text-[10px] font-black uppercase tracking-widest">{lang === 'ar' ? 'رفع صورة خلفية' : 'Upload Background'}</span>
                          </button>
                        )}
                        {isUploadingBg && <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20"><Loader2 className="animate-spin text-white" /></div>}
                     </div>
                     <input type="file" ref={bgFileInputRef} onChange={handleBgFileUpload} accept="image/*" className="hidden" />
                     <div className="relative">
                        <LinkIcon className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-300`} size={16} />
                        <input 
                          type="url" 
                          value={formData.backgroundImage} 
                          onChange={e => handleChange('backgroundImage', e.target.value)} 
                          placeholder={lang === 'ar' ? 'أو ضع رابط صورة مباشر هنا...' : 'Or paste direct image URL here...'} 
                          className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} text-xs`} 
                        />
                     </div>
                  </div>
                )}
             </div>

             <div className="flex items-center justify-between pt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                   <div className={`p-4 rounded-[1.2rem] transition-all ${formData.isDark ? 'bg-gray-900 text-yellow-400 shadow-inner' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                      {formData.isDark ? <Moon size={24}/> : <Sun size={24}/>}
                   </div>
                   <div>
                      <span className="text-sm font-black dark:text-white block uppercase leading-none mb-1">{lang === 'ar' ? 'وضع البطاقة' : 'Card Mode'}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formData.isDark ? (lang === 'ar' ? 'ليلي / مظلم' : 'Dark Mode') : (lang === 'ar' ? 'نهاري / فاتح' : 'Light Mode')}</span>
                   </div>
                </div>
                <button 
                  onClick={() => handleChange('isDark', !formData.isDark)} 
                  className={`w-16 h-8 rounded-full relative transition-all shadow-inner ${formData.isDark ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-800'}`}
                >
                   <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${formData.isDark ? (isRtl ? 'right-9' : 'left-9') : (isRtl ? 'right-1' : 'left-1')}`} />
                </button>
             </div>
          </div>

          <button onClick={handleFinalSave} className="w-full py-6 bg-blue-600 text-white rounded-[2.2rem] font-black text-xl shadow-2xl shadow-blue-500/20 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            <Save size={24} />
            {t('saveChanges')}
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
