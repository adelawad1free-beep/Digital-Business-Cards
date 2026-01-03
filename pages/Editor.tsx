
import { 
  Save, Plus, X, Loader2, Sparkles, Moon, Sun, 
  Mail, Phone, Globe, MessageCircle, Link as LinkIcon, 
  CheckCircle2, AlertCircle, UploadCloud, ImageIcon, 
  Palette, Layout, User as UserIcon, Camera, 
  Pipette, Type as TypographyIcon, Smartphone, Tablet, Monitor, Eye, 
  RefreshCcw, FileText, Calendar, MapPin, PartyPopper, Move, Wind, 
  GlassWater, Link2, Sparkle, LayoutGrid, EyeOff, Ruler, Wand2, Building2, Timer
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
  const simpleBgInputRef = useRef<HTMLInputElement>(null);
  const originalIdRef = useRef<string | null>(initialData?.id || null);

  const [activeTab, setActiveTab] = useState<EditorTab>('identity');
  const [isSimpleMode, setIsSimpleMode] = useState(true); 
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
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
         showOccasion: selectedTmpl.config.showOccasionByDefault ?? false,
         occasionTitle: selectedTmpl.config.occasionTitle || '',
         occasionDesc: selectedTmpl.config.occasionDesc || '',
         occasionDate: selectedTmpl.config.occasionDate || '',
         occasionMapUrl: selectedTmpl.config.occasionMapUrl || '',
         occasionPrimaryColor: selectedTmpl.config.occasionPrimaryColor || '#7c3aed',
         occasionBgColor: selectedTmpl.config.occasionBgColor || '',
         invitationPrefix: selectedTmpl.config.invitationPrefix || (isRtl ? 'يتشرف' : 'Invited by'),
         invitationWelcome: selectedTmpl.config.invitationWelcome || (isRtl ? 'بدعوتكم لحضور' : 'Welcomes you to'),
         bodyGlassy: selectedTmpl.config.bodyGlassy ?? false,
         bodyOpacity: selectedTmpl.config.bodyOpacity ?? 100
       } as CardData;
    }
    return baseData;
  });

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
  }, [formData.templateId, templates]);

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [socialInput, setSocialInput] = useState({ platformId: SOCIAL_PLATFORMS[0].id, url: '' });

  const currentTemplate = templates.find(t => t.id === formData.templateId);
  const supportsOccasion = currentTemplate?.config?.showOccasionByDefault;
  const relatedTemplates = templates.filter(t => t.categoryId === currentTemplate?.categoryId);

  const handleChange = (field: keyof CardData, value: any) => {
    if (field === 'id') { 
      value = (value || '').toLowerCase().replace(/[^a-z0-9-]/g, ''); 
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
          isDark: newTmpl.config.defaultIsDark ?? prev.isDark,
          showOccasion: newTmpl.config.showOccasionByDefault ?? prev.showOccasion
        }));
        return;
      }
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

  const ToggleSwitch = ({ label, value, onChange, icon: Icon, color = "bg-rose-500" }: any) => (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18} className={value ? "text-rose-500" : "text-gray-300"} />}
        <span className={`text-[11px] font-black uppercase tracking-widest ${value ? 'dark:text-white' : 'text-gray-400'}`}>{label}</span>
      </div>
      <button 
        type="button"
        onClick={() => onChange(!value)} 
        className={`w-12 h-6 rounded-full relative transition-all ${value ? color + ' shadow-lg' : 'bg-gray-200 dark:bg-gray-800'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (value ? 'right-7' : 'right-1') : (value ? 'left-7' : 'left-1')}`} />
      </button>
    </div>
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploading(true);
    try { const b = await uploadImageToCloud(file); if (b) handleChange('profileImage', b); } finally { setIsUploading(false); }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploadingBg(true);
    try { const b = await uploadImageToCloud(file); if (b) handleChange('backgroundImage', b); } finally { setIsUploadingBg(false); }
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

  const handleFinalSave = () => {
    if (slugStatus === 'taken' || slugStatus === 'invalid') {
       alert(isRtl ? "يرجى اختيار رابط متاح قبل الحفظ" : "Please choose an available link before saving");
       return;
    }
    onSave(formData, originalIdRef.current || undefined);
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      <style dangerouslySetInnerHTML={{ __html: `
        /* تحسين أيقونة التقويم الافتراضية في المتصفحات */
        input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(30%) sepia(100%) saturate(2000%) hue-rotate(330deg); /* تلوين الأيقونة باللون الأحمر */
          cursor: pointer;
          padding: 5px;
          margin-right: ${isRtl ? '10px' : '0'};
          margin-left: ${isRtl ? '0' : '10px'};
          opacity: 1 !important;
          display: block !important;
        }
      `}} />
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
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />
            
            {isSimpleMode ? (
              <div className="space-y-8 animate-fade-in relative z-10">
                {/* 1. Link Section */}
                <div className="p-5 md:p-8 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-900/10 dark:via-[#121215] dark:to-indigo-900/5 rounded-[2rem] md:rounded-[3rem] border-2 border-blue-100/50 dark:border-blue-900/20 shadow-xl shadow-blue-500/5 space-y-6 group transition-all relative overflow-hidden">
                   <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-50 dark:border-gray-700">
                               <Link2 size={20} />
                            </div>
                            <div className="flex flex-col">
                               <h4 className="text-sm md:text-lg font-black dark:text-white uppercase tracking-tighter">{t('رابط الدعوة', 'Invitation Link')}</h4>
                            </div>
                         </div>
                         <div className="text-[10px] font-bold">
                            {isCheckingSlug ? (
                               <span className="text-gray-400 animate-pulse">{isRtl ? 'جاري التحقق...' : 'Checking...'}</span>
                            ) : (
                               <span className={`${slugStatus === 'available' ? 'text-emerald-500' : slugStatus === 'taken' ? 'text-red-500' : 'text-gray-400'}`}>
                                  {slugStatus === 'available' ? (isRtl ? '✓ متاح' : '✓ Available') : 
                                   slugStatus === 'taken' ? (isRtl ? '✗ غير متاح' : '✗ Taken') : 
                                   (isRtl ? 'تحقق من التوفر' : 'Check availability')}
                               </span>
                            )}
                          </div>
                      </div>
                      <div className="relative group/input">
                         <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest pointer-events-none`}>.nextid.my</div>
                         <input 
                           type="text" 
                           value={formData.id} 
                           onChange={e => handleChange('id', e.target.value)} 
                           className={`w-full px-5 py-4 rounded-2xl border-2 bg-white/80 dark:bg-gray-950/50 text-xl font-black lowercase tracking-tighter outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all ${slugStatus === 'available' ? 'border-emerald-200 dark:border-emerald-900/30' : slugStatus === 'taken' ? 'border-red-200 dark:border-red-900/30' : 'border-gray-100 dark:border-gray-800'} ${isRtl ? 'pl-24' : 'pr-24'}`} 
                         />
                      </div>
                   </div>
                </div>

                {/* 2. Basic Info (Organizer & Protocols) */}
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

                {/* 3. Event Details */}
                <div className="p-6 bg-rose-50/30 dark:bg-rose-900/5 rounded-[2rem] border border-rose-100/50 dark:border-rose-900/10 space-y-6">
                   <div className="flex items-center gap-3">
                      <PartyPopper className="text-rose-500" size={20} />
                      <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('تفاصيل المناسبة', 'Event Details')}</h4>
                   </div>
                   
                   <div className="space-y-4">
                      <input 
                        type="text" 
                        value={formData.occasionTitle || ''} 
                        onChange={e => handleChange('occasionTitle', e.target.value)} 
                        className={inputClasses} 
                        placeholder={t('عنوان المناسبة (مثلاً: حفل زفاف..)', 'Event Title')} 
                      />
                      <textarea 
                        value={formData.occasionDesc || ''} 
                        onChange={e => handleChange('occasionDesc', e.target.value)} 
                        className={`${inputClasses} min-h-[100px] py-4 resize-none`} 
                        placeholder={t('وصف أو نبذة عن المناسبة...', 'Event Description')}
                      />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <label className={labelClasses}>{t('تاريخ ووقت المناسبة', 'Event Date & Time')}</label>
                         <div className="relative cursor-pointer">
                            <Calendar className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-red-500 pointer-events-none z-10`} size={18} />
                            <input 
                              type="datetime-local" 
                              value={formData.occasionDate || ''} 
                              onChange={e => handleChange('occasionDate', e.target.value)} 
                              className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} [direction:ltr] relative z-0`} 
                              style={{ colorScheme: formData.isDark ? 'dark' : 'light' }}
                            />
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

                {/* 4. Appearance Selection */}
                <div className="p-6 bg-indigo-50/30 dark:bg-indigo-900/5 rounded-[2rem] border border-indigo-100/50 dark:border-indigo-900/10 space-y-6">
                   <div className="flex items-center gap-3">
                      <Palette className="text-indigo-600" size={20} />
                      <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('تنسيق مظهر الدعوة', 'Invitation Appearance')}</h4>
                   </div>

                   <div className="grid grid-cols-3 gap-2 bg-gray-100/50 dark:bg-black/20 p-1.5 rounded-2xl">
                      {['color', 'gradient', 'image'].map(type => (
                        <button 
                          key={type} 
                          type="button"
                          onClick={() => handleChange('themeType', type)} 
                          className={`py-3 rounded-xl transition-all flex flex-col items-center gap-1 flex-1 ${formData.themeType === type ? 'bg-indigo-600 text-white shadow-md' : 'bg-transparent text-gray-400'}`}
                        >
                          {type === 'color' ? <Palette size={14}/> : type === 'gradient' ? <Sparkles size={14}/> : <ImageIcon size={14}/>}
                          <span className="text-[8px] font-black uppercase">{t(type === 'color' ? 'لون' : type === 'gradient' ? 'تدرج' : 'صورة', type.toUpperCase())}</span>
                        </button>
                      ))}
                   </div>

                   {formData.themeType === 'color' && (
                     <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 animate-fade-in p-2">
                        {THEME_COLORS.map((color, i) => (
                          <button key={i} type="button" onClick={() => handleChange('themeColor', color)} className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${formData.themeColor === color ? 'border-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-900/30' : 'border-white dark:border-gray-800 shadow-sm'}`} style={{ backgroundColor: color }} />
                        ))}
                     </div>
                   )}

                   {formData.themeType === 'gradient' && (
                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in">
                        {THEME_GRADIENTS.map((grad, i) => (
                          <button key={i} type="button" onClick={() => handleChange('themeGradient', grad)} className={`h-16 rounded-2xl border-2 transition-all hover:scale-[1.02] ${formData.themeGradient === grad ? 'border-indigo-600 shadow-lg' : 'border-gray-100 dark:border-gray-800 shadow-sm'}`} style={{ background: grad }} />
                        ))}
                     </div>
                   )}

                   {formData.themeType === 'image' && (
                     <div className="space-y-4 animate-fade-in">
                        <div className="grid grid-cols-3 gap-3">
                           {BACKGROUND_PRESETS.slice(0, 9).map((url, i) => (
                             <button key={i} type="button" onClick={() => handleChange('backgroundImage', url)} className={`h-24 rounded-2xl border-2 overflow-hidden transition-all ${formData.backgroundImage === url ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent opacity-60'}`}>
                                <img src={url} className="w-full h-full object-cover" />
                             </button>
                           ))}
                        </div>
                        <div className="pt-2">
                           <input type="file" ref={simpleBgInputRef} onChange={handleBgUpload} accept="image/*" className="hidden" />
                           <button 
                              type="button"
                              onClick={() => simpleBgInputRef.current?.click()}
                              className="w-full py-4 bg-white dark:bg-gray-800 text-indigo-600 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 border-2 border-dashed border-indigo-100 hover:border-indigo-400 transition-all"
                           >
                              {isUploadingBg ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                              {t('رفع خلفية خاصة للملف', 'Upload Custom Background')}
                           </button>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            ) : (
              /* Non-simple Mode Tabs */
              <div className="space-y-8 mt-4">
                {activeTab === 'identity' && (
                  <div className="space-y-6 animate-fade-in relative z-10">
                    <div className="p-5 bg-gradient-to-br from-blue-50/50 to-white dark:from-blue-900/10 dark:to-[#121215] rounded-[2rem] border-2 border-blue-100/50 dark:border-blue-900/20 shadow-sm space-y-4">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <Link2 size={18} className="text-blue-600" />
                             <h4 className="text-xs font-black dark:text-white uppercase tracking-tighter">{t('رابط البطاقة', 'Card Link')}</h4>
                          </div>
                          <div className="text-[10px] font-bold">
                            {isCheckingSlug ? (
                               <span className="text-gray-400 animate-pulse">{isRtl ? 'جاري التحقق...' : 'Checking...'}</span>
                            ) : (
                               <span className={`${slugStatus === 'available' ? 'text-emerald-500' : slugStatus === 'taken' ? 'text-red-500' : 'text-gray-400'}`}>
                                  {slugStatus === 'available' ? (isRtl ? '✓ متاح' : '✓ Available') : 
                                   slugStatus === 'taken' ? (isRtl ? '✗ غير متاح' : '✗ Taken') : 
                                   (isRtl ? 'تحقق من التوفر' : 'Check availability')}
                               </span>
                            )}
                          </div>
                       </div>
                       <div className="relative">
                          <div className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest`}>.nextid.my</div>
                          <input 
                            type="text" 
                            value={formData.id} 
                            onChange={e => handleChange('id', e.target.value)} 
                            className={`w-full px-5 py-4 rounded-xl border-2 bg-white/80 dark:bg-gray-950/50 text-lg font-black lowercase tracking-tighter outline-none ${isRtl ? 'pl-20' : 'pr-20'} ${slugStatus === 'available' ? 'border-emerald-200' : slugStatus === 'taken' ? 'border-red-200' : 'border-gray-100'}`} 
                          />
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
                          <div className="relative">
                             <Building2 className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                             <input type="text" value={formData.company} onChange={e => handleChange('company', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} placeholder={t('اسم الشركة أو جهة العمل', 'Company Name')} />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center"><label className={labelClasses}>{t('النبذة الشخصية', 'Bio')}</label><VisibilityToggle field="showBio" label="Bio" /></div>
                          <div className="relative">
                             <FileText className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-6 text-gray-400`} size={18} />
                             <textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} min-h-[120px] pt-5 resize-none leading-relaxed`} placeholder={t('اكتب نبذة مختصرة عنك وعن خبراتك...', 'Write a short bio about yourself...')} />
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <div className="flex justify-between items-center"><label className={labelClasses}>{t('رقم الهاتف', 'Phone')}</label><VisibilityToggle field="showPhone" label="Phone" /></div>
                          <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={inputClasses} placeholder="+966 5..." />
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center"><label className={labelClasses}>{t('رقم الواتساب', 'WhatsApp')}</label><VisibilityToggle field="showWhatsapp" label="WhatsApp" /></div>
                          <div className="relative">
                             <MessageCircle className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-emerald-500`} size={18} />
                             <input type="tel" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} placeholder="9665..." />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center"><label className={labelClasses}>{t('البريد الإلكتروني', 'Email')}</label><VisibilityToggle field="showEmail" label="Email" /></div>
                          <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className={inputClasses} placeholder="mail@example.com" />
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center"><label className={labelClasses}>{t('رابط الموقع', 'Website')}</label><VisibilityToggle field="showWebsite" label="Website" /></div>
                          <div className="relative">
                             <Globe className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-500`} size={18} />
                             <input type="url" value={formData.website} onChange={e => handleChange('website', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} placeholder="https://..." />
                          </div>
                       </div>
                    </div>
                    
                    <div className="space-y-4 pt-6 border-t dark:border-gray-800">
                       <label className={labelClasses}>{t('روابط التواصل الاجتماعي', 'Social Media Links')}</label>
                       <div className="flex flex-col sm:flex-row gap-2">
                          <select 
                            value={socialInput.platformId} 
                            onChange={e => setSocialInput({...socialInput, platformId: e.target.value})}
                            className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-xs font-black dark:text-white outline-none"
                          >
                            {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <div className="flex-1 flex gap-2">
                            <input 
                              type="url" 
                              value={socialInput.url} 
                              onChange={e => setSocialInput({...socialInput, url: e.target.value})} 
                              className={`${inputClasses} !py-3`} 
                              placeholder="https://..."
                            />
                            <button type="button" onClick={addSocialLink} className="px-5 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all"><Plus size={16} /></button>
                          </div>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {formData.socialLinks?.map((link, i) => (
                            <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-xl border dark:border-gray-700">
                               <SocialIcon platformId={link.platformId} size={14} />
                               <span className="text-[9px] font-bold truncate max-w-[60px]">{link.platform}</span>
                               <button type="button" onClick={() => removeSocialLink(i)} className="text-gray-300 hover:text-red-500"><X size={12} /></button>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'design' && (
                  <div className="space-y-8 animate-fade-in">
                    <div className="space-y-4">
                       <div className="flex items-center gap-2 px-1"><LayoutGrid className="text-blue-600" size={16} /><label className={labelClasses.replace('mb-2', 'mb-0')}>{t('نمط القالب', 'Template Layout')}</label></div>
                       <div className="grid grid-cols-2 gap-3">
                          {relatedTemplates.map(tmpl => (
                            <button 
                              key={tmpl.id} 
                              type="button"
                              onClick={() => handleChange('templateId', tmpl.id)}
                              className={`relative p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.templateId === tmpl.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}
                            >
                               <LayoutGrid size={20} />
                               <span className="text-[8px] font-black uppercase text-center leading-tight truncate w-full">{isRtl ? tmpl.nameAr : tmpl.nameEn}</span>
                            </button>
                          ))}
                       </div>
                    </div>
                    
                    <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                       <div className="grid grid-cols-3 gap-2 bg-gray-100/50 dark:bg-black/20 p-1.5 rounded-2xl">
                          {['color', 'gradient', 'image'].map(type => (
                            <button type="button" key={type} onClick={() => handleChange('themeType', type)} className={`py-3 rounded-xl border transition-all flex flex-col items-center gap-1.5 flex-1 ${formData.themeType === type ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-transparent text-gray-400 border-transparent'}`}>
                              {type === 'color' ? <Palette size={14}/> : type === 'gradient' ? <Sparkles size={14}/> : <ImageIcon size={14}/>}
                              <span className="text-[8px] font-black uppercase">{t(type, type.toUpperCase())}</span>
                            </button>
                          ))}
                       </div>

                       {formData.themeType === 'color' && (
                         <div className="grid grid-cols-5 sm:grid-cols-8 gap-3 animate-fade-in p-2">
                            {THEME_COLORS.map((color, i) => (
                              <button key={i} onClick={() => handleChange('themeColor', color)} className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${formData.themeColor === color ? 'border-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30' : 'border-white dark:border-gray-800 shadow-sm'}`} style={{ backgroundColor: color }} />
                            ))}
                         </div>
                       )}

                       {formData.themeType === 'gradient' && (
                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fade-in">
                            {THEME_GRADIENTS.map((grad, i) => (
                              <button key={i} onClick={() => handleChange('themeGradient', grad)} className={`h-16 rounded-2xl border-2 transition-all hover:scale-[1.02] ${formData.themeGradient === grad ? 'border-blue-600 shadow-lg' : 'border-gray-100 dark:border-gray-800 shadow-sm'}`} style={{ background: grad }} />
                            ))}
                         </div>
                       )}

                       {formData.themeType === 'image' && (
                         <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-3 gap-3">
                               {BACKGROUND_PRESETS.slice(0, 12).map((url, i) => (
                                 <button key={i} onClick={() => handleChange('backgroundImage', url)} className={`h-24 rounded-2xl border-2 overflow-hidden transition-all ${formData.backgroundImage === url ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent opacity-60'}`}>
                                    <img src={url} className="w-full h-full object-cover" />
                                 </button>
                               ))}
                            </div>
                            <div className="pt-2">
                               <input type="file" ref={bgFileInputRef} onChange={handleBgUpload} accept="image/*" className="hidden" />
                               <button 
                                  onClick={() => bgFileInputRef.current?.click()}
                                  className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 border border-dashed border-gray-300 dark:border-gray-700 hover:border-blue-400 transition-all"
                               >
                                  {isUploadingBg ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                                  {t('رفع خلفية خاصة للملف', 'Upload Custom Background')}
                                </button>
                            </div>
                         </div>
                       )}
                    </div>
                  </div>
                )}

                {activeTab === 'occasion' && (
                  <div className="space-y-8 animate-fade-in relative z-10">
                    <div className="p-6 bg-rose-50/50 dark:bg-rose-900/5 rounded-[2rem] border border-rose-100 dark:border-rose-900/20 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <PartyPopper className="text-rose-500" size={24} />
                          <h4 className="text-lg font-black dark:text-white uppercase tracking-tighter">{t('إعدادات المناسبة الخاصة', 'Special Event Settings')}</h4>
                        </div>
                        <button 
                          onClick={() => handleChange('showOccasion', !formData.showOccasion)}
                          className={`w-12 h-6 rounded-full relative transition-all ${formData.showOccasion !== false ? 'bg-rose-500 shadow-lg' : 'bg-gray-200 dark:bg-gray-800'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (formData.showOccasion !== false ? 'right-7' : 'right-1') : (formData.showOccasion !== false ? 'left-7' : 'left-1')}`} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                         <div className="space-y-2">
                            <label className={labelClasses}>{t('عنوان المناسبة', 'Event Title')}</label>
                            <input type="text" value={formData.occasionTitle || ''} onChange={e => handleChange('occasionTitle', e.target.value)} className={inputClasses} placeholder={t('مثلاً: حفل زواج عبدالله وسارة', 'Ex: Graduation Party')} />
                         </div>
                         <div className="space-y-2">
                            <label className={labelClasses}>{t('نبذة عن المناسبة', 'Event Description')}</label>
                            <textarea value={formData.occasionDesc || ''} onChange={e => handleChange('occasionDesc', e.target.value)} className={`${inputClasses} min-h-[100px] py-4 resize-none`} placeholder={t('اكتب تفاصيل إضافية عن المناسبة هنا...', 'Write extra details about the event...')} />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className={labelClasses}>{t('تاريخ ووقت المناسبة', 'Event Date & Time')}</label>
                               <div className="relative cursor-pointer">
                                  <Calendar className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-red-500 pointer-events-none z-10`} size={18} />
                                  <input 
                                    type="datetime-local" 
                                    value={formData.occasionDate || ''} 
                                    onChange={e => handleChange('occasionDate', e.target.value)} 
                                    className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} [direction:ltr] relative z-0`} 
                                    style={{ colorScheme: formData.isDark ? 'dark' : 'light' }}
                                  />
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

                      <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('نصوص البروتوكول والترحيب', 'Protocol & Welcome Texts')}</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className={labelClasses}>{t('نص البادئة (يتشرف)', 'Prefix Text')}</label>
                               <input type="text" value={formData.invitationPrefix || ''} onChange={e => handleChange('invitationPrefix', e.target.value)} className={inputClasses} placeholder="يتشرف" />
                            </div>
                            <div className="space-y-2">
                               <label className={labelClasses}>{t('نص الترحيب (بدعوتكم)', 'Welcome Text')}</label>
                               <input type="text" value={formData.invitationWelcome || ''} onChange={e => handleChange('invitationWelcome', e.target.value)} className={inputClasses} placeholder="بدعوتكم لحضور" />
                            </div>
                         </div>
                      </div>

                      <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('التصميم والمؤثرات', 'Design & Effects')}</h4>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                               <ToggleSwitch label={t('تأثير زجاجي شفاف', 'Glass Effect')} value={formData.occasionGlassy} onChange={(v: boolean) => handleChange('occasionGlassy', v)} icon={GlassWater} />
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                               <ToggleSwitch label={t('صندوق متحرك (عائم)', 'Floating Animation')} value={formData.occasionFloating !== false} onChange={(v: boolean) => handleChange('occasionFloating', v)} icon={Wind} />
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                               <label className={labelClasses}>{t('اللون الأساسي', 'Primary Color')}</label>
                               <div className="flex items-center gap-2">
                                  <input type="color" value={formData.occasionPrimaryColor || '#7c3aed'} onChange={e => handleChange('occasionPrimaryColor', e.target.value)} className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer" />
                                  <input type="text" value={formData.occasionPrimaryColor || '#7c3aed'} onChange={e => handleChange('occasionPrimaryColor', e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-2 py-2 text-[10px] font-mono w-full" />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className={labelClasses}>{t('خلفية الصندوق', 'Box Background')}</label>
                               <div className="flex items-center gap-2">
                                  <input type="color" value={formData.occasionBgColor || '#ffffff'} onChange={e => handleChange('occasionBgColor', e.target.value)} className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer" />
                                  <input type="text" value={formData.occasionBgColor || '#ffffff'} onChange={e => handleChange('occasionBgColor', e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-2 py-2 text-[10px] font-mono w-full" />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <label className={labelClasses}>{t('لون العنوان', 'Title Color')}</label>
                               <div className="flex items-center gap-2">
                                  <input type="color" value={formData.occasionTitleColor || '#111827'} onChange={e => handleChange('occasionTitleColor', e.target.value)} className="w-10 h-10 rounded-xl overflow-hidden cursor-pointer" />
                                  <input type="text" value={formData.occasionTitleColor || '#111827'} onChange={e => handleChange('occasionTitleColor', e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-2 py-2 text-[10px] font-mono w-full" />
                               </div>
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
              onClick={handleFinalSave}
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

            <button 
              onClick={onCancel}
              className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-[1.8rem] font-black text-xs uppercase hover:bg-red-50 hover:text-red-500 transition-all"
            >
              {t('إلغاء', 'Cancel')}
            </button>
          </div>
        </div>

        {/* Desktop Preview Sidebar */}
        <div className="hidden lg:block w-[400px] sticky top-[100px]">
          <div className="bg-white dark:bg-[#050507] p-6 rounded-[4rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
             <div className="mb-6 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('معاينة حية', 'Live Preview')}</span>
                </div>
             </div>
             <div className="transition-all duration-500 border-[10px] border-gray-900 dark:border-gray-800 rounded-[3.5rem] shadow-2xl overflow-hidden mx-auto bg-white dark:bg-black w-full">
                <div className="h-[650px] overflow-y-auto no-scrollbar scroll-smooth">
                   <CardPreview 
                     data={formData} 
                     lang={lang} 
                     customConfig={currentTemplate?.config}
                     hideSaveButton={true} 
                   />
                </div>
             </div>
          </div>
        </div>
      </div>

      {showMobilePreview && (
        <div className="fixed inset-0 z-[600] lg:hidden flex flex-col bg-white dark:bg-[#0a0a0c] animate-fade-in">
           <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                 <h3 className="font-black dark:text-white uppercase text-sm tracking-widest">{t('معاينة البطاقة', 'Live Card Preview')}</h3>
              </div>
              <button 
                onClick={() => setShowMobilePreview(false)}
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl text-gray-500 hover:text-red-500 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 dark:bg-[#050507] p-4 flex items-start justify-center">
              <div className="w-full max-w-[380px] shadow-2xl rounded-[2.5rem] overflow-hidden">
                 <CardPreview 
                   data={formData} 
                   lang={lang} 
                   customConfig={currentTemplate?.config}
                   hideSaveButton={true} 
                 />
              </div>
           </div>

           <div className="p-6 bg-white dark:bg-[#0a0a0c] border-t border-gray-100 dark:border-gray-800 pb-10">
              <button 
                onClick={() => setShowMobilePreview(false)}
                className="w-full py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-sm uppercase shadow-xl active:scale-95 transition-all"
              >
                {t('العودة للتعديل', 'Back to Editing')}
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Editor;
