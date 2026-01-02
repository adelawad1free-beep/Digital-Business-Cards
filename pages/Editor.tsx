import { 
  Save, Plus, X, Loader2, Sparkles, Moon, Sun, Hash, 
  Mail, Phone, Globe, MessageCircle, Link as LinkIcon, 
  CheckCircle2, AlertCircle, UploadCloud, ImageIcon, 
  Palette, Layout, User as UserIcon, Camera, Share2, 
  Pipette, Type as TypographyIcon, Smartphone, Tablet, Monitor, Eye, ArrowLeft, QrCode, RefreshCcw, FileText, Calendar, MapPin, PartyPopper, Move, Wind, ChevronRight, Info, Settings, LayoutGrid, ToggleLeft, ToggleRight, EyeOff, Ruler, Box, Maximize2, Wand2, Zap, Sliders, GlassWater, Link2, Check, AlertCircle as ErrorIcon, Sparkle
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import CardPreview from '../components/CardPreview';
import SocialIcon from '../components/SocialIcon';
import { BACKGROUND_PRESETS, SAMPLE_DATA, SOCIAL_PLATFORMS, THEME_COLORS, THEME_GRADIENTS, TRANSLATIONS } from '../constants';
import { isSlugAvailable, auth } from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import { CardData, CustomTemplate, Language, SocialLink } from '../types';
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

  const [activeTab, setActiveTab] = useState<EditorTab>('identity');
  const [isSimpleMode, setIsSimpleMode] = useState(true); 
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // خاص بالتحقق من الرابط المخصص
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
         nameColor: selectedTmpl.config.nameColor || baseData.nameColor,
         titleColor: selectedTmpl.config.titleColor || baseData.titleColor,
         linksColor: selectedTmpl.config.linksColor || baseData.linksColor,
         socialIconsColor: selectedTmpl.config.socialIconsColor || selectedTmpl.config.linksColor || baseData.linksColor,
         contactPhoneColor: selectedTmpl.config.contactPhoneColor || '#2563eb',
         contactWhatsappColor: selectedTmpl.config.contactWhatsappColor || '#10b981',
         qrColor: selectedTmpl.config.qrColor || baseData.qrColor,
         qrBgColor: selectedTmpl.config.qrBgColor || 'transparent',
         qrPadding: 0,
         qrBorderWidth: selectedTmpl.config.qrBorderWidth || 0,
         qrBorderColor: selectedTmpl.config.qrBorderColor || '#ffffff',
         qrBorderRadius: selectedTmpl.config.qrBorderRadius ?? 0, 
         qrSize: selectedTmpl.config.qrSize || 90,
         showName: selectedTmpl.config.showNameByDefault ?? true,
         showTitle: selectedTmpl.config.showTitleByDefault ?? true,
         showCompany: selectedTmpl.config.showCompanyByDefault ?? true,
         showBio: selectedTmpl.config.showBioByDefault ?? true,
         showEmail: selectedTmpl.config.showEmailByDefault ?? true,
         showWebsite: selectedTmpl.config.showWebsiteByDefault ?? true,
         showSocialLinks: selectedTmpl.config.showSocialLinksByDefault ?? true,
         showButtons: selectedTmpl.config.showButtonsByDefault ?? true,
         showQrCode: selectedTmpl.config.showQrCodeByDefault ?? true,
         showOccasion: selectedTmpl.config.showOccasionByDefault ?? false,
         occasionTitle: selectedTmpl.config.occasionTitle || '',
         occasionDesc: selectedTmpl.config.occasionDesc || '',
         occasionDate: selectedTmpl.config.occasionDate || '',
         occasionMapUrl: selectedTmpl.config.occasionMapUrl || '',
         occasionPrimaryColor: selectedTmpl.config.occasionPrimaryColor || '#7c3aed',
         occasionBgColor: selectedTmpl.config.occasionBgColor || '',
         occasionTitleColor: selectedTmpl.config.occasionTitleColor || '',
         occasionGlassy: selectedTmpl.config.occasionGlassy ?? false,
         occasionOpacity: selectedTmpl.config.occasionOpacity ?? 100,
         occasionPrefixColor: selectedTmpl.config.occasionPrefixColor || '',
         occasionNameColor: selectedTmpl.config.occasionNameColor || '',
         occasionWelcomeColor: selectedTmpl.config.occasionWelcomeColor || '',
         occasionOffsetY: selectedTmpl.config.occasionOffsetY || 0,
         occasionFloating: selectedTmpl.config.occasionFloating ?? true,
         invitationPrefix: selectedTmpl.config.invitationPrefix || (isRtl ? 'يتشرف' : 'Invited by'),
         invitationWelcome: selectedTmpl.config.invitationWelcome || (isRtl ? 'بدعوتكم لحضور' : 'Welcomes you to'),
         invitationWelcome_v2: selectedTmpl.config.invitationWelcome || (isRtl ? 'بدعوتكم لحضور' : 'Welcomes you to'),
         invitationYOffset: selectedTmpl.config.invitationYOffset || 0,
         bodyGlassy: selectedTmpl.config.bodyGlassy ?? false,
         bodyOpacity: selectedTmpl.config.bodyOpacity ?? 100
       } as CardData;
    }
    return baseData;
  });

  // منطق التحقق من الاسم المستعار (Slug)
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
          name: newTmpl.config.defaultName || prev.name,
          templateId: value,
          nameColor: newTmpl.config.nameColor || prev.nameColor,
          titleColor: newTmpl.config.titleColor || prev.titleColor,
          linksColor: newTmpl.config.linksColor || prev.linksColor,
          socialIconsColor: newTmpl.config.socialIconsColor || newTmpl.config.linksColor || prev.socialIconsColor,
          contactPhoneColor: newTmpl.config.contactPhoneColor || prev.contactPhoneColor,
          contactWhatsappColor: newTmpl.config.contactWhatsappColor || prev.contactWhatsappColor,
          qrColor: newTmpl.config.qrColor || prev.qrColor,
          qrBgColor: newTmpl.config.qrBgColor || prev.qrBgColor,
          qrPadding: newTmpl.config.qrPadding ?? prev.qrPadding,
          qrBorderWidth: newTmpl.config.qrBorderWidth || prev.qrBorderWidth,
          qrBorderColor: newTmpl.config.qrBorderColor || prev.qrBorderColor,
          qrBorderRadius: newTmpl.config.qrBorderRadius ?? 0,
          qrSize: newTmpl.config.qrSize || prev.qrSize,
          themeType: newTmpl.config.defaultThemeType || prev.themeType,
          themeColor: newTmpl.config.defaultThemeColor || prev.themeColor,
          themeGradient: newTmpl.config.defaultThemeGradient || prev.themeGradient,
          backgroundImage: newTmpl.config.defaultBackgroundImage || prev.backgroundImage,
          isDark: newTmpl.config.defaultIsDark ?? prev.isDark,
          showName: newTmpl.config.showNameByDefault ?? prev.showName,
          showTitle: newTmpl.config.showTitleByDefault ?? prev.showTitle,
          showCompany: newTmpl.config.showCompanyByDefault ?? prev.showCompany,
          showBio: newTmpl.config.showBioByDefault ?? prev.showBio,
          showEmail: newTmpl.config.showEmailByDefault ?? prev.showEmail,
          showWebsite: newTmpl.config.showWebsiteByDefault ?? prev.showWebsite,
          showSocialLinks: newTmpl.config.showSocialLinksByDefault ?? prev.showSocialLinks,
          showButtons: newTmpl.config.showButtonsByDefault ?? prev.showButtons,
          showQrCode: newTmpl.config.showQrCodeByDefault ?? true,
          showOccasion: newTmpl.config.showOccasionByDefault ?? prev.showOccasion,
          occasionTitle: newTmpl.config.occasionTitle || prev.occasionTitle,
          occasionDesc: newTmpl.config.occasionDesc || prev.occasionDesc,
          occasionDate: newTmpl.config.occasionDate || prev.occasionDate,
          occasionMapUrl: newTmpl.config.occasionMapUrl || prev.occasionMapUrl,
          occasionPrimaryColor: newTmpl.config.occasionPrimaryColor || prev.occasionPrimaryColor,
          occasionBgColor: newTmpl.config.occasionBgColor || prev.occasionBgColor,
          occasionTitleColor: newTmpl.config.occasionTitleColor || prev.occasionTitleColor,
          occasionGlassy: newTmpl.config.occasionGlassy ?? prev.occasionGlassy,
          occasionOpacity: newTmpl.config.occasionOpacity ?? prev.occasionOpacity,
          occasionPrefixColor: newTmpl.config.occasionPrefixColor || prev.occasionPrefixColor,
          occasionNameColor: newTmpl.config.occasionNameColor || prev.occasionNameColor,
          occasionWelcomeColor: newTmpl.config.occasionWelcomeColor || prev.occasionWelcomeColor,
          occasionOffsetY: newTmpl.config.occasionOffsetY || prev.occasionOffsetY,
          occasionFloating: newTmpl.config.occasionFloating ?? prev.occasionFloating,
          invitationPrefix: newTmpl.config.invitationPrefix || prev.invitationPrefix,
          invitationWelcome: newTmpl.config.invitationWelcome || prev.invitationWelcome,
          invitationYOffset: newTmpl.config.invitationYOffset || prev.invitationYOffset,
          bodyGlassy: newTmpl.config.bodyGlassy ?? prev.bodyGlassy,
          bodyOpacity: newTmpl.config.bodyOpacity ?? prev.bodyOpacity
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
        onClick={() => handleChange(field, !isVisible)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${isVisible ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-none' : 'text-gray-400 bg-gray-100 dark:bg-gray-800'}`}
        title={isVisible ? t('ظاهر', 'Visible') : t('مخفي', 'Hidden')}
      >
        {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
        <span className="text-[10px] font-black uppercase tracking-tighter">{isVisible ? t('إظهار', 'Show') : t('إخفاء', 'Hide')}</span>
      </button>
    );
  };

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

  const getTabStyles = (id: EditorTab) => {
    const isActive = activeTab === id;
    if (!isActive) return 'bg-white dark:bg-gray-900 text-gray-400 border-gray-100 dark:border-gray-800';
    
    switch(id) {
      case 'identity': return 'bg-blue-600 text-white border-blue-600';
      case 'social': return 'bg-emerald-600 text-white border-emerald-600';
      case 'design': return 'bg-indigo-600 text-white border-indigo-600';
      case 'occasion': return 'bg-rose-600 text-white border-rose-600';
      default: return 'bg-blue-600 text-white border-blue-600';
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: EditorTab, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 px-2 sm:px-6 py-4 sm:py-5 font-black text-[10px] sm:text-[14px] uppercase tracking-tighter sm:tracking-[0.15em] transition-all duration-300 border-b-4 ${getTabStyles(id)} ${activeTab === id ? 'border-opacity-100' : 'border-transparent opacity-60'}`}
    >
      <Icon size={20} className="shrink-0" /> 
      <span className="truncate">{label}</span>
    </button>
  );

  const inputClasses = "w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all font-bold text-sm shadow-none";
  const labelClasses = "block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest px-1";

  const handleFinalSave = () => {
    if (slugStatus === 'taken' || slugStatus === 'invalid') {
       alert(isRtl ? "يرجى اختيار رابط متاح قبل الحفظ" : "Please choose an available link before saving");
       return;
    }
    onSave(formData, originalIdRef.current || undefined);
  };

  const ColorPickerInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border shadow-none">
          <input type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
          <div className="w-full h-full" style={{ backgroundColor: value }} />
        </div>
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="bg-transparent border-none outline-none font-mono text-[10px] font-black w-20 text-center dark:text-gray-400" />
      </div>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1 w-full space-y-0 pb-32">
          
          {!isSimpleMode && (
            <div className={`w-full sticky top-[75px] z-50 transition-all duration-300 ease-in-out pt-0 pb-10 ${isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
               <div className="flex w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-hidden shadow-none">
                  <TabButton id="identity" label={t('الهوية', 'Identity')} icon={UserIcon} />
                  <TabButton id="social" label={t('التواصل', 'Contact')} icon={MessageCircle} />
                  <TabButton id="design" label={t('التصميم', 'Design')} icon={Palette} />
                  {supportsOccasion && <TabButton id="occasion" label={t('المناسبة', 'Event')} icon={PartyPopper} />}
               </div>
            </div>
          )}

          <div className="bg-white dark:bg-[#121215] p-6 md:p-10 rounded-[3.5rem] shadow-none border border-gray-100 dark:border-gray-800 animate-fade-in min-h-[600px] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] pointer-events-none rounded-full" />
            
            {isSimpleMode ? (
              <div className="space-y-10 animate-fade-in relative z-10">
                {/* الرابط المخصص لمحرر المناسبات - متميز وفي القمة */}
                <div className="p-6 md:p-8 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-900/10 dark:via-[#121215] dark:to-indigo-900/5 rounded-[2.5rem] md:rounded-[3rem] border-2 border-blue-100/50 dark:border-blue-900/20 shadow-xl shadow-blue-500/5 space-y-6 group transition-all hover:border-blue-300 dark:hover:border-blue-800 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] pointer-events-none rounded-full" />
                   
                   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 md:gap-4">
                         <div className="w-12 h-12 md:w-14 md:h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-md border border-blue-50 dark:border-gray-700 group-hover:rotate-12 transition-transform duration-500">
                            <Link2 size={24} className="md:size-7" />
                         </div>
                         <div className="flex flex-col">
                            <h4 className="text-base md:text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
                               {t('رابط الدعوة الشخصي', 'Custom Invitation Link')}
                               <Sparkle size={14} className="text-amber-400 animate-pulse" />
                            </h4>
                            <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('عنوان الدعوة الرقمي الفريد', 'Unique invitation address')}</span>
                         </div>
                      </div>
                      
                      <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                         {isCheckingSlug ? (
                            <div className="flex items-center gap-2 text-blue-500 font-black text-[9px] uppercase"><Loader2 size={12} className="animate-spin" /> {t('جاري التحقق...', 'Checking...')}</div>
                         ) : slugStatus === 'available' ? (
                            <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] md:text-[10px] uppercase bg-emerald-50 dark:bg-emerald-900/20 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-emerald-100 dark:border-emerald-800 animate-fade-in shadow-sm"><CheckCircle2 size={14}/> {t('متاح للاستخدام', 'Available')}</div>
                         ) : slugStatus === 'taken' ? (
                            <div className="flex items-center gap-2 text-red-500 font-black text-[9px] md:text-[10px] uppercase bg-red-50 dark:bg-red-900/20 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-red-100 dark:border-red-800 animate-fade-in shadow-sm"><AlertCircle size={14}/> {t('محجوز مسبقاً', 'Taken')}</div>
                         ) : (
                            <div className="flex items-center gap-2 text-gray-400 font-black text-[9px] md:text-[10px] uppercase">{t('اكتب اسم الرابط...', 'Type link name...')}</div>
                         )}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <div className="relative group/input">
                         <div className={`absolute ${isRtl ? 'left-4 md:left-6' : 'right-4 md:right-6'} top-1/2 -translate-y-1/2 text-xs md:text-sm font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest group-focus-within/input:text-blue-500 transition-colors pointer-events-none`}>
                            .nextid.my
                         </div>
                         <input 
                           type="text" 
                           value={formData.id} 
                           onChange={e => handleChange('id', e.target.value)} 
                           className={`w-full px-5 md:px-8 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] border-2 bg-white/80 dark:bg-gray-950/50 text-xl md:text-2xl font-black lowercase tracking-tighter outline-none focus:ring-8 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all shadow-inner ${slugStatus === 'available' ? 'border-emerald-200 dark:border-emerald-900/30' : slugStatus === 'taken' ? 'border-red-200 dark:border-red-900/30' : 'border-gray-100 dark:border-gray-800'} ${isRtl ? 'pl-24 md:pl-32' : 'pr-24 md:pr-32'}`} 
                           placeholder="my-event" 
                         />
                      </div>
                      <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest px-2 opacity-80">
                         {t('* حروف، أرقام، وشرطة فقط (3 أحرف كحد أدنى).', '* letters, numbers, and hyphens only (min 3 chars).')}
                      </p>
                   </div>
                </div>

                <div className="p-8 bg-blue-50/50 dark:bg-blue-900/5 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/20 space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-blue-600 shadow-none"><UserIcon size={20} /></div>
                      <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('صاحب الدعوة', 'Organizer Details')}</h4>
                   </div>
                   
                   <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                      <div className="relative shrink-0">
                         <div className={`w-32 h-32 ${formData.profileImage ? 'rounded-[2rem]' : 'rounded-full border-dashed border-2 border-gray-300 dark:border-gray-700'} overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center relative shadow-none`}>
                            {formData.profileImage ? (
                               <img src={formData.profileImage} className="w-full h-full object-cover" />
                            ) : (
                               <div className="flex flex-col items-center gap-2">
                                  <Camera size={24} className="text-gray-300" />
                                  <span className="text-[7px] font-black text-gray-300 uppercase tracking-widest">رفع صورة</span>
                               </div>
                            )}
                            {isUploading && <div className="absolute inset-0 bg-blue-600/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                         </div>
                         <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-none hover:scale-110 transition-all active:scale-95"><Plus size={18} /></button>
                         <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                      </div>

                      <div className="flex-1 w-full space-y-4">
                         <div className="space-y-2">
                           <label className={labelClasses}>{t('الاسم الظاهر', 'Displayed Name')}</label>
                           <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} placeholder={t('اسمك الكامل', 'Organizer Name')} />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                               <label className={labelClasses}>{t('العبارة قبل الاسم', 'Prefix (e.g. Invited by)')}</label>
                               <input type="text" value={formData.invitationPrefix || ''} onChange={e => handleChange('invitationPrefix', e.target.value)} className={`${inputClasses} !py-3`} placeholder="يتشرف" />
                            </div>
                            <div className="space-y-2">
                               <label className={labelClasses}>{t('العبارة بعد الاسم', 'Welcome Text')}</label>
                               <input type="text" value={formData.invitationWelcome || ''} onChange={e => handleChange('invitationWelcome', e.target.value)} className={`${inputClasses} !py-3`} placeholder="بدعوتكم لحضور" />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="pt-4 space-y-4 border-t dark:border-gray-800">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <ColorPickerInput label={isRtl ? 'لون البادئة' : 'Prefix Color'} value={formData.occasionPrefixColor || ''} onChange={(v) => handleChange('occasionPrefixColor', v)} />
                         <ColorPickerInput label={isRtl ? 'لون الاسم' : 'Name Color'} value={formData.occasionNameColor || ''} onChange={(v) => handleChange('occasionNameColor', v)} />
                         <ColorPickerInput label={isRtl ? 'لون الترحيب' : 'Welcome Color'} value={formData.occasionWelcomeColor || ''} onChange={(v) => handleChange('occasionWelcomeColor', v)} />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                           <label className={labelClasses}>{t('إزاحة كتلة الدعوة كاملة (أعلى/أسفل)', 'Full Block Y Offset')}</label>
                           <span className="text-[10px] font-black text-blue-600">{formData.invitationYOffset || 0}px</span>
                        </div>
                        <input type="range" min="-200" max="300" value={formData.invitationYOffset || 0} onChange={e => handleChange('invitationYOffset', parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                      </div>
                   </div>
                </div>

                <div className="bg-white dark:bg-gray-800/20 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-none"><PartyPopper size={24} /></div>
                      <h4 className="text-xl font-black dark:text-white">{t('ما هي مناسبتك القادمة؟', 'Tell us about your event')}</h4>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                         <label className={labelClasses}>{t('عنوان المناسبة', 'Occasion Title')}</label>
                         <div className="relative">
                            <TypographyIcon className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                            <input type="text" value={formData.occasionTitle || ''} onChange={e => handleChange('occasionTitle', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} placeholder={t('اكتب عنواناً جذاباً...', 'Write a catchy title...')} />
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                         <label className={labelClasses}>{t('وصف قصير للمناسبة', 'Short Description')}</label>
                         <textarea value={formData.occasionDesc || ''} onChange={e => handleChange('occasionDesc', e.target.value)} className={`${inputClasses} min-h-[100px] resize-none`} placeholder={t('شارك ضيوفك بعض التفاصيل...', 'Share some details with your guests...')} />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className={labelClasses}>{t('موعد المناسبة', 'Event Date')}</label>
                           <div className="relative">
                              <Calendar className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-500`} size={18} />
                              <input type="datetime-local" value={formData.occasionDate || ''} onChange={e => handleChange('occasionDate', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} [direction:ltr]`} />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className={labelClasses}>{t('الموقع على الخريطة', 'Map Location')}</label>
                           <div className="relative">
                              <MapPin className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-red-500`} size={18} />
                              <input type="url" value={formData.occasionMapUrl || ''} onChange={e => handleChange('occasionMapUrl', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} placeholder="https://maps.google.com/..." />
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="p-8 bg-gray-50 dark:bg-gray-800/30 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-indigo-500 shadow-none"><Palette size={20} /></div>
                        <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('تصميم ومظهر المناسبة', 'Design & Colors')}</h4>
                      </div>
                      <div className="flex items-center gap-3 bg-white dark:bg-gray-900 p-1 rounded-xl shadow-none border border-gray-100 dark:border-gray-800">
                        <button onClick={() => handleChange('isDark', false)} className={`p-2 rounded-lg transition-all ${!formData.isDark ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><Sun size={14}/></button>
                        <button onClick={() => handleChange('isDark', true)} className={`p-2 rounded-lg transition-all ${formData.isDark ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><Moon size={14}/></button>
                      </div>
                   </div>

                   <div className="grid grid-cols-3 gap-3">
                      {['color', 'gradient', 'image'].map(type => (
                        <button 
                          key={type} 
                          onClick={() => handleChange('themeType', type)}
                          className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.themeType === type ? 'bg-blue-600 border-blue-600 text-white shadow-none' : 'bg-white dark:bg-gray-800 text-gray-400 border-transparent shadow-none'}`}
                        >
                          {type === 'color' ? <Palette size={18}/> : type === 'gradient' ? <Sparkles size={18}/> : <ImageIcon size={18}/>}
                          <span className="text-[9px] font-black uppercase tracking-widest">{t(type, type.toUpperCase())}</span>
                        </button>
                      ))}
                   </div>

                   {formData.themeType === 'color' && (
                     <div className="grid grid-cols-5 sm:grid-cols-10 gap-3 pt-2">
                        {THEME_COLORS.map((clr, i) => (
                          <button key={i} onClick={() => handleChange('themeColor', clr)} className={`h-8 w-8 rounded-full border-2 transition-all ${formData.themeColor === clr ? 'border-blue-600 scale-125 shadow-none' : 'border-white dark:border-gray-600'}`} style={{ backgroundColor: clr }} />
                        ))}
                     </div>
                   )}

                   {formData.themeType === 'gradient' && (
                     <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-2 max-h-[120px] overflow-y-auto no-scrollbar">
                        {THEME_GRADIENTS.map((grad, i) => (
                          <button key={i} onClick={() => handleChange('themeGradient', grad)} className={`h-12 rounded-xl border-2 transition-all ${formData.themeGradient === grad ? 'border-blue-600' : 'border-transparent opacity-60'}`} style={{ background: grad }} />
                        ))}
                     </div>
                   )}

                   {formData.themeType === 'image' && (
                     <div className="space-y-4 pt-2">
                       <div className="grid grid-cols-4 gap-3 max-h-[220px] overflow-y-auto no-scrollbar p-1">
                          {BACKGROUND_PRESETS.map((url, i) => (
                            <button key={i} onClick={() => handleChange('backgroundImage', url)} className={`h-16 rounded-xl border-2 overflow-hidden transition-all ${formData.backgroundImage === url ? 'border-blue-600 scale-105 shadow-none' : 'border-transparent opacity-60'}`}><img src={url} className="w-full h-full object-cover" /></button>
                          ))}
                       </div>
                       <button onClick={() => bgFileInputRef.current?.click()} className="w-full py-3 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 text-blue-600 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-50 transition-all">
                          {isUploadingBg ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} {t('رفع صورة خلفية', 'Custom BG')}
                       </button>
                       <input type="file" ref={bgFileInputRef} onChange={handleBgUpload} className="hidden" accept="image/*" />
                     </div>
                   )}

                   <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-none">
                        <div className="flex items-center gap-3">
                          <GlassWater size={18} className={formData.bodyGlassy ? "text-blue-500" : "text-gray-300"} />
                          <span className={`text-[11px] font-black uppercase tracking-widest ${formData.bodyGlassy ? 'dark:text-white' : 'text-gray-400'}`}>{isRtl ? 'تصميم زجاجي شفاف للإطار' : 'Premium Body Glass Design'}</span>
                        </div>
                        <button 
                          onClick={() => handleChange('bodyGlassy', !formData.bodyGlassy)} 
                          className={`w-12 h-6 rounded-full relative transition-all ${formData.bodyGlassy ? 'bg-blue-600 shadow-none' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (formData.bodyGlassy ? 'right-7' : 'right-1') : (formData.bodyGlassy ? 'left-7' : 'left-1')}`} />
                        </button>
                      </div>

                      {formData.bodyGlassy && (
                        <div className="space-y-3 animate-fade-in">
                          <div className="flex justify-between items-center px-1">
                            <label className={labelClasses}>{isRtl ? 'درجة شفافية الإطار' : 'Body Transparency'}</label>
                            <span className="text-[10px] font-black text-blue-600">{formData.bodyOpacity || 100}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" 
                            value={formData.bodyOpacity || 100} 
                            onChange={e => handleChange('bodyOpacity', parseInt(e.target.value))} 
                            className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-none">
                        <div className="flex items-center gap-3">
                          <GlassWater size={18} className={formData.occasionGlassy ? "text-indigo-500" : "text-gray-300"} />
                          <span className={`text-[11px] font-black uppercase tracking-widest ${formData.occasionGlassy ? 'dark:text-white' : 'text-gray-400'}`}>{isRtl ? 'تصميم زجاجي لصندوق المناسبة' : 'Occasion Box Glass Design'}</span>
                        </div>
                        <button 
                          onClick={() => handleChange('occasionGlassy', !formData.occasionGlassy)} 
                          className={`w-12 h-6 rounded-full relative transition-all ${formData.occasionGlassy ? 'bg-indigo-600 shadow-none' : 'bg-gray-200 dark:bg-gray-700'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (formData.occasionGlassy ? 'right-7' : 'right-1') : (formData.occasionGlassy ? 'left-7' : 'left-1')}`} />
                        </button>
                      </div>

                      {formData.occasionGlassy && (
                        <div className="space-y-3 animate-fade-in">
                          <div className="flex justify-between items-center px-1">
                            <label className={labelClasses}>{isRtl ? 'شفافية صندوق المناسبة' : 'Occasion Box Transparency'}</label>
                            <span className="text-[10px] font-black text-indigo-600">{formData.occasionOpacity || 100}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="100" 
                            value={formData.occasionOpacity || 100} 
                            onChange={e => handleChange('occasionOpacity', parseInt(e.target.value))} 
                            className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                          />
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ) : (
              <div className="mt-8">
                {activeTab === 'identity' && (
                  <div className="space-y-8 animate-fade-in relative z-10">
                    
                    {/* قسم الرابط المخصص للبطاقات العادية */}
                    <div className="p-6 md:p-8 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-blue-900/10 dark:via-[#121215] dark:to-indigo-900/5 rounded-[2.5rem] md:rounded-[3rem] border-2 border-blue-100/50 dark:border-blue-900/20 shadow-xl shadow-blue-500/5 space-y-6 md:space-y-8 group transition-all hover:border-blue-300 dark:hover:border-blue-800 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[50px] pointer-events-none rounded-full" />
                       
                       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3 md:gap-4">
                             <div className="w-12 h-12 md:w-14 md:h-14 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-blue-600 shadow-md border border-blue-50 dark:border-gray-700 group-hover:rotate-12 transition-transform duration-500">
                                <Link2 size={24} className="md:size-7" />
                             </div>
                             <div className="flex flex-col">
                                <h4 className="text-base md:text-lg font-black dark:text-white uppercase tracking-tighter flex items-center gap-2">
                                   {t('رابط البطاقة الشخصي', 'Custom Identity Link')}
                                   <Sparkle size={14} className="text-amber-400 animate-pulse" />
                                </h4>
                                <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('عنوانك الرقمي الفريد', 'Your unique digital address')}</span>
                             </div>
                          </div>
                          
                          <div className="flex flex-col items-start sm:items-end w-full sm:w-auto">
                             {isCheckingSlug ? (
                                <div className="flex items-center gap-2 text-blue-500 font-black text-[9px] uppercase"><Loader2 size={12} className="animate-spin" /> {t('جاري التحقق...', 'Checking...')}</div>
                             ) : slugStatus === 'available' ? (
                                <div className="flex items-center gap-2 text-emerald-500 font-black text-[9px] md:text-[10px] uppercase bg-emerald-50 dark:bg-emerald-900/20 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-emerald-100 dark:border-emerald-800 animate-fade-in shadow-sm"><CheckCircle2 size={14}/> {t('متاح للاستخدام', 'Available')}</div>
                             ) : slugStatus === 'taken' ? (
                                <div className="flex items-center gap-2 text-red-500 font-black text-[9px] md:text-[10px] uppercase bg-red-50 dark:bg-red-900/20 px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-red-100 dark:border-red-800 animate-fade-in shadow-sm"><AlertCircle size={14}/> {t('محجوز مسبقاً', 'Taken')}</div>
                             ) : (
                                <div className="flex items-center gap-2 text-gray-400 font-black text-[9px] md:text-[10px] uppercase">{t('اكتب اسمك المفضل...', 'Waiting...')}</div>
                             )}
                          </div>
                       </div>

                       <div className="space-y-4">
                          <div className="relative group/input">
                             <div className={`absolute ${isRtl ? 'left-4 md:left-6' : 'right-4 md:right-6'} top-1/2 -translate-y-1/2 text-xs md:text-sm font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest group-focus-within/input:text-blue-500 transition-colors pointer-events-none`}>
                                .nextid.my
                             </div>
                             <input 
                               type="text" 
                               value={formData.id} 
                               onChange={e => handleChange('id', e.target.value)} 
                               className={`w-full px-5 md:px-8 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] border-2 bg-white/80 dark:bg-gray-950/50 text-xl md:text-2xl font-black lowercase tracking-tighter outline-none focus:ring-8 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all shadow-inner ${slugStatus === 'available' ? 'border-emerald-200 dark:border-emerald-900/30' : slugStatus === 'taken' ? 'border-red-200 dark:border-red-900/30' : 'border-gray-100 dark:border-gray-800'} ${isRtl ? 'pl-24 md:pl-32' : 'pr-24 md:pr-32'}`} 
                               placeholder="yourname" 
                             />
                          </div>
                          
                          <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-widest px-2 opacity-80 leading-relaxed">
                             {t('* يُسمح بالأحرف (a-z)، الأرقام (0-9)، والشرطة (-) فقط، بحد أدنى 3 أحرف.', '* a-z, 0-9, and hyphens (-) only, min 3 chars.')}
                          </p>
                       </div>
                    </div>

                    {/* قسم المعلومات الشخصية */}
                    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start border-b border-gray-50 dark:border-gray-800/50 pb-10">
                       <div className="relative shrink-0 group">
                          <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-gray-800 shadow-none bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative">
                            {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" /> : <UserIcon size={40} className="text-gray-200" />}
                            {isUploading && <div className="absolute inset-0 bg-blue-600/60 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                          </div>
                          <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-none hover:scale-110 transition-all active:scale-95"><Camera size={18} /></button>
                          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                       </div>
                       <div className="flex-1 w-full space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                  <label className={labelClasses}>{t('الاسم الكامل', 'Full Name')}</label>
                                  <VisibilityToggle field="showName" label="Name" />
                                </div>
                                <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} placeholder="John Doe" />
                             </div>
                             <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                  <label className={labelClasses}>{t('المسمى الوظيفي', 'Job Title')}</label>
                                  <VisibilityToggle field="showTitle" label="Title" />
                                </div>
                                <input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClasses} placeholder="Product Designer" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <div className="flex justify-between items-center px-1">
                                <label className={labelClasses}>{t('الشركة / المنظمة', 'Company')}</label>
                                <VisibilityToggle field="showCompany" label="Company" />
                             </div>
                             <input type="text" value={formData.company} onChange={e => handleChange('company', e.target.value)} className={inputClasses} placeholder="Google Inc." />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <label className={labelClasses}>{t('النبذة التعريفية (Bio)', 'Professional Bio')}</label>
                            <VisibilityToggle field="showBio" label="Bio" />
                          </div>
                       </div>
                       <textarea 
                         value={formData.bio} 
                         onChange={e => handleChange('bio', e.target.value)} 
                         className={`${inputClasses} min-h-[120px] resize-none leading-relaxed`} 
                         placeholder={t('اكتب نبذة مهنية قصيرة تعبر عنك...', 'Write a brief professional summary about yourself...')}
                       />
                    </div>
                  </div>
                )}

                {activeTab === 'occasion' && (
                  <div className="space-y-8 animate-fade-in relative z-10">
                    <div className="bg-white dark:bg-gray-800/20 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-6">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600/10 text-blue-600 rounded-2xl flex items-center justify-center shadow-none"><PartyPopper size={24} /></div>
                          <h4 className="text-xl font-black dark:text-white">{t('تفاصيل المناسبة', 'Occasion Details')}</h4>
                       </div>
                       <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                             <label className={labelClasses}>{t('عنوان المناسبة', 'Occasion Title')}</label>
                             <input type="text" value={formData.occasionTitle || ''} onChange={e => handleChange('occasionTitle', e.target.value)} className={inputClasses} />
                          </div>
                          <div className="space-y-2">
                             <label className={labelClasses}>{t('وصف المناسبة', 'Description')}</label>
                             <textarea value={formData.occasionDesc || ''} onChange={e => handleChange('occasionDesc', e.target.value)} className={`${inputClasses} min-h-[100px]`} />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className={labelClasses}>{t('موعد المناسبة', 'Date')}</label>
                                <input type="datetime-local" value={formData.occasionDate || ''} onChange={e => handleChange('occasionDate', e.target.value)} className={inputClasses} />
                             </div>
                             <div className="space-y-2">
                                <label className={labelClasses}>{t('الموقع', 'Map URL')}</label>
                                <input type="url" value={formData.occasionMapUrl || ''} onChange={e => handleChange('occasionMapUrl', e.target.value)} className={inputClasses} />
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] space-y-8">
                       <div className="flex items-center gap-3">
                          <Palette className="text-blue-600" size={20} />
                          <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('تصميم نصوص وألوان الدعوة', 'Invitation Colors')}</h4>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ColorPickerInput label={isRtl ? 'لون البادئة' : 'Prefix Color'} value={formData.occasionPrefixColor || '#2563eb'} onChange={(v) => handleChange('occasionPrefixColor', v)} />
                          <ColorPickerInput label={isRtl ? 'لون اسم صاحب الدعوة' : 'Organizer Color'} value={formData.occasionNameColor || '#111827'} onChange={(v) => handleChange('occasionNameColor', v)} />
                          <ColorPickerInput label={isRtl ? 'لون الترحيب' : 'Welcome Color'} value={formData.occasionWelcomeColor || 'rgba(0,0,0,0.4)'} onChange={(v) => handleChange('occasionWelcomeColor', v)} />
                          <ColorPickerInput label={isRtl ? 'لون خلفية الصندوق' : 'Box Background'} value={formData.occasionBgColor || '#ffffff'} onChange={(v) => handleChange('occasionBgColor', v)} />
                          <ColorPickerInput label={isRtl ? 'لون العنوان' : 'Title Color'} value={formData.occasionTitleColor || '#111827'} onChange={(v) => handleChange('occasionTitleColor', v)} />
                          <ColorPickerInput label={isRtl ? 'اللون التفاعلي' : 'Accent Color'} value={formData.occasionPrimaryColor || '#7c3aed'} onChange={(v) => handleChange('occasionPrimaryColor', v)} />
                       </div>

                       <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-none">
                             <div className="flex items-center gap-3">
                                <GlassWater size={18} className={formData.occasionGlassy ? "text-indigo-500" : "text-gray-300"} />
                                <span className={`text-[11px] font-black uppercase tracking-widest ${formData.occasionGlassy ? 'dark:text-white' : 'text-gray-400'}`}>{isRtl ? 'تصميم زجاجي للصندوق' : 'Glass Box Design'}</span>
                             </div>
                             <button onClick={() => handleChange('occasionGlassy', !formData.occasionGlassy)} className={`w-12 h-6 rounded-full relative transition-all ${formData.occasionGlassy ? 'bg-indigo-600 shadow-none' : 'bg-gray-200 dark:bg-gray-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (formData.occasionGlassy ? 'right-7' : 'right-1') : (formData.occasionGlassy ? 'left-7' : 'left-1')}`} /></button>
                          </div>
                          {formData.occasionGlassy && (
                            <div className="space-y-3 animate-fade-in">
                               <div className="flex justify-between items-center px-1">
                                  <label className={labelClasses}>{isRtl ? 'شفافية صندوق المناسبة' : 'Occasion Box Transparency'}</label>
                                  <span className="text-[10px] font-black text-indigo-600">{formData.occasionOpacity || 100}%</span>
                               </div>
                               <input type="range" min="0" max="100" value={formData.occasionOpacity || 100} onChange={e => handleChange('occasionOpacity', parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="space-y-8 animate-fade-in relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10 border-b border-gray-50 dark:border-gray-800/50">
                       <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <label className={labelClasses}>{t('البريد الإلكتروني', 'Email')}</label>
                            <VisibilityToggle field="showEmail" label="Email" />
                          </div>
                          <div className="relative">
                            <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                            <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <label className={labelClasses}>{t('رقم الهاتف', 'Phone')}</label>
                            <VisibilityToggle field="showPhone" label="Phone" />
                          </div>
                          <div className="relative">
                            <Phone className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-500`} size={18} />
                            <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <label className={labelClasses}>{t('رابط الموقع', 'Website')}</label>
                            <VisibilityToggle field="showWebsite" label="Website" />
                          </div>
                          <div className="relative">
                            <Globe className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-500`} size={18} />
                            <input type="text" value={formData.website} onChange={e => handleChange('website', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <label className={labelClasses}>{t('رقم الواتساب', 'WhatsApp')}</label>
                            <VisibilityToggle field="showWhatsapp" label="WhatsApp" />
                          </div>
                          <div className="relative">
                            <MessageCircle className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-emerald-500`} size={18} />
                            <input type="text" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} text-right`} />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="flex justify-between items-center px-1">
                          <h4 className={labelClasses}>{t('إضافة روابط التواصل الاجتماعي', 'Add Social Media Links')}</h4>
                          <div className="flex items-center gap-4">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{t('رؤية الروابط', 'Socials Visibility')}</span>
                            <VisibilityToggle field="showSocialLinks" label="Socials" />
                          </div>
                       </div>
                       <div className="flex flex-col sm:flex-row gap-3">
                          <select 
                            value={socialInput.platformId} 
                            onChange={e => setSocialInput({...socialInput, platformId: e.target.value})}
                            className="bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-5 py-3 text-sm font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-100"
                          >
                            {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <div className="flex-1 relative">
                            <LinkIcon className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-300`} size={16} />
                            <input 
                              type="url" 
                              value={socialInput.url} 
                              onChange={e => setSocialInput({...socialInput, url: e.target.value})} 
                              className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} !py-3`} 
                              placeholder="https://..."
                            />
                          </div>
                          <button onClick={addSocialLink} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-none active:scale-95 transition-all">
                            <Plus size={18} /> {t('إضافة', 'Add')}
                          </button>
                       </div>

                       <div className="flex flex-wrap gap-3 mt-4">
                          {formData.socialLinks?.map((link, i) => (
                            <div key={i} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-xl border dark:border-gray-700 group hover:border-blue-200 transition-all shadow-none">
                               <SocialIcon platformId={link.platformId} size={16} />
                               <span className="text-[10px] font-bold truncate max-w-[100px]">{link.platform}</span>
                               <button onClick={() => removeSocialLink(i)} className="text-gray-300 hover:text-red-500 transition-colors"><X size={14} /></button>
                            </div>
                          ))}
                       </div>

                       <div className="pt-8 border-t border-gray-50 dark:border-gray-800/50 flex items-center justify-between px-1">
                          <div className="flex flex-col">
                            <span className="text-xs font-black dark:text-white uppercase leading-none mb-1">{t('أزرار الاتصال السريع', 'Quick Contact Buttons')}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('اتصال، واتساب، حفظ جهة الاتصال', 'Call, WhatsApp, Save Contact')}</span>
                          </div>
                          <VisibilityToggle field="showButtons" label="Contact Buttons" />
                       </div>
                    </div>
                  </div>
                )}

                {activeTab === 'design' && (
                  <div className="space-y-12 animate-fade-in relative z-10">
                    <div className="space-y-6">
                       <div className="flex items-center gap-3 px-1">
                          <Layout className="text-blue-600" size={20} />
                          <label className={labelClasses.replace('mb-2', 'mb-0')}>{t('اختر نمط القالب الهيكلي', 'Choose Template Layout')}</label>
                       </div>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {relatedTemplates.map(tmpl => (
                            <button 
                              key={tmpl.id} 
                              onClick={() => handleChange('templateId', tmpl.id)}
                              className={`relative p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 group ${formData.templateId === tmpl.id ? 'bg-blue-600 border-blue-600 text-white shadow-none scale-100' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-blue-100'}`}
                            >
                               <div className={`p-3 rounded-2xl ${formData.templateId === tmpl.id ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-700'} transition-colors`}>
                                  <LayoutGrid size={24} className={formData.templateId === tmpl.id ? 'text-white' : 'text-gray-300 group-hover:text-blue-500'} />
                               </div>
                               <span className="text-[9px] font-black uppercase text-center leading-tight">{isRtl ? tmpl.nameAr : tmpl.nameEn}</span>
                               {formData.templateId === tmpl.id && <div className="absolute top-2 right-2 p-1 bg-white rounded-lg"><CheckCircle2 size={12} className="text-blue-600" /></div>}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="pt-10 border-t border-gray-50 dark:border-gray-800/50 space-y-8">
                       <div className="flex items-center gap-3 px-1">
                          <ImageIcon className="text-blue-600" size={20} />
                          <h4 className={labelClasses.replace('mb-2', 'mb-0')}>{t('نمط السمة والخلفية', 'Theme Style & Background')}</h4>
                       </div>

                       <div className="grid grid-cols-3 gap-3 bg-gray-100/50 dark:bg-black/20 p-2 rounded-[2rem]">
                          {['color', 'gradient', 'image'].map(type => (
                            <button 
                              key={type} 
                              onClick={() => handleChange('themeType', type)}
                              className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 flex-1 ${formData.themeType === type ? 'bg-blue-600 border-blue-600 text-white shadow-none' : 'bg-white dark:bg-gray-800 text-gray-400 border-transparent shadow-none'}`}
                            >
                              {type === 'color' ? <Palette size={20}/> : type === 'gradient' ? <Sparkles size={20}/> : <ImageIcon size={20}/>}
                              <span className="text-[10px] font-black uppercase tracking-widest">{t(type === 'color' ? 'لون ثابت' : type === 'gradient' ? 'تدرج' : 'صورة', type.toUpperCase())}</span>
                            </button>
                          ))}
                       </div>

                       {formData.themeType === 'color' && (
                         <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] space-y-6 animate-fade-in border border-gray-100 dark:border-gray-700 shadow-none">
                            <label className={labelClasses}>{t('اختر لون السمة', 'Select Theme Color')}</label>
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                               {THEME_COLORS.map((clr, i) => (
                                 <button key={i} onClick={() => handleChange('themeColor', clr)} className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-125 ${formData.themeColor === clr ? 'border-blue-600 scale-125 shadow-none' : 'border-white dark:border-gray-600'}`} style={{ backgroundColor: clr }} />
                               ))}
                               <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-dashed border-gray-300 group">
                                 <input type="color" value={formData.themeColor} onChange={e => handleChange('themeColor', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                                 <div className="w-full h-full flex items-center justify-center bg-white"><Pipette size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" /></div>
                               </div>
                            </div>
                         </div>
                       )}

                       {formData.themeType === 'gradient' && (
                         <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] space-y-6 animate-fade-in border border-gray-100 dark:border-gray-700 shadow-none">
                            <label className={labelClasses}>{t('اختر التدرج اللوني المفضل', 'Select Gradient Preset')}</label>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[220px] overflow-y-auto no-scrollbar p-1">
                               {THEME_GRADIENTS.map((grad, i) => (
                                 <button key={i} onClick={() => handleChange('themeGradient', grad)} className={`h-14 rounded-2xl border-2 transition-all ${formData.themeGradient === grad ? 'border-blue-600 scale-105 shadow-none' : 'border-transparent opacity-60 hover:opacity-100'}`} style={{ background: grad }} />
                               ))}
                            </div>
                         </div>
                       )}

                       {formData.themeType === 'image' && (
                         <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] space-y-6 animate-fade-in border border-gray-100 dark:border-gray-700 shadow-none">
                            <label className={labelClasses}>{t('اختر خلفية فنية أو ارفع صورتك', 'Artistic Backgrounds')}</label>
                            <div className="grid grid-cols-4 gap-3 mb-4">
                               {BACKGROUND_PRESETS.map((url, i) => (
                                 <button key={i} onClick={() => handleChange('backgroundImage', url)} className={`h-20 rounded-2xl border-2 overflow-hidden transition-all ${formData.backgroundImage === url ? 'border-blue-600 scale-105 shadow-none' : 'border-transparent opacity-50 hover:opacity-100'}`}><img src={url} className="w-full h-full object-cover" /></button>
                               ))}
                            </div>
                            <button onClick={() => bgFileInputRef.current?.click()} className="w-full py-5 bg-white dark:bg-gray-900 border border-dashed border-gray-200 dark:border-gray-700 text-blue-600 rounded-[1.5rem] font-black text-xs uppercase flex items-center justify-center gap-3 hover:bg-blue-50 transition-all shadow-none">
                               {isUploadingBg ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />} {t('رفع صورة خلفية خاصة', 'Upload Custom Background')}
                            </button>
                            <input type="file" ref={bgFileInputRef} onChange={handleBgUpload} className="hidden" accept="image/*" />
                         </div>
                       )}
                       
                       <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-[2.5rem] space-y-6 border border-gray-100 dark:border-gray-700 shadow-none">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <GlassWater className="text-blue-600" size={20} />
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'التأثير الزجاجي الشفاف' : 'Glassmorphism Effect'}</span>
                            </div>
                            <button 
                              onClick={() => handleChange('bodyGlassy', !formData.bodyGlassy)} 
                              className={`w-12 h-6 rounded-full relative transition-all ${formData.bodyGlassy ? 'bg-blue-600 shadow-none' : 'bg-gray-200 dark:bg-gray-700'}`}
                            >
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (formData.bodyGlassy ? 'right-7' : 'right-1') : (formData.bodyGlassy ? 'left-7' : 'left-1')}`} />
                            </button>
                          </div>
                          {formData.bodyGlassy && (
                            <div className="space-y-4 animate-fade-in">
                               <div className="flex justify-between items-center px-1">
                                  <label className={labelClasses}>{isRtl ? 'شفافية الإطار' : 'Body Transparency'}</label>
                                  <span className="text-[10px] font-black text-blue-600">{formData.bodyOpacity || 100}%</span>
                               </div>
                               <input type="range" min="0" max="100" value={formData.bodyOpacity || 100} onChange={e => handleChange('bodyOpacity', parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-10">
            <button 
              onClick={handleFinalSave}
              className="flex-[2] py-5 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase shadow-none flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all"
            >
              <Save size={20} /> {t('حفظ التعديلات', 'Save Changes')}
            </button>
            
            <button 
              onClick={() => setShowMobilePreview(true)}
              className="lg:hidden flex-1 py-5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-100 dark:border-gray-700 rounded-[2rem] font-black text-sm uppercase shadow-none flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Eye size={20} /> {t('معاينة', 'Preview')}
            </button>

            <button 
              onClick={onCancel}
              className="flex-1 py-5 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-[2rem] font-black text-sm uppercase hover:bg-red-50 hover:text-red-500 transition-all"
            >
              {t('إلغاء', 'Cancel')}
            </button>
          </div>
        </div>

        <div className="hidden lg:block w-[400px] sticky top-[100px]">
          <div className="bg-white dark:bg-[#050507] p-6 rounded-[4rem] border border-gray-100 dark:border-gray-800 shadow-none overflow-hidden">
             <div className="mb-6 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('معاينة حية', 'Live Preview')}</span>
                </div>
             </div>
             <div className="transition-all duration-500 border-[10px] border-gray-900 dark:border-gray-800 rounded-[3.5rem] shadow-none overflow-hidden mx-auto bg-white dark:bg-black w-full">
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
           <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                 <h3 className="font-black dark:text-white uppercase text-sm tracking-widest">{t('معاينة البطاقة', 'Live Card Preview')}</h3>
              </div>
              <button 
                onClick={() => setShowMobilePreview(false)}
                className="p-3 bg-gray-100 dark:bg-gray-800 rounded-2xl text-gray-500 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 dark:bg-[#050507] p-4 flex items-start justify-center">
              <div className="w-full max-w-[380px] shadow-none rounded-[2.5rem] overflow-hidden">
                 <CardPreview 
                   data={formData} 
                   lang={lang} 
                   customConfig={currentTemplate?.config}
                   hideSaveButton={true} 
                 />
              </div>
           </div>

           <div className="p-6 bg-white dark:bg-[#0a0a0c] border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={() => setShowMobilePreview(false)}
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase shadow-none active:scale-95 transition-all"
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
