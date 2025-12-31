
import React, { useState, useEffect, useRef } from 'react';
import { CardData, Language, SocialLink, ThemeType } from '../types';
import { TRANSLATIONS, THEME_COLORS, THEME_GRADIENTS, SOCIAL_PLATFORMS, SAMPLE_DATA, TEMPLATES } from '../constants';
import { generateProfessionalBio } from '../services/geminiService';
import { generateSerialId } from '../utils/share';
import { isSlugAvailable, auth } from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import CardPreview from '../components/CardPreview';
import SocialIcon from '../components/SocialIcon';
import { Save, Plus, X, Trash2, Loader2, Sparkles, Moon, Sun, Hash, Mail, Phone, Globe, MessageCircle, Star, Pipette, Link as LinkIcon, CheckCircle2, ShieldCheck, AlertCircle, UploadCloud, Image as ImageIcon, Palette, Layout, Layers, User as UserIcon, Briefcase, Info, Camera, Share2 } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  
  const originalIdRef = useRef<string | null>(initialData?.id || null);

  const getDefaults = (l: Language): CardData => {
    const baseSample = SAMPLE_DATA[l] || SAMPLE_DATA['en'] || {};
    return {
      id: generateSerialId(),
      templateId: 'classic',
      name: '', title: '', company: '', bio: '', email: '', phone: '', whatsapp: '', website: '', location: '', locationUrl: '', profileImage: '',
      themeType: 'color', themeColor: THEME_COLORS[0], themeGradient: THEME_GRADIENTS[0], backgroundImage: '',
      isDark: false, socialLinks: [],
      ...baseSample
    } as CardData;
  };

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
    setIsUploading(true);
    try {
      const base64Image = await uploadImageToCloud(file);
      if (base64Image) handleChange('profileImage', base64Image);
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploadingBg(false);
      if (bgFileInputRef.current) bgFileInputRef.current.value = '';
    }
  };

  const checkAvailability = async () => {
    if (!formData.id || formData.id.length < 3) {
      alert(isRtl ? 'الرابط قصير جداً' : 'Link is too short');
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
      alert(isRtl ? 'يرجى كتابة الاسم والمسمى الوظيفي أولاً' : 'Fill name and job title first');
      return;
    }
    setIsGeneratingBio(true);
    try {
      const bio = await generateProfessionalBio(formData.name, formData.title, formData.company, formData.bio, lang);
      if (bio) handleChange('bio', bio);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  const handleFinalSave = async () => {
    if (slugStatus !== 'available' && formData.id.toLowerCase() !== originalIdRef.current?.toLowerCase()) {
      const available = await isSlugAvailable(formData.id, formData.ownerId || auth.currentUser?.uid);
      if (!available) {
        setSlugStatus('taken');
        alert(isRtl ? 'هذا الرابط مستخدم بالفعل' : 'Link taken');
        return;
      }
    }
    onSave(formData, originalIdRef.current || undefined);
  };

  const inputClasses = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all shadow-sm placeholder:text-gray-300 font-medium text-[13px]";
  const labelClasses = "block text-[9px] font-black text-gray-400 dark:text-gray-500 mb-1 px-1 uppercase tracking-widest";

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-10">
      <div className="flex-1 space-y-4">
        <div className="bg-white dark:bg-[#121215] p-5 md:p-6 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-800 space-y-4">
          
          {/* 1. الرابط المخصص */}
          <div className="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex flex-col sm:flex-row items-center gap-2">
             <div className="relative flex-1 w-full">
                <input 
                  type="text" 
                  value={formData.id} 
                  onChange={e => handleChange('id', e.target.value)} 
                  className={`${inputClasses} ${isRtl ? 'pr-10' : 'pl-10'} !py-2.5 !rounded-xl text-blue-600 font-black`}
                  placeholder="username" 
                />
                <Hash className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-blue-400`} size={16} />
                <div className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`}>
                  {slugStatus === 'available' && <CheckCircle2 className="text-emerald-500" size={18} />}
                  {slugStatus === 'taken' && <AlertCircle className="text-red-500" size={18} />}
                </div>
             </div>
             <button onClick={checkAvailability} disabled={slugStatus === 'checking'} className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase shadow-md flex items-center justify-center gap-2 transition-all hover:bg-blue-700 active:scale-95">
               {slugStatus === 'checking' ? <Loader2 size={12} className="animate-spin" /> : <LinkIcon size={12} />}
               {isRtl ? 'احجز اسمك الآن' : 'Claim Your Name'}
             </button>
          </div>

          {/* 2. الهوية الشخصية */}
          <div className="bg-gray-50/50 dark:bg-gray-900/20 p-4 md:p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 grid grid-cols-1 xl:grid-cols-12 gap-6">
             <div className="xl:col-span-3 flex flex-col items-center gap-3">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-[1.8rem] overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                     {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" /> : <UserIcon size={30} className="text-gray-300" />}
                     {isUploading && <div className="absolute inset-0 bg-indigo-600/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" size={20} /></div>}
                  </div>
                  <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:scale-105 active:scale-95 transition-all"><Camera size={14} /></button>
                </div>
                <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-100 dark:border-gray-700 w-full text-[8px] font-black uppercase">
                   <button onClick={() => setActiveImgTab('upload')} className={`flex-1 py-1 rounded ${activeImgTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>{isRtl ? 'جهاز' : 'File'}</button>
                   <button onClick={() => setActiveImgTab('link')} className={`flex-1 py-1 rounded ${activeImgTab === 'link' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>{isRtl ? 'رابط' : 'Link'}</button>
                </div>
                {activeImgTab === 'link' && <input type="url" value={formData.profileImage} onChange={e => handleChange('profileImage', e.target.value)} placeholder="https://..." className={`${inputClasses} !py-1.5 !text-[10px]`} />}
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
             </div>

             <div className="xl:col-span-9 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <div><label className={labelClasses}>{t('fullName')}</label><input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} /></div>
                   <div className="grid grid-cols-2 gap-2">
                      <div><label className={labelClasses}>{t('jobTitle')}</label><input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClasses} /></div>
                      <div><label className={labelClasses}>{t('company')}</label><input type="text" value={formData.company} onChange={e => handleChange('company', e.target.value)} className={inputClasses} /></div>
                   </div>
                </div>
                <div>
                   <div className="flex justify-between items-center mb-1">
                      <label className={labelClasses}>{t('bio')}</label>
                      <button onClick={handleGenerateAIBio} disabled={isGeneratingBio} className="text-[8px] font-black text-blue-600 uppercase flex items-center gap-1">
                        {isGeneratingBio ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} {isRtl ? 'ذكاء اصطناعي' : 'AI Bio'}
                      </button>
                   </div>
                   <textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} rows={2} className={`${inputClasses} !py-2 resize-none min-h-[60px]`} />
                </div>
             </div>
          </div>

          {/* 3. التواصل والشبكات الاجتماعية */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
             {/* بيانات التواصل */}
             <div className="xl:col-span-8 bg-gray-50/50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                <h4 className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 mb-2"><Phone size={14} /> {isRtl ? 'بيانات التواصل' : 'Contact Details'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   <div className="relative"><Mail className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={12} /><input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-9' : 'pl-9'}`} placeholder="Email" /></div>
                   <div className="relative"><Phone className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={12} /><input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-9' : 'pl-9'}`} placeholder="Phone" /></div>
                   <div className="relative"><MessageCircle className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={12} /><input type="tel" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-9' : 'pl-9'}`} placeholder="WhatsApp" /></div>
                   <div className="relative"><Globe className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={12} /><input type="url" value={formData.website} onChange={e => handleChange('website', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-9' : 'pl-9'}`} placeholder="Website" /></div>
                </div>
             </div>

             {/* الروابط الاجتماعية */}
             <div className="xl:col-span-4 bg-gray-50/50 dark:bg-gray-900/20 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                <h4 className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2 mb-2"><Share2 size={14} /> {isRtl ? 'الروابط الاجتماعية' : 'Socials'}</h4>
                <div className="flex gap-1.5 mb-2">
                   <select value={socialInput.platformId} onChange={e => setSocialInput({...socialInput, platformId: e.target.value})} className="bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-100 text-[9px] font-black outline-none w-1/3">
                      {SOCIAL_PLATFORMS.slice(0, 15).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                   </select>
                   <input type="url" value={socialInput.url} onChange={e => setSocialInput({...socialInput, url: e.target.value})} placeholder="URL" className={`${inputClasses} !py-1.5 !px-2 flex-1`} />
                   <button onClick={addSocialLink} className="p-2 bg-blue-600 text-white rounded-lg transition-transform active:scale-90"><Plus size={14} /></button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar">
                   {formData.socialLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 bg-white dark:bg-gray-800 px-2 py-1.5 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in">
                         <SocialIcon platformId={link.platformId} size={11} color="#3b82f6" />
                         <span className="text-[8px] font-black uppercase text-gray-400">{link.platform}</span>
                         <button onClick={() => removeSocialLink(idx)} className="text-red-400 ml-1 hover:text-red-600 transition-colors"><X size={10} /></button>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* 4. قسم القوالب (سطر مستقل كامل) */}
          <div className="bg-gray-50/50 dark:bg-gray-900/20 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800">
             <div className="flex items-center gap-3 mb-4">
                <Layout className="text-blue-600" size={18} />
                <h4 className="text-[11px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-wider">{isRtl ? 'اختر قالب التصميم' : 'Select Layout Template'}</h4>
             </div>
             <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
                {TEMPLATES.map(tmpl => (
                   <button 
                     key={tmpl.id} 
                     onClick={() => handleChange('templateId', tmpl.id)} 
                     className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 group ${formData.templateId === tmpl.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}
                   >
                      <Layout size={16} className={formData.templateId === tmpl.id ? 'text-white' : 'group-hover:text-blue-500'} />
                      <span className="text-[8px] font-black uppercase text-center truncate w-full">{isRtl ? tmpl.nameAr : tmpl.nameEn}</span>
                   </button>
                ))}
             </div>
          </div>

          {/* 5. السمة والمظهر */}
          <div className="bg-white dark:bg-gray-950 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center gap-6">
             <div className="flex bg-gray-50 dark:bg-gray-900 p-1.5 rounded-xl border border-gray-100 dark:border-gray-800 shrink-0">
                <button onClick={() => handleChange('themeType', 'image')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2 ${formData.themeType === 'image' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400'}`}>
                   <ImageIcon size={14} /> {isRtl ? 'صورة' : 'Img'}
                </button>
                <button onClick={() => handleChange('themeType', 'gradient')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2 ${formData.themeType === 'gradient' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400'}`}>
                   <Sparkles size={14} /> {isRtl ? 'تدرج' : 'Grad'}
                </button>
                <button onClick={() => handleChange('themeType', 'color')} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all flex items-center gap-2 ${formData.themeType === 'color' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400'}`}>
                   <Palette size={14} /> {isRtl ? 'لون' : 'Color'}
                </button>
             </div>

             <div className="flex-1 w-full overflow-hidden">
                {formData.themeType === 'color' && (
                  <div className="flex flex-wrap gap-2">
                    {THEME_COLORS.map(color => (
                      <button key={color} onClick={() => handleChange('themeColor', color)} className="w-8 h-8 rounded-full shadow-sm relative transition-transform hover:scale-110" style={{ backgroundColor: color }}>
                        {formData.themeColor === color && <div className="absolute -inset-1 border-2 border-blue-600 rounded-full" />}
                      </button>
                    ))}
                  </div>
                )}
                {formData.themeType === 'gradient' && (
                  <div className="flex flex-wrap gap-2">
                    {THEME_GRADIENTS.map((grad, i) => (
                      <button key={i} onClick={() => handleChange('themeGradient', grad)} className="w-8 h-8 rounded-full shadow-sm relative transition-transform hover:scale-110" style={{ background: grad }}>
                        {formData.themeGradient === grad && <div className="absolute inset-0 border-2 border-white/50 rounded-full" />}
                      </button>
                    ))}
                  </div>
                )}
                {formData.themeType === 'image' && (
                  <div className="flex items-center gap-3">
                     <input type="file" ref={bgFileInputRef} onChange={handleBgFileUpload} className="hidden" />
                     <button onClick={() => bgFileInputRef.current?.click()} className="px-4 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 text-[10px] font-black uppercase text-blue-600 flex items-center gap-2">
                        {isUploadingBg ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={14} />} {isRtl ? 'رفع خلفية' : 'Upload BG'}
                     </button>
                     <input type="url" value={formData.backgroundImage} onChange={e => handleChange('backgroundImage', e.target.value)} placeholder="URL..." className={`${inputClasses} !py-2 !text-[10px] flex-1`} />
                  </div>
                )}
             </div>

             <button onClick={() => handleChange('isDark', !formData.isDark)} className={`p-3 rounded-xl transition-all shadow-sm ${formData.isDark ? 'bg-gray-900 text-yellow-400 border border-gray-700' : 'bg-gray-100 text-gray-500 border border-gray-200'}`}>
                {formData.isDark ? <Moon size={18}/> : <Sun size={18}/>}
             </button>
          </div>

          <button onClick={handleFinalSave} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3">
            <Save size={20} />
            {t('saveChanges')}
          </button>
        </div>
      </div>

      {/* المعاينة المباشرة */}
      <div className="hidden lg:block w-[320px] sticky top-8 self-start animate-fade-in">
        <div className="p-3 bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl scale-[0.9] origin-top">
           <div className="mb-2 px-4 flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'معاينة مباشرة' : 'Live Preview'}</span>
           </div>
           <CardPreview data={formData} lang={lang} />
        </div>
      </div>
    </div>
  );
};

export default Editor;
