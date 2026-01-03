
import { 
  Save, Plus, X, Loader2, Sparkles, Moon, Sun, 
  Mail, Phone, Globe, MessageCircle, Link as LinkIcon, 
  CheckCircle2, AlertCircle, UploadCloud, ImageIcon, 
  Palette, Layout, User as UserIcon, Camera, 
  Pipette, Type as TypographyIcon, Smartphone, Tablet, Monitor, Eye, 
  RefreshCcw, FileText, Calendar, MapPin, PartyPopper, Move, Wind, 
  GlassWater, Link2, Sparkle, LayoutGrid, EyeOff, Ruler, Wand2, Building2, Timer,
  QrCode, Share2, Trash2
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import CardPreview from '../components/CardPreview';
import SocialIcon from '../components/SocialIcon';
import { BACKGROUND_PRESETS, SAMPLE_DATA, SOCIAL_PLATFORMS, THEME_COLORS, THEME_GRADIENTS, TRANSLATIONS } from '../constants';
import { isSlugAvailable, auth } from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import { CardData, CustomTemplate, Language } from '../types';
import { generateSerialId } from '../utils/share';

interface EditorProps {
  lang: Language;
  onSave: (data: CardData, oldId?: string) => void;
  onCancel: () => void;
  initialData?: CardData;
  isAdminEdit?: boolean;
  templates: CustomTemplate[];
  forcedTemplateId?: string; 
}

type EditorTab = 'identity' | 'social' | 'design' | 'occasion';

const Editor: React.FC<EditorProps> = ({ lang, onSave, onCancel, initialData, isAdminEdit, templates, forcedTemplateId }) => {
  const isRtl = lang === 'ar';
  const t = (key: string, fallback?: string) => {
    if (fallback && !TRANSLATIONS[key]) return isRtl ? key : fallback;
    return TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const originalIdRef = useRef<string | null>(initialData?.id || null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<EditorTab>('identity');
  const [isSimpleMode, setIsSimpleMode] = useState(false); 
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [previewMouseY, setPreviewMouseY] = useState(0);
  
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const [formData, setFormData] = useState<CardData>(() => {
    const targetTemplateId = initialData?.templateId || forcedTemplateId || templates[0]?.id || 'classic';
    const selectedTmpl = templates.find(t => t.id === targetTemplateId);
    
    if (initialData) return initialData;

    const baseData = { ...(SAMPLE_DATA[lang] || SAMPLE_DATA['en']), id: generateSerialId(), templateId: targetTemplateId } as CardData;

    if (selectedTmpl) {
       return {
         ...baseData,
         name: selectedTmpl.config.defaultName || baseData.name,
         templateId: targetTemplateId,
         themeType: selectedTmpl.config.defaultThemeType || baseData.themeType,
         themeColor: selectedTmpl.config.defaultThemeColor || baseData.themeColor,
         themeGradient: selectedTmpl.config.defaultThemeGradient || baseData.themeGradient,
         backgroundImage: selectedTmpl.config.defaultBackgroundImage || baseData.backgroundImage,
         isDark: selectedTmpl.config.defaultIsDark ?? baseData.isDark,
         pageBgColor: selectedTmpl.config.pageBgColor || '',
         showOccasion: selectedTmpl.config.showOccasionByDefault ?? false,
         showName: selectedTmpl.config.showNameByDefault ?? true,
         showTitle: selectedTmpl.config.showTitleByDefault ?? true,
         showCompany: selectedTmpl.config.showCompanyByDefault ?? true,
         showBio: selectedTmpl.config.showBioByDefault ?? true,
         showEmail: selectedTmpl.config.showEmailByDefault ?? true,
         showPhone: selectedTmpl.config.showPhoneByDefault ?? true,
         showWebsite: selectedTmpl.config.showWebsiteByDefault ?? true,
         showWhatsapp: selectedTmpl.config.showWhatsappByDefault ?? true,
         showSocialLinks: selectedTmpl.config.showSocialLinksByDefault ?? true,
         showButtons: selectedTmpl.config.showButtonsByDefault ?? true,
         showQrCode: selectedTmpl.config.showQrCodeByDefault ?? true
       } as CardData;
    }
    return baseData;
  });

  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));
    setPreviewMouseY(percentage);
  };

  useEffect(() => {
    if (!formData.id) {
      setSlugStatus('idle');
      return;
    }
    if (formData.id.length < 3) {
      setSlugStatus('invalid');
      return;
    }
    const timer = setTimeout(async () => {
      setIsCheckingSlug(true);
      try {
        const available = await isSlugAvailable(formData.id, auth.currentUser?.uid);
        setSlugStatus(available ? 'available' : 'taken');
      } catch (e) {
        setSlugStatus('idle');
      } finally {
        setIsCheckingSlug(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [formData.id]);

  useEffect(() => {
    const selectedTmpl = templates.find(t => t.id === formData.templateId);
    if (selectedTmpl?.config?.showOccasionByDefault) {
      setIsSimpleMode(true);
      setActiveTab('occasion');
    } else {
      setIsSimpleMode(false);
      if (activeTab === 'occasion') setActiveTab('identity');
    }
  }, [formData.templateId]);

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [socialInput, setSocialInput] = useState({ platformId: SOCIAL_PLATFORMS[0].id, url: '' });

  const currentTemplate = templates.find(t => t.id === formData.templateId);
  const supportsOccasion = currentTemplate?.config?.showOccasionByDefault;
  
  const handleChange = (field: keyof CardData, value: any) => {
    if (field === 'id') { 
      value = (value || '').toLowerCase().replace(/[^a-z0-9-]/g, ''); 
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const VisibilityToggle = ({ field, label }: { field: keyof CardData, label: string }) => {
    const isVisible = formData[field] !== false;
    return (
      <button 
        type="button"
        onClick={() => handleChange(field, !isVisible)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${isVisible ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 bg-gray-100 dark:bg-gray-800'}`}
      >
        {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
        <span className="text-[9px] font-black uppercase">{isVisible ? t('إظهار', 'Show') : t('إخفاء', 'Hide')}</span>
      </button>
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploading(true);
    try { 
      const b = await uploadImageToCloud(file, 'avatar'); 
      if (b) handleChange('profileImage', b); 
    } finally { setIsUploading(false); }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploadingBg(true);
    try { 
      const b = await uploadImageToCloud(file, 'background'); 
      if (b) {
        setFormData(prev => ({ ...prev, backgroundImage: b, themeType: 'image' }));
      }
    } finally { setIsUploadingBg(false); }
  };

  const addSocialLink = () => {
    if (!socialInput.url) return;
    const platform = SOCIAL_PLATFORMS.find(p => p.id === socialInput.platformId);
    if (!platform) return;
    setFormData(prev => ({ 
      ...prev, 
      socialLinks: [...(prev.socialLinks || []), { platform: platform.name, url: socialInput.url, platformId: platform.id }] 
    }));
    setSocialInput({ ...socialInput, url: '' });
  };

  const removeSocialLink = (index: number) => {
    const updated = [...formData.socialLinks];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, socialLinks: updated }));
  };

  const TabButton = ({ id, label, icon: Icon }: { id: EditorTab, label: string, icon: any }) => {
    const isActive = activeTab === id;
    let activeColor = 'bg-blue-600';
    if (id === 'social') activeColor = 'bg-emerald-600';
    if (id === 'design') activeColor = 'bg-indigo-600';
    if (id === 'occasion') activeColor = 'bg-rose-600';

    return (
      <button 
        type="button"
        onClick={() => setActiveTab(id)}
        className={`flex-1 flex flex-col items-center justify-center gap-1.5 px-3 py-4 font-black text-[10px] uppercase tracking-tighter transition-all duration-300 min-w-[80px] ${isActive ? `${activeColor} text-white shadow-lg scale-105 rounded-2xl` : 'text-gray-400 opacity-60'}`}
      >
        <Icon size={18} className="shrink-0" /> 
        <span className="truncate">{label}</span>
      </button>
    );
  };

  const inputClasses = "w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all font-bold text-sm shadow-none";
  const labelClasses = "block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest px-1";

  const handleFinalSaveInternal = () => {
    if (slugStatus === 'taken' || slugStatus === 'invalid') {
       alert(isRtl ? "يرجى اختيار رابط متاح قبل الحفظ" : "Please choose an available link before saving");
       return;
    }
    onSave(formData, originalIdRef.current || undefined);
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full space-y-0 pb-32">
          
          {!isSimpleMode && (
            <div className={`w-full sticky top-[75px] z-50 transition-all duration-300 ease-in-out pt-0 pb-6 md:pb-10 ${isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
               <div className="flex w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-x-auto no-scrollbar shadow-sm p-1.5 gap-1.5">
                  <TabButton id="identity" label={t('الهوية', 'Identity')} icon={UserIcon} />
                  <TabButton id="social" label={t('التواصل', 'Contact')} icon={MessageCircle} />
                  <TabButton id="design" label={t('التصميم', 'Design')} icon={Palette} />
                  {supportsOccasion && <TabButton id="occasion" label={t('المناسبة', 'Event')} icon={PartyPopper} />}
               </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#121215] p-5 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 dark:border-gray-800 animate-fade-in relative overflow-hidden">
            
            {isSimpleMode ? (
              <div className="space-y-8 animate-fade-in relative z-10">
                <div className="p-5 md:p-8 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-900/10 dark:via-[#121215] dark:to-indigo-900/5 rounded-[2rem] md:rounded-[3rem] border-2 border-blue-100/50 dark:border-blue-900/20 shadow-xl shadow-blue-500/5 space-y-6 transition-all relative overflow-hidden">
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50 dark:border-gray-700">
                               <Link2 size={20} />
                            </div>
                            <h4 className="text-sm md:text-lg font-black dark:text-white uppercase tracking-tighter">{t('رابط الدعوة', 'Invitation Link')}</h4>
                         </div>
                         <div className="text-[10px] font-bold">
                            <span className={`${slugStatus === 'available' ? 'text-emerald-500' : slugStatus === 'taken' ? 'text-red-500' : 'text-gray-400'}`}>
                               {slugStatus === 'available' ? (isRtl ? '✓ متاح' : '✓ Available') : 
                                slugStatus === 'taken' ? (isRtl ? '✗ غير متاح' : '✗ Taken') : 
                                (isRtl ? 'تحقق من التوفر' : 'Check availability')}
                            </span>
                          </div>
                      </div>
                      <div className="relative group/input">
                         <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest pointer-events-none`}>.nextid.my</div>
                         <input type="text" value={formData.id} onChange={e => handleChange('id', e.target.value)} className={`w-full px-5 py-4 rounded-2xl border-2 bg-white/80 dark:bg-gray-950/50 text-xl font-black lowercase tracking-tighter outline-none transition-all ${slugStatus === 'available' ? 'border-emerald-200' : 'border-gray-100'} ${isRtl ? 'pl-24' : 'pr-24'}`} />
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-blue-50/50 dark:bg-blue-900/5 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 space-y-6">
                   <div className="flex flex-col md:flex-row gap-6 items-center">
                      <div className="relative shrink-0">
                         <div className={`w-24 h-24 ${formData.profileImage ? 'rounded-2xl' : 'rounded-full border-dashed border-2 border-gray-300'} overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center relative shadow-sm`}>
                            {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" alt="Profile" /> : <Camera size={20} className="text-gray-300" />}
                            {isUploading && <div className="absolute inset-0 bg-blue-600/60 flex items-center justify-center"><Loader2 className="animate-spin text-white" size={16} /></div>}
                         </div>
                         <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:scale-110 transition-all"><Plus size={16} /></button>
                         <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                      </div>
                      <div className="flex-1 w-full space-y-4">
                         <div>
                            <label className={labelClasses}>{t('صاحب الدعوة / المنظم', 'Organizer Name')}</label>
                            <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} placeholder={t('أدخل الاسم بالكامل', 'Full Name')} />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                               <label className={labelClasses}>{t('البادئة (يتشرف)', 'Prefix')}</label>
                               <input type="text" value={formData.invitationPrefix || ''} onChange={e => handleChange('invitationPrefix', e.target.value)} className={`${inputClasses} !py-3`} placeholder="يتشرف" />
                            </div>
                            <div>
                               <label className={labelClasses}>{t('الترحيب (بدعوتكم)', 'Welcome')}</label>
                               <input type="text" value={formData.invitationWelcome || ''} onChange={e => handleChange('invitationWelcome', e.target.value)} className={`${inputClasses} !py-3`} placeholder="بدعوتكم لحضور" />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="p-6 bg-rose-50/30 dark:bg-rose-900/5 rounded-[2rem] border border-rose-100/50 dark:border-rose-900/10 space-y-6">
                   <div className="flex items-center gap-3">
                      <PartyPopper className="text-rose-500" size={20} />
                      <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('تفاصيل المناسبة', 'Event Details')}</h4>
                   </div>
                   <div className="space-y-4">
                      <input type="text" value={formData.occasionTitle || ''} onChange={e => handleChange('occasionTitle', e.target.value)} className={inputClasses} placeholder={t('عنوان المناسبة (مثلاً: حفل زفاف..)', 'Event Title')} />
                      <textarea value={formData.occasionDesc || ''} onChange={e => handleChange('occasionDesc', e.target.value)} className={`${inputClasses} min-h-[100px] py-4 resize-none`} placeholder={t('وصف أو نبذة عن المناسبة...', 'Event Description')}/>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className={labelClasses}>{t('تاريخ ووقت المناسبة', 'Event Date & Time')}</label>
                         <div className="relative">
                            <Calendar className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-red-500 pointer-events-none z-10`} size={18} />
                            <input type="datetime-local" value={formData.occasionDate || ''} onChange={e => handleChange('occasionDate', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} [direction:ltr]`} />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className={labelClasses}>{t('موقع المناسبة (خرائط جوجل)', 'Location URL')}</label>
                         <div className="relative">
                            <MapPin className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-rose-500`} size={18} />
                            <input type="url" value={formData.occasionMapUrl || ''} onChange={e => handleChange('occasionMapUrl', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} placeholder="https://maps.google.com/..." />
                         </div>
                      </div>
                   </div>
                </div>

                {/* Updated Design Section in Simple Mode to include full color options */}
                <div className="p-6 bg-indigo-50/30 dark:bg-indigo-900/5 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-900/10 space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Palette className="text-indigo-500" size={20} />
                         <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('تصميم الدعوة ومظهرها', 'Event Design')}</h4>
                      </div>
                      <button onClick={() => handleChange('isDark', !formData.isDark)} className={`flex items-center gap-2 px-4 py-2 rounded-xl font-black text-[9px] uppercase transition-all shadow-sm ${formData.isDark ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}>
                         {formData.isDark ? <Moon size={14} /> : <Sun size={14} />}
                         {formData.isDark ? t('ليلي', 'Dark') : t('نهاري', 'Light')}
                      </button>
                   </div>

                   <div className="space-y-6">
                      <label className={labelClasses}>{t('نوع خلفية البطاقة', 'Card Theme Style')}</label>
                      <div className="grid grid-cols-3 gap-3">
                         {['color', 'gradient', 'image'].map(type => (
                           <button key={type} onClick={() => handleChange('themeType', type)} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.themeType === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400'}`}>
                             {type === 'color' ? <Pipette size={20}/> : type === 'gradient' ? <Sparkles size={20}/> : <ImageIcon size={20}/>}
                             <span className="text-[10px] font-black uppercase">{t(type, type.toUpperCase())}</span>
                           </button>
                         ))}
                      </div>

                      {formData.themeType === 'color' && (
                        <div className="grid grid-cols-6 sm:grid-cols-10 gap-3 animate-fade-in pt-4">
                           {THEME_COLORS.map(c => <button key={c} onClick={() => handleChange('themeColor', c)} className={`aspect-square rounded-full border-2 transition-all hover:scale-110 ${formData.themeColor === c ? 'border-blue-600 scale-110' : 'border-white dark:border-gray-700'}`} style={{ backgroundColor: c }} />)}
                        </div>
                      )}

                      {formData.themeType === 'gradient' && (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 animate-fade-in pt-4">
                           {THEME_GRADIENTS.map((g, i) => <button key={i} onClick={() => handleChange('themeGradient', g)} className={`h-10 rounded-xl transition-all hover:scale-105 ${formData.themeGradient === g ? 'ring-4 ring-blue-500/20 opacity-100 scale-105' : 'opacity-60'}`} style={{ background: g }} />)}
                        </div>
                      )}

                      {formData.themeType === 'image' && (
                        <div className="space-y-4 animate-fade-in pt-4">
                           <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[200px] overflow-y-auto no-scrollbar p-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                              {BACKGROUND_PRESETS.map((u, i) => <button key={i} onClick={() => handleChange('backgroundImage', u)} className={`aspect-square rounded-lg overflow-hidden transition-all ${formData.backgroundImage === u ? 'ring-4 ring-blue-500/30 scale-95' : 'opacity-50'}`}><img src={u} className="w-full h-full object-cover" /></button>)}
                           </div>
                           <button onClick={() => bgFileInputRef.current?.click()} className="w-full py-4 bg-white dark:bg-gray-800 text-blue-600 border border-dashed rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all hover:bg-blue-50/50">
                              {isUploadingBg ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                              {t('رفع خلفية خاصة', 'Upload Background')}
                           </button>
                           <input type="file" ref={bgFileInputRef} onChange={handleBgUpload} accept="image/*" className="hidden" />
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 mt-4 animate-fade-in">
                {activeTab === 'identity' && (
                  <div className="space-y-6 animate-fade-in relative z-10">
                    <div className="p-5 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-[#121215] rounded-[2rem] border-2 border-blue-100/50 dark:border-blue-900/20 shadow-sm space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3"><Link2 size={18} className="text-blue-600" /><h4 className="text-xs font-black dark:text-white uppercase tracking-tighter">{t('رابط البطاقة', 'Card Link')}</h4></div>
                          <div className="text-[10px] font-bold"><span className={`${slugStatus === 'available' ? 'text-emerald-500' : slugStatus === 'taken' ? 'text-red-500' : 'text-gray-400'}`}>{slugStatus === 'available' ? '✓ متاح' : slugStatus === 'taken' ? '✗ مأخوذ' : ''}</span></div>
                       </div>
                       <div className="relative">
                          <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest`}>.nextid.my</div>
                          <input type="text" value={formData.id} onChange={e => handleChange('id', e.target.value)} className={`w-full px-5 py-4 rounded-xl border-2 bg-white/80 dark:bg-gray-950/50 text-lg font-black outline-none ${isRtl ? 'pl-20' : 'pr-20'} ${slugStatus === 'available' ? 'border-emerald-200' : 'border-gray-100'}`} />
                       </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-center">
                       <div className="relative shrink-0 group">
                          <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-white dark:border-gray-800 shadow-md bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative">
                            {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" alt="Profile" /> : <UserIcon size={32} className="text-gray-200" />}
                            {isUploading && <div className="absolute inset-0 bg-blue-600/60 flex items-center justify-center"><Loader2 className="animate-spin text-white" size={16} /></div>}
                          </div>
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-lg shadow-lg"><Camera size={16} /></button>
                          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                       </div>
                       <div className="flex-1 w-full space-y-4">
                          <div className="space-y-2">
                             <div className="flex justify-between items-center"><label className={labelClasses}>{t('الاسم', 'Name')}</label><VisibilityToggle field="showName" label="Name" /></div>
                             <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} placeholder={t('الاسم الكامل', 'Full Name')} />
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between items-center"><label className={labelClasses}>{t('المسمى الوظيفي', 'Job Title')}</label><VisibilityToggle field="showTitle" label="Title" /></div>
                             <input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClasses} placeholder={t('مثلاً: مهندس برمجيات', 'Ex: Software Engineer')} />
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                       <div className="space-y-2">
                          <div className="flex justify-between items-center"><label className={labelClasses}>{t('الشركة', 'Company')}</label><VisibilityToggle field="showCompany" label="Company" /></div>
                          <input type="text" value={formData.company} onChange={e => handleChange('company', e.target.value)} className={inputClasses} placeholder={t('اسم الشركة أو جهة العمل', 'Company Name')} />
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center"><label className={labelClasses}>{t('النبذة الشخصية', 'Bio')}</label><VisibilityToggle field="showBio" label="Bio" /></div>
                          <textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} className={`${inputClasses} min-h-[120px] resize-none leading-relaxed`} placeholder={t('اكتب نبذة مختصرة عنك...', 'Bio...')} />
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="space-y-8 animate-fade-in relative z-10">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <div className="flex justify-between items-center"><label className={labelClasses}>{t('رقم الهاتف', 'Phone')}</label><VisibilityToggle field="showPhone" label="Phone" /></div>
                           <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center"><label className={labelClasses}>{t('رقم الواتساب', 'WhatsApp')}</label><VisibilityToggle field="showWhatsapp" label="WhatsApp" /></div>
                           <input type="text" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={inputClasses} placeholder="9665..." />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center"><label className={labelClasses}>{t('البريد الإلكتروني', 'Email')}</label><VisibilityToggle field="showEmail" label="Email" /></div>
                           <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center"><label className={labelClasses}>{t('رابط الموقع', 'Website')}</label><VisibilityToggle field="showWebsite" label="Website" /></div>
                           <input type="url" value={formData.website} onChange={e => handleChange('website', e.target.value)} className={inputClasses} />
                        </div>
                     </div>

                     <div className="pt-8 border-t dark:border-gray-800 space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3"><Share2 className="text-emerald-600" size={20}/><h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('روابط التواصل الاجتماعي', 'Social Links')}</h4></div>
                           <VisibilityToggle field="showSocialLinks" label="Socials" />
                        </div>
                        <div className="bg-emerald-50/30 dark:bg-emerald-900/5 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20 space-y-4">
                           <div className="flex flex-col sm:flex-row gap-3">
                              <select value={socialInput.platformId} onChange={e => setSocialInput({...socialInput, platformId: e.target.value})} className="flex-1 bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none ring-1 ring-emerald-100 dark:ring-emerald-900/20">
                                 {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                              </select>
                              <input type="url" value={socialInput.url} onChange={e => setSocialInput({...socialInput, url: e.target.value})} placeholder="https://..." className="flex-[2] bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none ring-1 ring-emerald-100 dark:ring-emerald-900/20" />
                              <button onClick={addSocialLink} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"><Plus size={20} /></button>
                           </div>
                           <div className="flex flex-wrap gap-3 pt-4">
                              {formData.socialLinks?.map((link, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in group">
                                   <SocialIcon platformId={link.platformId} size={18} className="text-emerald-600" />
                                   <span className="text-[10px] font-black uppercase text-gray-500 max-w-[100px] truncate">{link.platform}</span>
                                   <button onClick={() => removeSocialLink(idx)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                {activeTab === 'design' && (
                  <div className="space-y-8 animate-fade-in relative z-10">
                     <div className="bg-gray-50 dark:bg-gray-800/30 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-8">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Palette size={20}/></div>
                              <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('تخصيص المظهر والسمة', 'Visual Theme Lab')}</h4>
                           </div>
                           <button onClick={() => handleChange('isDark', !formData.isDark)} className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[9px] uppercase transition-all shadow-sm ${formData.isDark ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}>
                              {formData.isDark ? <Moon size={16} /> : <Sun size={16} />}
                              {formData.isDark ? t('وضع ليلي', 'Dark Mode') : t('وضع نهاري', 'Light Mode')}
                           </button>
                        </div>

                        <div className="space-y-6">
                           <label className={labelClasses}>{t('نوع خلفية البطاقة', 'Card Theme Style')}</label>
                           <div className="grid grid-cols-3 gap-3">
                              {['color', 'gradient', 'image'].map(type => (
                                <button key={type} onClick={() => handleChange('themeType', type)} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.themeType === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400'}`}>
                                  {type === 'color' ? <Pipette size={20}/> : type === 'gradient' ? <Sparkles size={20}/> : <ImageIcon size={20}/>}
                                  <span className="text-[10px] font-black uppercase">{t(type, type.toUpperCase())}</span>
                                </button>
                              ))}
                           </div>
                        </div>

                        {formData.themeType === 'color' && (
                           <div className="grid grid-cols-6 sm:grid-cols-10 gap-3 animate-fade-in">
                              {THEME_COLORS.map(c => <button key={c} onClick={() => handleChange('themeColor', c)} className={`aspect-square rounded-full border-2 transition-all hover:scale-110 ${formData.themeColor === c ? 'border-blue-600 scale-110' : 'border-white'}`} style={{ backgroundColor: c }} />)}
                           </div>
                        )}
                        {formData.themeType === 'gradient' && (
                           <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 animate-fade-in">
                              {THEME_GRADIENTS.map((g, i) => <button key={i} onClick={() => handleChange('themeGradient', g)} className={`h-10 rounded-xl transition-all hover:scale-105 ${formData.themeGradient === g ? 'ring-4 ring-blue-500/20 opacity-100 scale-105' : 'opacity-60'}`} style={{ background: g }} />)}
                           </div>
                        )}
                        {formData.themeType === 'image' && (
                           <div className="space-y-4 animate-fade-in">
                              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[200px] overflow-y-auto no-scrollbar p-2 bg-white dark:bg-gray-800 rounded-2xl">
                                 {BACKGROUND_PRESETS.map((u, i) => <button key={i} onClick={() => handleChange('backgroundImage', u)} className={`aspect-square rounded-lg overflow-hidden transition-all ${formData.backgroundImage === u ? 'ring-4 ring-blue-500/30' : 'opacity-50'}`}><img src={u} className="w-full h-full object-cover" /></button>)}
                              </div>
                              <button onClick={() => bgFileInputRef.current?.click()} className="w-full py-4 bg-white dark:bg-gray-800 text-blue-600 border border-dashed rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all">
                                 {isUploadingBg ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                                 {t('رفع خلفية خاصة', 'Upload Background')}
                              </button>
                              <input type="file" ref={bgFileInputRef} onChange={handleBgUpload} accept="image/*" className="hidden" />
                           </div>
                        )}
                     </div>

                     <div className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3"><QrCode className="text-blue-600" size={20}/><h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('رمز الاستجابة (QR)', 'QR Code')}</h4></div>
                           <VisibilityToggle field="showQrCode" label="QR Code" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="flex flex-col gap-2">
                              <label className={labelClasses}>{t('لون الباركود', 'QR Color')}</label>
                              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                 <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm shrink-0">
                                    <input type="color" value={formData.qrColor || '#3b82f6'} onChange={e => handleChange('qrColor', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                                    <div className="w-full h-full" style={{ backgroundColor: formData.qrColor || '#3b82f6' }} />
                                 </div>
                                 <input type="text" value={(formData.qrColor || '#3b82f6').toUpperCase()} onChange={e => handleChange('qrColor', e.target.value)} className="bg-transparent border-none outline-none font-mono text-[10px] font-black w-full text-blue-600 dark:text-blue-400 uppercase" />
                              </div>
                           </div>
                           <div className="flex flex-col gap-2">
                              <label className={labelClasses}>{t('لون خلفية الباركود', 'QR Background')}</label>
                              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                                 <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm shrink-0">
                                    <input type="color" value={formData.qrBgColor || '#ffffff'} onChange={e => handleChange('qrBgColor', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                                    <div className="w-full h-full" style={{ backgroundColor: formData.qrBgColor || '#ffffff' }} />
                                 </div>
                                 <input type="text" value={(formData.qrBgColor || '#ffffff').toUpperCase()} onChange={e => handleChange('qrBgColor', e.target.value)} className="bg-transparent border-none outline-none font-mono text-[10px] font-black w-full text-blue-600 dark:text-blue-400 uppercase" />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-8 md:pt-10">
            <button 
              onClick={handleFinalSaveInternal}
              className="flex-[2] py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-sm uppercase shadow-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all"
            >
              <Save size={20} /> {t('حفظ التعديلات', 'Save Changes')}
            </button>
            <button 
              onClick={() => setShowMobilePreview(true)}
              className="lg:hidden flex-1 py-5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-700 rounded-[1.8rem] font-black text-sm uppercase flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Eye size={20} /> {t('معاينة', 'Preview')}
            </button>
            <button onClick={onCancel} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-[1.8rem] font-black text-xs uppercase hover:bg-red-50 hover:text-red-500 transition-all">{t('إلغاء', 'Cancel')}</button>
          </div>
        </div>

        <div className="hidden lg:block w-[440px] sticky top-[100px]">
          <div className="bg-white dark:bg-[#050507] p-6 rounded-[4rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
             <div className="mb-6 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('معاينة حية', 'Live Preview')}</span>
                </div>
             </div>
             
             <div 
               ref={previewContainerRef}
               onMouseMove={handlePreviewMouseMove}
               onMouseLeave={() => setPreviewMouseY(0)}
               className="relative transition-all duration-500 rounded-[3.5rem] shadow-2xl overflow-hidden mx-auto bg-white dark:bg-black w-full border-[12px] border-gray-900 dark:border-gray-800 cursor-ns-resize" 
               style={{ isolation: 'isolate', transform: 'translateZ(0)' }}>
                
                <div className="h-[650px] overflow-hidden relative" 
                     style={{ borderRadius: '2.5rem', clipPath: 'inset(0 round 2.5rem)' }}>
                   <div 
                     className="h-full w-full transition-transform duration-500 ease-out origin-top"
                     style={{ 
                       transform: `translateY(-${previewMouseY * 0.45}%)`,
                       willChange: 'transform'
                     }}
                   >
                     <CardPreview 
                       data={formData} 
                       lang={lang} 
                       customConfig={currentTemplate?.config}
                       hideSaveButton={true} 
                       isFullFrame={true}
                     />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {showMobilePreview && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-[#0a0a0c] w-full max-w-sm rounded-[3.5rem] overflow-hidden flex flex-col h-[90vh]">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    <h3 className="font-black dark:text-white uppercase text-sm tracking-widest">{t('معاينة البطاقة', 'Live Card Preview')}</h3>
                 </div>
                 <button onClick={() => setShowMobilePreview(false)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 dark:bg-[#050507] p-4 flex items-start justify-center">
                 <div className="w-full shadow-2xl rounded-[3rem] overflow-hidden relative border-[8px] border-gray-900 dark:border-gray-800 bg-white dark:bg-black"
                      style={{ isolation: 'isolate', transform: 'translateZ(0)' }}>
                    <div className="h-[580px] overflow-y-auto no-scrollbar relative" 
                         style={{ borderRadius: '2.4rem', overflow: 'hidden', clipPath: 'inset(0 round(2.4rem))' }}>
                       <CardPreview data={formData} lang={lang} customConfig={currentTemplate?.config} hideSaveButton={true} isFullFrame={true} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
