
import React, { useState, useEffect, useRef } from 'react';
import { CardData, Language, SocialLink, CustomTemplate } from '../types';
import { TRANSLATIONS, THEME_COLORS, THEME_GRADIENTS, SOCIAL_PLATFORMS, SAMPLE_DATA } from '../constants';
import { generateProfessionalBio } from '../services/geminiService';
import { generateSerialId } from '../utils/share';
import { isSlugAvailable, auth } from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import CardPreview from '../components/CardPreview';
import SocialIcon from '../components/SocialIcon';
import { 
  Save, Plus, X, Loader2, Sparkles, Moon, Sun, Hash, 
  Mail, Phone, Globe, MessageCircle, Link as LinkIcon, 
  CheckCircle2, AlertCircle, UploadCloud, Image as ImageIcon, 
  Palette, Layout, User as UserIcon, Camera, Share2, 
  Pipette, Type as TypographyIcon, Smartphone, Tablet, Monitor, Eye, ArrowLeft
} from 'lucide-react';

interface EditorProps {
  lang: Language;
  onSave: (data: CardData, oldId?: string) => void;
  onCancel: () => void;
  initialData?: CardData;
  isAdminEdit?: boolean;
  templates: CustomTemplate[];
}

const Editor: React.FC<EditorProps> = ({ lang, onSave, onCancel, initialData, isAdminEdit, templates }) => {
  const isRtl = lang === 'ar';
  const t = (key: string, fallback?: string) => {
    if (fallback && !TRANSLATIONS[key]) return isRtl ? key : fallback;
    return TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;
  };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const originalIdRef = useRef<string | null>(initialData?.id || null);

  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [showMobilePreview, setShowMobilePreview] = useState(false);

  const [formData, setFormData] = useState<CardData>(() => {
    const data = initialData || {
      ...(SAMPLE_DATA[lang] || SAMPLE_DATA['en']),
      id: generateSerialId(),
      templateId: 'classic',
    } as CardData;

    const selectedTmpl = templates.find(t => t.id === data.templateId);
    if (selectedTmpl && !data.ownerId) {
       return {
         ...data,
         themeType: selectedTmpl.config.defaultThemeType || data.themeType,
         themeColor: selectedTmpl.config.defaultThemeColor || data.themeColor,
         themeGradient: selectedTmpl.config.defaultThemeGradient || data.themeGradient,
         backgroundImage: selectedTmpl.config.defaultBackgroundImage || data.backgroundImage,
         profileImage: selectedTmpl.config.defaultProfileImage || data.profileImage,
         isDark: selectedTmpl.config.defaultIsDark ?? data.isDark,
         nameColor: selectedTmpl.config.nameColor || null,
         titleColor: selectedTmpl.config.titleColor || null,
         bioTextColor: selectedTmpl.config.bioTextColor || null,
         bioBgColor: selectedTmpl.config.bioBgColor || null,
         linksColor: selectedTmpl.config.linksColor || null
       } as CardData;
    }
    return data;
  });

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

    if (field === 'templateId') {
      const newTmpl = templates.find(t => t.id === value);
      if (newTmpl) {
        setFormData(prev => ({
          ...prev,
          templateId: value,
          themeType: newTmpl.config.defaultThemeType || prev.themeType,
          themeColor: newTmpl.config.defaultThemeColor || prev.themeColor,
          themeGradient: newTmpl.config.defaultThemeGradient || prev.themeGradient,
          backgroundImage: newTmpl.config.defaultBackgroundImage || prev.backgroundImage,
          profileImage: newTmpl.config.defaultProfileImage || prev.profileImage,
          isDark: newTmpl.config.defaultIsDark ?? prev.isDark,
          nameColor: newTmpl.config.nameColor || prev.nameColor || null,
          titleColor: newTmpl.config.titleColor || prev.titleColor || null,
          bioTextColor: newTmpl.config.bioTextColor || prev.bioTextColor || null,
          bioBgColor: newTmpl.config.bioBgColor || prev.bioBgColor || null,
          linksColor: newTmpl.config.linksColor || prev.linksColor || null
        }));
        return;
      }
    }

    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currentTemplate = templates.find(t => t.id === formData.templateId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64Image = await uploadImageToCloud(file);
      if (base64Image) handleChange('profileImage', base64Image);
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
    } finally {
      setIsUploadingBg(false);
      if (bgFileInputRef.current) bgFileInputRef.current.value = '';
    }
  };

  const checkAvailability = async () => {
    if (!formData.id || formData.id.length < 3) return;
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
    if (!formData.name || !formData.title) return;
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
        return;
      }
    }
    onSave(formData, originalIdRef.current || undefined);
  };

  const inputClasses = "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all shadow-sm placeholder:text-gray-300 font-medium text-[13px]";
  const labelClasses = "block text-[9px] font-black text-gray-400 dark:text-gray-500 mb-1 px-1 uppercase tracking-widest";

  const ColorPickerField = ({ label, field, value }: { label: string, field: keyof CardData, value?: string | null }) => (
    <div className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider shrink-0">{label}</span>
      <div className="flex items-center gap-2">
         <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
            <input 
              type="color" 
              value={value || '#000000'} 
              onChange={(e) => handleChange(field, e.target.value)} 
              className="absolute inset-0 opacity-0 cursor-pointer scale-150" 
            />
            <div className="w-full h-full" style={{ backgroundColor: value || (isRtl ? '#cccccc' : '#eee') }} />
         </div>
         <button onClick={() => handleChange(field, null)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"><X size={14}/></button>
      </div>
    </div>
  );

  const PreviewContent = ({ isMobileView = false }) => (
    <div className={`flex flex-col items-center w-full ${isMobileView ? 'scale-[0.85] sm:scale-100' : ''}`}>
      {!isMobileView && (
        <div className="mb-4 w-full flex items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{isRtl ? 'معاينة حية' : 'Live Preview'}</span>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
             <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-lg transition-all ${previewDevice === 'mobile' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Smartphone size={16}/></button>
             <button onClick={() => setPreviewDevice('tablet')} className={`p-2 rounded-lg transition-all ${previewDevice === 'tablet' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Tablet size={16}/></button>
             <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-lg transition-all ${previewDevice === 'desktop' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Monitor size={16}/></button>
          </div>
        </div>
      )}
      
      <div className={`transition-all duration-500 ease-in-out origin-top border-[8px] border-gray-900 dark:border-gray-800 rounded-[3rem] shadow-2xl overflow-hidden bg-white dark:bg-gray-950 ${isMobileView ? 'w-[280px]' : previewDevice === 'mobile' ? 'w-[320px]' : previewDevice === 'tablet' ? 'w-[480px]' : 'w-[360px]'}`}>
        <div className={`${isMobileView ? 'h-[500px]' : 'h-[600px]'} overflow-y-auto no-scrollbar`}>
          <CardPreview 
            data={formData} 
            lang={lang} 
            customConfig={currentTemplate?.config} 
            hideSaveButton={true}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6">
      <div className="flex flex-col lg:flex-row gap-8 pb-32 items-start justify-center">
        <div className="w-full lg:max-w-[960px] flex-1 space-y-6">
          <div className="bg-white dark:bg-[#121215] p-5 md:p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 space-y-6">
            
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                  <input 
                    type="text" 
                    value={formData.id} 
                    onChange={e => handleChange('id', e.target.value)} 
                    className={`${inputClasses} ${isRtl ? 'pr-10' : 'pl-10'} !py-3 !rounded-xl text-blue-600 font-black text-base`}
                    placeholder="username" 
                  />
                  <Hash className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-blue-400`} size={18} />
                  <div className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2`}>
                    {slugStatus === 'available' && <CheckCircle2 className="text-emerald-500" size={20} />}
                    {slugStatus === 'taken' && <AlertCircle className="text-red-500" size={20} />}
                  </div>
              </div>
              <button onClick={checkAvailability} disabled={slugStatus === 'checking'} className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-md flex items-center justify-center gap-2 transition-all hover:bg-blue-700 active:scale-95">
                {slugStatus === 'checking' ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
                {isRtl ? 'تحقق من الرابط' : 'Check URL'}
              </button>
            </div>

            <div className="bg-gray-50/50 dark:bg-gray-900/20 p-5 md:p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-3 flex flex-col items-center gap-4">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-[2.2rem] overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                      {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" /> : <UserIcon size={36} className="text-gray-300" />}
                      {isUploading && <div className="absolute inset-0 bg-indigo-600/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" size={24} /></div>}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Camera size={16} /></button>
                  </div>
                  <div className="flex bg-white dark:bg-gray-800 p-1 rounded-lg border border-gray-100 dark:border-gray-700 w-full text-[9px] font-black uppercase">
                    <button onClick={() => setActiveImgTab('upload')} className={`flex-1 py-1.5 rounded-md ${activeImgTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>{isRtl ? 'جهاز' : 'File'}</button>
                    <button onClick={() => setActiveImgTab('link')} className={`flex-1 py-1.5 rounded-md ${activeImgTab === 'link' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>{isRtl ? 'رابط' : 'Link'}</button>
                  </div>
                  {activeImgTab === 'link' && <input type="url" value={formData.profileImage} onChange={e => handleChange('profileImage', e.target.value)} placeholder="https://..." className={`${inputClasses} !py-2 !text-[10px]`} />}
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>

              <div className="xl:col-span-9 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className={labelClasses}>{t('fullName')}</label><input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} /></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className={labelClasses}>{t('jobTitle')}</label><input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClasses} /></div>
                        <div><label className={labelClasses}>{t('company')}</label><input type="text" value={formData.company} onChange={e => handleChange('company', e.target.value)} className={inputClasses} /></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                        <label className={labelClasses}>{t('bio')}</label>
                        <button onClick={handleGenerateAIBio} disabled={isGeneratingBio} className="text-[9px] font-black text-blue-600 uppercase flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                          {isGeneratingBio ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} {isRtl ? 'ذكاء اصطناعي' : 'AI Bio'}
                        </button>
                    </div>
                    <textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} rows={3} className={`${inputClasses} !py-3 resize-none min-h-[80px]`} />
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="bg-gray-50/50 dark:bg-gray-900/20 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-4">
                  <h4 className="text-[11px] font-black uppercase text-gray-500 flex items-center gap-2 mb-3"><Phone size={16} /> {isRtl ? 'بيانات التواصل' : 'Contact Details'}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative"><Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={14} /><input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-10' : 'pl-10'}`} placeholder="Email" /></div>
                    <div className="relative"><Phone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={14} /><input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-10' : 'pl-10'}`} placeholder="Phone" /></div>
                    <div className="relative"><MessageCircle className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={14} /><input type="tel" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-10' : 'pl-10'}`} placeholder="WhatsApp" /></div>
                    <div className="relative"><Globe className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={14} /><input type="url" value={formData.website} onChange={e => handleChange('website', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-10' : 'pl-10'}`} placeholder="Website" /></div>
                  </div>
              </div>

              <div className="bg-gray-50/50 dark:bg-gray-900/20 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 space-y-3">
                  <h4 className="text-[11px] font-black uppercase text-gray-500 flex items-center gap-2 mb-3"><Share2 size={16} /> {isRtl ? 'الروابط الاجتماعية' : 'Socials'}</h4>
                  <div className="flex gap-2 mb-3">
                    <select value={socialInput.platformId} onChange={e => setSocialInput({...socialInput, platformId: e.target.value})} className="bg-white dark:bg-gray-800 p-2.5 rounded-xl border border-gray-100 text-[10px] font-black outline-none w-1/3">
                        {SOCIAL_PLATFORMS.slice(0, 15).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="url" value={socialInput.url} onChange={e => setSocialInput({...socialInput, url: e.target.value})} placeholder="URL" className={`${inputClasses} !py-2.5 flex-1`} />
                    <button onClick={addSocialLink} className="p-3 bg-blue-600 text-white rounded-xl transition-transform active:scale-90"><Plus size={16} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto no-scrollbar">
                    {formData.socialLinks.map((link, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in">
                          <SocialIcon platformId={link.platformId} size={12} color="#3b82f6" />
                          <span className="text-[9px] font-black uppercase text-gray-500">{link.platform}</span>
                          <button onClick={() => removeSocialLink(idx)} className="text-red-400 ml-1 hover:text-red-600 transition-colors"><X size={12} /></button>
                        </div>
                    ))}
                  </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#121215] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Layout className="text-blue-600" size={20} />
                    <h4 className="text-[12px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest">{isRtl ? 'اختر قالب التصميم' : 'Select Layout Template'}</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {templates.map(tmpl => (
                      <button 
                        key={tmpl.id} 
                        onClick={() => handleChange('templateId', tmpl.id)} 
                        className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${formData.templateId === tmpl.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}
                      >
                          <Layout size={18} className={formData.templateId === tmpl.id ? 'text-white' : 'group-hover:text-blue-500'} />
                          <span className="text-[9px] font-black uppercase text-center truncate w-full">{isRtl ? tmpl.nameAr : tmpl.nameEn}</span>
                      </button>
                    ))}
                </div>
              </div>

              <div className="pt-8 border-t border-gray-50 dark:border-gray-800 space-y-8">
                 <div className="flex items-center gap-3">
                    <Palette className="text-blue-600" size={20} />
                    <h4 className="text-[12px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest">{isRtl ? 'المظهر والألوان' : 'Appearance & Colors'}</h4>
                 </div>
                 
                 <div className="flex flex-col items-center gap-6">
                    <div className="flex bg-gray-50 dark:bg-gray-900 p-1 rounded-2xl border border-gray-100 dark:border-gray-800 shrink-0 w-full sm:w-auto">
                        <button onClick={() => handleChange('themeType', 'color')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${formData.themeType === 'color' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400'}`}>
                          <Palette size={16} /> {isRtl ? 'لون' : 'Color'}
                        </button>
                        <button onClick={() => handleChange('themeType', 'gradient')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${formData.themeType === 'gradient' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400'}`}>
                          <Sparkles size={16} /> {isRtl ? 'تدرج' : 'Grad'}
                        </button>
                        <button onClick={() => handleChange('themeType', 'image')} className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 ${formData.themeType === 'image' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400'}`}>
                          <ImageIcon size={16} /> {isRtl ? 'صورة' : 'Img'}
                        </button>
                    </div>

                    <div className="w-full">
                       {formData.themeType === 'color' && (
                         <div className="flex flex-wrap items-center justify-center gap-4 py-4 animate-fade-in">
                           {THEME_COLORS.map(c => (
                             <button key={c} onClick={() => handleChange('themeColor', c)} className="w-10 h-10 rounded-full shadow-md relative transition-transform hover:scale-110" style={{ backgroundColor: c }}>
                               {formData.themeColor === c && <div className="absolute -inset-1.5 border-2 border-blue-600 rounded-full" />}
                             </button>
                           ))}
                           <div className="relative">
                              <button onClick={() => colorInputRef.current?.click()} className="w-10 h-10 rounded-full border border-dashed border-gray-300 flex items-center justify-center bg-white dark:bg-gray-900" style={{ backgroundColor: !THEME_COLORS.includes(formData.themeColor) ? formData.themeColor : undefined }}>
                                 <Pipette size={16} className="text-gray-400" />
                                 <input type="color" ref={colorInputRef} className="absolute inset-0 opacity-0 cursor-pointer" />
                              </button>
                           </div>
                         </div>
                       )}
                       {formData.themeType === 'gradient' && (
                         <div className="flex flex-wrap items-center justify-center gap-4 py-4 animate-fade-in">
                           {THEME_GRADIENTS.map((g, i) => (
                             <button key={i} onClick={() => handleChange('themeGradient', g)} className="w-10 h-10 rounded-full shadow-md relative transition-transform hover:scale-110" style={{ background: g }}>
                               {formData.themeGradient === g && <div className="absolute -inset-1.5 border-2 border-blue-600 rounded-full" />}
                             </button>
                           ))}
                         </div>
                       )}
                       {formData.themeType === 'image' && (
                          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md mx-auto py-4 animate-fade-in">
                             <button onClick={() => bgFileInputRef.current?.click()} className="flex-1 py-4 px-6 bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-[10px] font-black uppercase text-blue-600 flex items-center justify-center gap-3">
                                {isUploadingBg ? <Loader2 className="animate-spin" size={16}/> : <UploadCloud size={16}/>} {t('رفع خلفية مخصصة', 'Upload Custom Background')}
                             </button>
                             <input type="file" ref={bgFileInputRef} onChange={handleBgFileUpload} className="hidden" accept="image/*" />
                          </div>
                       )}
                    </div>

                    <button onClick={() => handleChange('isDark', !formData.isDark)} className={`p-4 px-8 rounded-2xl transition-all shadow-md flex items-center gap-3 ${formData.isDark ? 'bg-gray-900 text-yellow-400 border border-gray-700' : 'bg-gray-50 text-gray-500 border border-gray-100'}`}>
                        {formData.isDark ? <Moon size={20}/> : <Sun size={20}/>}
                        <span className="text-[10px] font-black uppercase tracking-widest">{formData.isDark ? (isRtl ? 'ليلي' : 'Dark') : (isRtl ? 'نهاري' : 'Light')}</span>
                    </button>
                 </div>
              </div>

              <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                    <TypographyIcon className="text-blue-600" size={20} />
                    <h4 className="text-[12px] font-black uppercase text-gray-700 dark:text-gray-300 tracking-widest">{isRtl ? 'تخصيص ألوان النصوص' : 'Custom Text Colors'}</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <ColorPickerField label={t('اسم المستخدم', 'Name')} field="nameColor" value={formData.nameColor} />
                    <ColorPickerField label={t('المسمى الوظيفي', 'Title')} field="titleColor" value={formData.titleColor} />
                    <ColorPickerField label={t('الروابط', 'Links')} field="linksColor" value={formData.linksColor} />
                    <ColorPickerField label={t('نص النبذة', 'Bio Text')} field="bioTextColor" value={formData.bioTextColor} />
                    <ColorPickerField label={t('خلفية النبذة', 'Bio Bg')} field="bioBgColor" value={formData.bioBgColor} />
                </div>
              </div>
            </div>

            <button onClick={handleFinalSave} className="hidden lg:flex w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-blue-500/30 hover:scale-[1.01] active:scale-95 transition-all items-center justify-center gap-4">
              <Save size={24} />
              {t('saveChanges')}
            </button>
          </div>
        </div>

        {/* Desktop Preview Panel */}
        <div className="hidden lg:block w-[480px] sticky top-12 self-start animate-fade-in">
          <div className="p-4 bg-white dark:bg-gray-900 rounded-[4rem] border border-gray-100 dark:border-gray-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] origin-top">
            <PreviewContent />
          </div>
        </div>
      </div>

      {/* شريط الإجراءات السفلي ممتد للجوال - المحرر (تصميم زجاجي بسيط) */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-[150] animate-fade-in-up">
        <div className="bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-t border-gray-100/30 dark:border-white/5 px-8 py-5 pb-8 flex items-center justify-between">
          <button 
            onClick={onCancel} 
            className="flex flex-col items-center gap-1.5 p-2 text-gray-400 group transition-all"
          >
            <ArrowLeft size={22} className={`transition-transform duration-300 group-active:scale-90 ${isRtl ? 'rotate-0' : 'rotate-180'}`} />
            <span className="text-[9px] font-black uppercase tracking-wider opacity-60">{isRtl ? 'رجوع' : 'Back'}</span>
          </button>
          
          <button 
            onClick={() => setShowMobilePreview(true)}
            className="relative flex flex-col items-center gap-1.5 px-12 py-3 bg-blue-600 text-white rounded-[2rem] shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Eye size={20} />
            <span className="text-[9px] font-black uppercase tracking-wider">{isRtl ? 'معاينة' : 'Preview'}</span>
          </button>

          <button 
            onClick={handleFinalSave}
            className="flex flex-col items-center gap-1.5 p-2 text-blue-600 group transition-all"
          >
            <Save size={22} className="transition-transform duration-300 group-active:scale-90" />
            <span className="text-[9px] font-black uppercase tracking-wider opacity-60">{isRtl ? 'حفظ' : 'Save'}</span>
          </button>
        </div>
      </nav>

      {/* Mobile Preview Modal - Enhanced Framing */}
      {showMobilePreview && (
        <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in lg:hidden">
           <div className="absolute inset-0" onClick={() => setShowMobilePreview(false)}></div>
           <div className="relative w-full max-w-[320px] bg-white dark:bg-gray-900 rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-bounce-in border-[4px] border-white dark:border-gray-800">
              <div className="flex items-center justify-between p-6 pb-2 border-b border-gray-100 dark:border-white/5">
                 <h3 className="text-gray-900 dark:text-white font-black uppercase text-[10px] tracking-[0.2em]">{isRtl ? 'معاينة حية' : 'Live Preview'}</h3>
                 <button onClick={() => setShowMobilePreview(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={20}/></button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar py-4 px-2">
                 <PreviewContent isMobileView={true} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
