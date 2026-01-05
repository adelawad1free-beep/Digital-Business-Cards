
import React, { useState, useRef, useEffect } from 'react';
import { CustomTemplate, TemplateConfig, Language, CardData, TemplateCategory, VisualStyle, ThemeType, PageBgStrategy } from '../types';
import { TRANSLATIONS, SAMPLE_DATA, THEME_COLORS, THEME_GRADIENTS, BACKGROUND_PRESETS, AVATAR_PRESETS, PATTERN_PRESETS, SVG_PRESETS } from '../constants';
import { uploadImageToCloud } from '../services/uploadService';
import { getAllCategories, saveTemplateCategory, getAllVisualStyles, auth, getSiteSettings } from '../services/firebase';
import CardPreview from './CardPreview';
import AuthModal from './AuthModal';
import { 
  Save, Layout, Smartphone, Layers, Move, Check, X, 
  Zap, AlignCenter, Circle, Box, Loader2, Type as TypographyIcon, 
  Ruler, Star, Hash, ArrowLeft, Palette, Sparkles, ImageIcon, 
  UploadCloud, Sun, Moon, Pipette, Settings, FileText, AlignLeft, 
  AlignRight, LayoutTemplate, Info, Maximize2, UserCircle, Mail, 
  Phone, Globe, MessageCircle, Camera, Download, Tablet, Monitor, 
  Eye, QrCode, Wind, GlassWater, ChevronRight, ChevronLeft, 
  Waves, Square, Columns, Minus, ToggleLeft, ToggleRight, Calendar, MapPin, Timer, PartyPopper, Link as LinkIcon, FolderOpen, Plus, Tag, Settings2, SlidersHorizontal, Share2, FileCode, HardDrive, Database,
  CheckCircle2, Grid, RefreshCcw, Shapes, Code2, MousePointer2, AlignJustify, EyeOff, Briefcase, Wand2, RotateCcw, AlertTriangle, Repeat, Sparkle, LogIn, Trophy
} from 'lucide-react';

type BuilderTab = 'header' | 'avatar' | 'design-system' | 'body-style' | 'social-lab' | 'elements' | 'visuals' | 'occasion' | 'qrcode' | 'special-features';

interface TemplateBuilderProps {
  lang: Language;
  onSave: (template: CustomTemplate) => void;
  onCancel?: () => void;
  initialTemplate?: CustomTemplate;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ lang, onSave, onCancel, initialTemplate }) => {
  const isRtl = lang === 'ar';
  const headerAssetInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const ADMIN_PRESET_COLORS = ['#2563eb', '#1e40af', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#f43f5e', '#db2777', '#d946ef', '#a855f7', '#7c3aed', '#6366f1', '#4b5563', '#0f172a'];

  const t = (key: string, enVal?: string) => {
    if (enVal) return isRtl ? key : enVal;
    return TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;
  };
  
  const [activeTab, setActiveTab] = useState<BuilderTab>('header');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [loading, setLoading] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [visualStyles, setVisualStyles] = useState<VisualStyle[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(initialTemplate?.parentStyleId || '');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showDirectAuth, setShowDirectAuth] = useState(false);
  
  const [uploadConfig, setUploadConfig] = useState({ storageType: 'database', uploadUrl: '' });

  const [template, setTemplate] = useState<CustomTemplate>(initialTemplate || {
    id: `tmpl_${Date.now()}`,
    categoryId: '',
    parentStyleId: '',
    nameAr: 'قالب جديد مخصص',
    nameEn: 'New Custom Template',
    descAr: '',
    descEn: '',
    isActive: true,
    isFeatured: false,
    order: 0,
    createdAt: new Date().toISOString(),
    config: {
      headerType: 'classic',
      headerHeight: 200,
      avatarStyle: 'circle',
      avatarSize: 120,
      avatarOffsetY: 0,
      avatarOffsetX: 0,
      avatarBorderWidth: 4,
      avatarBorderColor: '#ffffff',
      avatarAnimatedBorder: false,
      avatarAnimatedBorderColor1: '#3b82f6',
      avatarAnimatedBorderColor2: '#ffffff',
      avatarAnimatedBorderSpeed: 3,
      avatarAnimatedGlow: false,
      nameOffsetY: 0,
      titleOffsetY: 0,
      bioOffsetY: 0,
      emailOffsetY: 0,
      websiteOffsetY: 0,
      contactButtonsOffsetY: 0,
      socialLinksOffsetY: 0,
      contentAlign: 'center',
      buttonStyle: 'pill',
      animations: 'none',
      spacing: 'normal',
      nameSize: 26,
      bioSize: 13,
      qrSize: 90,
      qrColor: '#2563eb',
      qrBgColor: 'transparent',
      qrPadding: 0,
      qrOffsetY: 0,
      qrBorderWidth: 4,
      qrBorderColor: '#f9fafb',
      qrBorderRadius: 0, 
      showQrCodeByDefault: true,
      showBioByDefault: true,
      showNameByDefault: true,
      showTitleByDefault: true,
      showCompanyByDefault: true,
      showEmailByDefault: true,
      showWebsiteByDefault: true,
      showPhoneByDefault: true,
      showWhatsappByDefault: true,
      showSocialLinksByDefault: true,
      showButtonsByDefault: true,
      showOccasionByDefault: false,
      showStarsByDefault: false,
      isVerifiedByDefault: false,
      hasGoldenFrameByDefault: false,
      occasionTitle: 'مناسبة خاصة',
      occasionDesc: '',
      occasionDate: '2025-12-30T12:00',
      occasionMapUrl: '',
      occasionOffsetY: 0,
      occasionFloating: true,
      occasionPrimaryColor: '#7c3aed',
      occasionBgColor: '#ffffff',
      occasionTitleColor: '#111827',
      occasionGlassy: false,
      occasionOpacity: 100,
      occasionPrefixColor: '#2563eb',
      occasionNameColor: '#111827',
      occasionWelcomeColor: 'rgba(0,0,0,0.4)',
      showCountdown: true,
      invitationPrefix: isRtl ? 'يتشرف' : 'Invited by',
      invitationWelcome: isRtl ? 'بدعوتكم لحضور' : 'Welcomes you to',
      invitationYOffset: 0,
      headerGlassy: false,
      headerOpacity: 100,
      bodyGlassy: false,
      bodyOpacity: 100,
      bodyOffsetY: 0,
      bodyBorderRadius: 48,
      nameColor: '#111827',
      titleColor: '#2563eb',
      bioTextColor: 'rgba(0,0,0,0.65)',
      bioBgColor: 'rgba(0,0,0,0.03)',
      linksColor: '#3b82f6',
      socialIconsColor: '#3b82f6',
      contactPhoneColor: '#2563eb',
      contactWhatsappColor: '#10b981',
      defaultThemeType: 'gradient',
      defaultThemeColor: '#2563eb',
      defaultThemeGradient: THEME_GRADIENTS[0],
      defaultName: '',
      defaultIsDark: false,
      cardBgColor: '', 
      pageBgColor: '',
      pageBgStrategy: 'solid',
      headerPatternId: 'none',
      headerPatternOpacity: 20,
      headerPatternScale: 100,
      showBodyFeatureByDefault: false,
      bodyFeatureTextAr: 'ميزة حصرية',
      bodyFeatureTextEn: 'EXCLUSIVE FEATURE',
      bodyFeatureBgColor: '#3b82f6',
      bodyFeatureTextColor: '#ffffff',
      bodyFeatureHeight: 45,
      bodyFeaturePaddingX: 0,
      bodyFeatureOffsetY: 0,
      bodyFeatureBorderRadius: 16,
      bodyFeatureGlassy: false,
      socialIconStyle: 'rounded',
      socialIconSize: 22,
      socialIconVariant: 'filled',
      socialIconBgColor: '',
      socialIconColor: '',
      socialIconBorderWidth: 1,
      socialIconBorderColor: '',
      socialIconGap: 12,
      socialIconColumns: 0,
      socialIconPadding: 14,
      useSocialBrandColors: false
    }
  });

  useEffect(() => {
    getAllCategories().then(setCategories);
    getAllVisualStyles().then(setVisualStyles);
    getSiteSettings().then(settings => {
      if (settings) {
        setUploadConfig({
          storageType: settings.imageStorageType || 'database',
          uploadUrl: settings.serverUploadUrl || ''
        });
      }
    });
  }, []);

  const updateTemplate = (key: keyof CustomTemplate, value: any) => {
    setTemplate(prev => ({ ...prev, [key]: value }));
  };

  const updateConfig = (key: keyof TemplateConfig, value: any) => {
    setTemplate(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const resetOffsets = () => {
    setShowResetConfirm(true);
  };

  const handleActualReset = () => {
    const resetConfig: Partial<TemplateConfig> = {
      avatarOffsetY: 0,
      avatarOffsetX: 0,
      nameOffsetY: 0,
      titleOffsetY: 0,
      bioOffsetY: 0,
      emailOffsetY: 0,
      websiteOffsetY: 0,
      contactButtonsOffsetY: 0,
      socialLinksOffsetY: 0,
      bodyOffsetY: 0,
      qrOffsetY: 0,
      invitationYOffset: 0,
      occasionOffsetY: 0,
      bodyFeatureOffsetY: 0,
      bodyFeaturePaddingX: 0,
      spacing: 'normal',
      contentAlign: 'center'
    };

    setTemplate(prev => ({
      ...prev,
      config: { 
        ...prev.config, 
        ...resetConfig 
      }
    }));
    setShowResetConfirm(false);
  };

  const applyVisualStyle = (style: VisualStyle) => {
    setSelectedStyleId(style.id);
    setTemplate(prev => ({
      ...prev,
      parentStyleId: style.id,
      config: { ...prev.config, ...style.config }
    }));
  };

  const checkAuthAndClick = (ref: React.RefObject<HTMLInputElement>) => {
    if (!auth.currentUser) {
      setShowAuthWarning(true);
      return;
    }
    ref.current?.click();
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    try {
      const b = await uploadImageToCloud(file, 'background', uploadConfig as any);
      if (b) {
        updateConfig('defaultBackgroundImage', b);
        updateConfig('defaultThemeType', 'image');
      }
    } finally {
      setUploadingBg(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const b = await uploadImageToCloud(file, 'avatar', uploadConfig as any);
      if (b) {
        updateConfig('defaultProfileImage', b);
      }
    } finally {
      setUploadingAvatar(false);
    }
  };

  const sampleCardData = (SAMPLE_DATA[lang] || SAMPLE_DATA['en']) as CardData;

  const RangeControl = ({ label, value, min, max, onChange, unit = "px", icon: Icon, hint }: any) => (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 transition-all hover:border-blue-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           {Icon && <Icon size={14} className="text-blue-500" />}
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
              {hint && <span className="text-[8px] text-gray-300 font-bold">{hint}</span>}
           </div>
        </div>
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
    </div>
  );

  const ToggleSwitch = ({ label, value, onChange, icon: Icon, color = "bg-blue-600" }: any) => (
    <div className="flex items-center justify-between p-5 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:bg-gray-50/50">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18} className={value ? "text-blue-500" : "text-gray-300"} />}
        <span className={`text-[11px] font-black uppercase tracking-widest ${value ? 'dark:text-white' : 'text-gray-400'}`}>{label}</span>
      </div>
      <button type="button" onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full relative transition-all ${value ? color + ' shadow-lg' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (value ? 'right-7' : 'right-1') : (value ? 'left-7' : 'left-1')}`} />
      </button>
    </div>
  );

  const ColorPicker = ({ label, value, onChange }: any) => (
    <div className={`flex items-center justify-between p-5 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm`}>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-3">
         <div className="relative w-9 h-9 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
            <input type="color" value={value?.startsWith('rgba') || !value?.startsWith('#') ? '#3b82f6' : (value || '#ffffff')} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
            <div className="w-full h-full" style={{ backgroundColor: value || '#ffffff' }} />
         </div>
         <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-3 py-2 text-[10px] font-black text-blue-600 w-24 uppercase text-center outline-none" placeholder="#HEX" />
      </div>
    </div>
  );

  const NavItem = ({ id, label, icon: Icon }: { id: BuilderTab, label: string, icon: any }) => (
    <button type="button" onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${activeTab === id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
      <div className={`p-2 rounded-xl ${activeTab === id ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700'} transition-colors`}><Icon size={18} /></div>
      <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{label}</span>
    </button>
  );

  return (
    <div className="bg-white dark:bg-[#0a0a0c] rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[calc(100vh-100px)] min-h-[850px] relative">
      
      {showAuthWarning && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-[#121215] w-full max-sm rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-10 text-center space-y-6 animate-zoom-in">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                 <UserCircle size={40} />
              </div>
              <h3 className="text-xl font-black dark:text-white leading-relaxed">
                 {isRtl ? "لرفع صورة خاصة الرجاء التسجيل في الموقع" : "To upload a custom image, please register on the site"}
              </h3>
              <p className="text-xs font-bold text-gray-400 leading-relaxed">
                 {isRtl ? "سجل حسابك الآن لتتمكن من تخصيص القوالب بصورك الافتراضية الخاصة." : "Sign up now to customize templates with your own default photos."}
              </p>
              <div className="flex flex-col gap-3 pt-4">
                 <button 
                   onClick={() => { setShowAuthWarning(false); setShowDirectAuth(true); }}
                   className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                 >
                    <LogIn size={18} />
                    {isRtl ? "تسجيل دخول" : "Login"}
                 </button>
                 <button 
                   onClick={() => setShowAuthWarning(false)}
                   className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl font-black text-[10px] uppercase transition-all"
                 >
                    {isRtl ? "إلغاء" : "Cancel"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {showDirectAuth && (
        <AuthModal 
          lang={lang} 
          onClose={() => setShowDirectAuth(false)} 
          onSuccess={() => { setShowDirectAuth(false); window.location.reload(); }} 
        />
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-4 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-5">
          <button type="button" onClick={onCancel} className="p-2 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-xl border border-gray-100 dark:border-gray-700 transition-all shadow-sm"><ArrowLeft size={18} className={isRtl ? 'rotate-180' : ''} /></button>
          <div>
            <h2 className="text-base font-black dark:text-white leading-none mb-1">{t('تصميم القالب المخصص', 'Custom Template Design')}</h2>
            <div className="flex items-center gap-2">
               <Hash size={10} className="text-blue-500" />
               <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{template.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setShowSaveModal(true)} disabled={loading} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">{t('حفظ القالب', 'Save Template')}</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-l dark:border-gray-800 p-6 flex flex-col gap-1 overflow-y-auto no-scrollbar shrink-0 bg-gray-50/30 dark:bg-transparent">
          <NavItem id="header" label={t('الترويسة والأنماط', 'Header & Patterns')} icon={Layout} />
          <NavItem id="avatar" label={t('الصورة الشخصية', 'Avatar Style')} icon={Circle} />
          <NavItem id="design-system" label={t('هيكلة النصوص والتصميم', 'Structure & Typography')} icon={Settings2} />
          <NavItem id="body-style" label={t('جسم البطاقة', 'Card Body Style')} icon={Box} />
          <NavItem id="social-lab" label={t('أيقونات التواصل', 'Social Icons Lab')} icon={Share2} />
          <NavItem id="elements" label={t('ألوان العناصر', 'Element Colors')} icon={Palette} />
          <NavItem id="visuals" label={t('الألوان والسمة', 'Colors & Theme')} icon={Palette} />
          <NavItem id="occasion" label={t('المناسبة الخاصة', 'Special Occasion')} icon={PartyPopper} />
          <NavItem id="qrcode" label={t('رمز الـ QR', 'QR Code Style')} icon={QrCode} />
          <NavItem id="special-features" label={t('specialFeatures')} icon={Trophy} />
        </div>

        <div className="flex-1 p-8 overflow-y-auto no-scrollbar bg-gray-50/20 dark:bg-transparent">
          <div className="max-w-3xl mx-auto space-y-10 animate-fade-in pb-32">
            
            {activeTab === 'header' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-indigo-50 dark:bg-indigo-950/20 p-8 rounded-[3rem] border border-indigo-100 dark:border-indigo-900/30 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <Wand2 className="text-indigo-600" size={24} />
                          <h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('استيراد ترويسة من المختبر', 'Import Header DNA')}</h4>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       {visualStyles.map(style => (
                         <button 
                           key={style.id} 
                           type="button"
                           onClick={() => applyVisualStyle(style)}
                           className={`p-3 bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group hover:scale-105 ${template.parentStyleId === style.id ? 'border-indigo-600 ring-4 ring-indigo-500/10' : 'border-gray-100 dark:border-gray-800'}`}
                         >
                            <div className="w-full h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-indigo-500">
                               <LayoutTemplate size={20} />
                            </div>
                            <span className="text-[8px] font-black uppercase text-center truncate w-full">{isRtl ? style.nameAr : style.nameEn}</span>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-3"><Shapes className="text-blue-600" size={24} /><h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('هندسة الترويسة', 'Header Geometry')}</h4></div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                         {[
                           {id: 'classic', icon: LayoutTemplate, label: 'كلاسيك'},
                           {id: 'overlay', icon: Layers, label: 'متداخل'},
                           {id: 'side-left', icon: ChevronLeft, label: 'جانبي يسار'},
                           {id: 'side-right', icon: ChevronRight, label: 'جانبي يمين'},
                           {id: 'curved', icon: Wind, label: 'منحني'},
                           {id: 'wave', icon: Waves, label: 'موجي'},
                           {id: 'diagonal', icon: RefreshCcw, label: 'قطري'},
                           {id: 'split-left', icon: AlignLeft, label: 'قطري يسار'},
                           {id: 'split-right', icon: AlignRight, label: 'قطري يمين'},
                           {id: 'floating', icon: Square, label: 'عائم'},
                           {id: 'glass-card', icon: GlassWater, label: 'زجاجي'},
                           {id: 'modern-split', icon: Columns, label: 'حديث'},
                           {id: 'hero', icon: Monitor, label: 'بانورامي'},
                           {id: 'top-bar', icon: Minus, label: 'شريط علوي'},
                           {id: 'minimal', icon: Minus, label: 'بسيط'},
                           {id: 'custom-asset', icon: FileCode, label: 'ملف خاص'}
                         ].map(item => (
                           <button type="button" key={item.id} onClick={() => updateConfig('headerType', item.id)} className={`py-4 px-1 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.headerType === item.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                             <item.icon size={20} /> 
                             <span className="text-[7px] font-black uppercase text-center leading-tight">{t(item.label, item.id)}</span>
                           </button>
                         ))}
                    </div>
                    <RangeControl label={t('ارتفاع الترويسة', 'Header Height')} min={40} max={1000} value={template.config.headerHeight} onChange={(v: number) => updateConfig('headerHeight', v)} icon={Maximize2} />
                 </div>
              </div>
            )}

            {activeTab === 'avatar' && (
              <div className="space-y-6 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <ToggleSwitch label={t('تفعيل ظهور الصورة', 'Show Avatar')} value={template.config.avatarStyle !== 'none'} onChange={(v: boolean) => updateConfig('avatarStyle', v ? 'circle' : 'none')} icon={Camera} />
                    
                    {template.config.avatarStyle !== 'none' && (
                      <div className="pt-4 border-t dark:border-gray-800 space-y-4">
                         <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest dark:text-white px-1">{t('شكل الصورة الشخصية', 'Avatar Shape')}</h4>
                         <div className="grid grid-cols-3 gap-3">
                            {[
                               { id: 'circle', label: 'دائري', icon: Circle },
                               { id: 'squircle', label: 'منحني', icon: Shapes },
                               { id: 'square', label: 'مربع', icon: Square }
                            ].map(shape => (
                               <button 
                                 key={shape.id} 
                                 onClick={() => updateConfig('avatarStyle', shape.id)}
                                 className={`py-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1.5 ${template.config.avatarStyle === shape.id ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
                               >
                                  <shape.icon size={18} />
                                  <span className="text-[8px] font-black uppercase">{t(shape.label, shape.id.toUpperCase())}</span>
                               </button>
                            ))}
                         </div>
                      </div>
                    )}

                    <div className="pt-4 border-t dark:border-gray-800 space-y-6">
                       <div className="flex items-center gap-3">
                          <ImageIcon className="text-blue-600" size={20} />
                          <h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('الصورة الافتراضية للقالب', 'Default Template Avatar')}</h4>
                       </div>
                       
                       <div className="flex flex-col md:flex-row items-center gap-6 bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                          <div className={`w-24 h-24 shrink-0 bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-white dark:border-gray-700 shadow-md overflow-hidden flex items-center justify-center relative`}>
                             {template.config.defaultProfileImage ? (
                               <img src={template.config.defaultProfileImage} className="w-full h-full object-cover" alt="Default Avatar" />
                             ) : (
                               <UserCircle size={40} className="text-gray-200" />
                             )}
                             {uploadingAvatar && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                          </div>
                          
                          <div className="flex-1 space-y-3 w-full">
                             <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
                             <button type="button" onClick={() => checkAuthAndClick(avatarInputRef)} className="w-full py-4 bg-white dark:bg-gray-900 border rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 shadow-sm transition-all hover:border-blue-500">
                                <UploadCloud size={16} className="text-blue-500" />
                                {t('رفع صورة من جهازك', 'Upload Custom Avatar')}
                             </button>
                             {template.config.defaultProfileImage && (
                                <button type="button" onClick={() => updateConfig('defaultProfileImage', '')} className="w-full py-2 text-red-500 font-black text-[9px] uppercase hover:underline">
                                   {t('إزالة الصورة', 'Remove Photo')}
                                </button>
                             )}
                          </div>
                       </div>
                    </div>

                    <div className="pt-6 border-t dark:border-gray-800">
                       <div className="flex items-center gap-3 mb-4">
                          <Shapes className="text-blue-600" size={18} />
                          <h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{isRtl ? 'مكتبة الكركترات والايموجي' : 'Emoji & Character Library'}</h4>
                       </div>
                       <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 max-h-[160px] overflow-y-auto no-scrollbar p-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                          {AVATAR_PRESETS.map((url, i) => (
                             <button 
                               key={i} 
                               type="button" 
                               onClick={() => updateConfig('defaultProfileImage', url)} 
                               className={`aspect-square rounded-xl overflow-hidden transition-all bg-white dark:bg-gray-900 border-2 ${template.config.defaultProfileImage === url ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent hover:border-blue-100'}`}
                             >
                                <img src={url} className="w-full h-full object-contain p-1" alt={`Preset ${i}`} />
                             </button>
                          ))}
                       </div>
                       <p className="text-[9px] font-bold text-gray-400 mt-2 px-2 uppercase tracking-tight opacity-60">
                          {isRtl ? '* اختر كركتر مميز ليكون صورة المعاينة للقالب.' : '* Pick a unique character to be the template preview photo.'}
                       </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <RangeControl label={t('حجم الصورة', 'Size')} min={60} max={250} value={template.config.avatarSize} onChange={(v: number) => updateConfig('avatarSize', v)} icon={Maximize2} />
                       <RangeControl label={t('سمك الإطار', 'Border Width')} min={0} max={20} value={template.config.avatarBorderWidth ?? 4} onChange={(v: number) => updateConfig('avatarBorderWidth', v)} icon={Ruler} />
                    </div>
                    <ColorPicker label={t('لون الإطار', 'Border Color')} value={template.config.avatarBorderColor || '#ffffff'} onChange={(v: string) => updateConfig('avatarBorderColor', v)} />

                    <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                       <div className="flex items-center gap-3">
                          <Zap className="text-amber-500" size={20} />
                          <h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('إطار مضيء ومتحرك', 'Animated Border Lab')}</h4>
                       </div>
                       
                       <ToggleSwitch label={t('تفعيل الإطار المتحرك', 'Enable Animated Border')} value={template.config.avatarAnimatedBorder} onChange={(v: boolean) => updateConfig('avatarAnimatedBorder', v)} icon={Sparkles} color="bg-amber-500" />
                       
                       {template.config.avatarAnimatedBorder && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                             <ColorPicker label={t('لون الحركة 1', 'Motion Color 1')} value={template.config.avatarAnimatedBorderColor1} onChange={(v: string) => updateConfig('avatarAnimatedBorderColor1', v)} />
                             <ColorPicker label={t('لون الحركة 2', 'Motion Color 2')} value={template.config.avatarAnimatedBorderColor2} onChange={(v: string) => updateConfig('avatarAnimatedBorderColor2', v)} />
                             <RangeControl label={t('سرعة الدوران', 'Rotation Speed')} min={1} max={10} value={template.config.avatarAnimatedBorderSpeed || 3} onChange={(v: number) => updateConfig('avatarAnimatedBorderSpeed', v)} icon={RefreshCcw} unit="s" hint={t('كلما قل الرقم زادت السرعة', 'Lower is faster')} />
                             <ToggleSwitch label={t('تأثير التوهج (Glow)', 'Glow Effect')} value={template.config.avatarAnimatedGlow} onChange={(v: boolean) => updateConfig('avatarAnimatedGlow', v)} icon={Sun} color="bg-blue-600" />
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            )}
            
            {activeTab === 'design-system' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                     <div className="flex items-center gap-3"><Eye className="text-blue-600" size={24} /><h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('تفعيل وتعطيل العناصر الافتراضية', 'Component Visibility DNA')}</h4></div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        <ToggleSwitch label={t('إظهار الاسم', 'Show Name')} value={template.config.showNameByDefault} onChange={(v: boolean) => updateConfig('showNameByDefault', v)} icon={TypographyIcon} />
                        <ToggleSwitch label={t('المسمى الوظيفي', 'Show Title')} value={template.config.showTitleByDefault} onChange={(v: boolean) => updateConfig('showTitleByDefault', v)} icon={Briefcase} />
                        <ToggleSwitch label={t('اسم الشركة', 'Show Company')} value={template.config.showCompanyByDefault} onChange={(v: boolean) => updateConfig('showCompanyByDefault', v)} icon={Box} />
                        <ToggleSwitch label={t('النبذة التعريفية', 'Show Bio')} value={template.config.showBioByDefault} onChange={(v: boolean) => updateConfig('showBioByDefault', v)} icon={FileText} />
                        <ToggleSwitch label={t('البريد الإلكتروني', 'Show Email')} value={template.config.showEmailByDefault} onChange={(v: boolean) => updateConfig('showEmailByDefault', v)} icon={Mail} />
                        <ToggleSwitch label={t('الموقع الإلكتروني', 'Show Website')} value={template.config.showWebsiteByDefault} onChange={(v: boolean) => updateConfig('showWebsiteByDefault', v)} icon={Globe} />
                        <ToggleSwitch label={t('رقم الهاتف', 'Show Phone')} value={template.config.showPhoneByDefault} onChange={(v: boolean) => updateConfig('showPhoneByDefault', v)} icon={Phone} />
                        <ToggleSwitch label={t('رقم الواتساب', 'Show WhatsApp')} value={template.config.showWhatsappByDefault} onChange={(v: boolean) => updateConfig('showWhatsappByDefault', v)} icon={MessageCircle} />
                        <ToggleSwitch label={t('روابط السوشيال', 'Show Socials')} value={template.config.showSocialLinksByDefault} onChange={(v: boolean) => updateConfig('showSocialLinksByDefault', v)} icon={Share2} />
                        <ToggleSwitch label={t('أزرار الحفظ', 'Show Buttons')} value={template.config.showButtonsByDefault} onChange={(v: boolean) => updateConfig('showButtonsByDefault', v)} icon={Save} />
                     </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                     <div className="flex items-center justify-between border-b dark:border-gray-800 pb-4 mb-6">
                        <div className="flex items-center gap-3">
                           <TypographyIcon className="text-blue-600" size={24} />
                           <h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('محرك إزاحة العناصر والتباعد', 'Displacement & Spacing Engine')}</h4>
                        </div>
                        <button 
                          type="button"
                          onClick={resetOffsets}
                          className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-orange-100 dark:border-orange-800/30 hover:bg-orange-100 transition-all shadow-sm"
                        >
                          <Repeat size={14} />
                          {t('إعادة ضبط التموضع', 'Reset Offsets')}
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RangeControl label={t('حجم خط الاسم', 'Name Font Size')} min={16} max={56} value={template.config.nameSize} onChange={(v: number) => updateConfig('nameSize', v)} icon={TypographyIcon} />
                        <RangeControl label={t('حجم خط النبذة', 'Bio Font Size')} min={10} max={28} value={template.config.bioSize} onChange={(v: number) => updateConfig('bioSize', v)} icon={FileText} />
                     </div>
                     <div className="pt-6 space-y-6">
                        <label className="text-[10px] font-black text-gray-400 uppercase block tracking-widest">{t('التحكم الدقيق في التموضع الرأسي', 'Precision Vertical Displacement')}</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <RangeControl label={t('إزاحة الصورة', 'Avatar Y')} min={-150} max={200} value={template.config.avatarOffsetY} onChange={(v: number) => updateConfig('avatarOffsetY', v)} icon={Move} />
                           <RangeControl label={t('إزاحة الاسم', 'Name Y')} min={-100} max={150} value={template.config.nameOffsetY} onChange={(v: number) => updateConfig('nameOffsetY', v)} icon={MousePointer2} />
                           <RangeControl label={t('إزاحة المسمى الوظيفي', 'Title Y')} min={-100} max={150} value={template.config.titleOffsetY || 0} onChange={(v: number) => updateConfig('titleOffsetY', v)} icon={MousePointer2} />
                           <RangeControl label={t('إزاحة النبذة', 'Bio Y')} min={-100} max={150} value={template.config.bioOffsetY} onChange={(v: number) => updateConfig('bioOffsetY', v)} icon={MousePointer2} />
                           <RangeControl label={t('إزاحة البريد الإلكتروني', 'Email Y')} min={-100} max={150} value={template.config.emailOffsetY} onChange={(v: number) => updateConfig('emailOffsetY', v)} icon={Mail} />
                           <RangeControl label={t('إزاحة الموقع الإلكتروني', 'Website Y')} min={-100} max={150} value={template.config.websiteOffsetY} onChange={(v: number) => updateConfig('websiteOffsetY', v)} icon={Globe} />
                           <RangeControl label={t('إزاحة أزرار التواصل', 'Contact Buttons Y')} min={-100} max={150} value={template.config.contactButtonsOffsetY} onChange={(v: number) => updateConfig('contactButtonsOffsetY', v)} icon={MessageCircle} />
                           <RangeControl label={t('إزاحة روابط السوشيال', 'Social Links Y')} min={-100} max={150} value={template.config.socialLinksOffsetY} onChange={(v: number) => updateConfig('socialLinksOffsetY', v)} icon={Share2} />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'body-style' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                     <div className="flex items-center gap-3"><Box className="text-blue-600" size={24} /><h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('تنسيق جسم البطاقة', 'Card Content Area Style')}</h4></div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ToggleSwitch label={t('تأثير زجاجي شفاف (Glassmorphism)', 'Premium Glass Body')} value={template.config.bodyGlassy} onChange={(v: boolean) => updateConfig('bodyGlassy', v)} icon={GlassWater} color="bg-indigo-600" />
                        <RangeControl 
                           label={t('شفافية جسم البطاقة', 'Body Transparency')} 
                           min={0} max={100} unit="%" 
                           value={template.config.bodyOpacity ?? 100} 
                           onChange={(v: number) => updateConfig('bodyOpacity', v)} 
                           icon={Sun} 
                           hint={t('اضبطه على 0 للكتابة مباشرة فوق الصورة', 'Set to 0 to write directly over background')}
                        />
                        <RangeControl label={t('انحناء الحواف العلوي', 'Border Radius')} min={0} max={120} value={template.config.bodyBorderRadius ?? 48} onChange={(v: number) => updateConfig('bodyBorderRadius', v)} icon={Ruler} />
                        <RangeControl label={t('إزاحة منطقة المحتوى (أعلى/أسفل)', 'Body Y Offset')} min={-1000} max={500} value={template.config.bodyOffsetY || 0} onChange={(v: number) => updateConfig('bodyOffsetY', v)} icon={Move} />
                     </div>

                     <div className="pt-8 border-t dark:border-gray-800 space-y-6">
                        <div className="flex items-center gap-3"><AlignJustify className="text-indigo-600" size={20} /><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('محاذات المحتوى ونمط التباعد', 'Alignment & Spacing DNA')}</label></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="grid grid-cols-3 gap-2">
                             {['start', 'center', 'end'].map(align => (
                                <button type="button" key={align} onClick={() => updateConfig('contentAlign', align)} className={`py-3 rounded-xl border-2 transition-all flex items-center justify-center ${template.config.contentAlign === align ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                   {align === 'start' ? <AlignLeft size={18}/> : align === 'center' ? <AlignCenter size={18}/> : <AlignRight size={18}/>}
                                </button>
                             ))}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                             {['compact', 'normal', 'relaxed'].map(s => (
                                <button type="button" key={s} onClick={() => { updateConfig('spacing', s) }} className={`py-3 rounded-xl border-2 transition-all font-black text-[8px] uppercase ${template.config.spacing === s ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                   {t(s === 'compact' ? 'مضغوط' : (s === 'normal' ? 'عادي' : 'مريح'), s.toUpperCase())}
                                </button>
                             ))}
                          </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'social-lab' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-10">
                    <div className="flex items-center gap-4"><div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl"><Share2 size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('مختبر أيقونات التواصل', 'Social Icons Lab')}</h2></div>
                    
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('شكل وحجم الأيقونة', 'Shape & Size DNA')}</h4>
                       
                       <ToggleSwitch 
                        label={t('استخدام ألوان المنصات الأصلية', 'Use Brand Colors')} 
                        value={template.config.useSocialBrandColors} 
                        onChange={(v: boolean) => updateConfig('useSocialBrandColors', v)} 
                        icon={Zap} 
                        color="bg-emerald-600" 
                       />

                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {['circle', 'squircle', 'rounded', 'square', 'none'].map(style => (
                             <button key={style} onClick={() => updateConfig('socialIconStyle', style)} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.socialIconStyle === style ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-transparent'}`}>
                                {style === 'circle' ? <Circle size={20}/> : style === 'squircle' ? <Shapes size={20}/> : style === 'rounded' ? <Box size={20}/> : style === 'square' ? <Square size={20}/> : <Minus size={20}/>}
                                <span className="text-[8px] font-black uppercase">{t(style, style.toUpperCase())}</span>
                             </button>
                          ))}
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <RangeControl label={t('حجم الأيقونة', 'Icon Size')} min={14} max={40} value={template.config.socialIconSize || 22} onChange={(v: number) => updateConfig('socialIconSize', v)} icon={Maximize2} />
                          <RangeControl label={t('المساحة الداخلية', 'Padding')} min={4} max={30} value={template.config.socialIconPadding || 14} onChange={(v: number) => updateConfig('socialIconPadding', v)} icon={Ruler} />
                          <RangeControl label={t('المسافة بين الأيقونات', 'Gap')} min={4} max={40} value={template.config.socialIconGap || 12} onChange={(v: number) => updateConfig('socialIconGap', v)} icon={SlidersHorizontal} />
                          <RangeControl label={t('عدد الأعمدة', 'Columns')} min={0} max={6} value={template.config.socialIconColumns || 0} onChange={(v: number) => updateConfig('socialIconColumns', v)} icon={Grid} hint={t('0 للتوزيع المرن', '0 for Flex Wrap')} />
                       </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('نمط العرض والألوان', 'Visual Style & Colors')}</h4>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {['filled', 'outline', 'glass', 'ghost'].map(v => (
                             <button key={v} onClick={() => updateConfig('socialIconVariant', v)} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.socialIconVariant === v ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-transparent'}`}>
                                <span className="text-[8px] font-black uppercase">{t(v, v.toUpperCase())}</span>
                             </button>
                          ))}
                       </div>

                       {!template.config.useSocialBrandColors && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                            <ColorPicker label={t('لون خلفية الأيقونة', 'Icon Background')} value={template.config.socialIconBgColor} onChange={(v: string) => updateConfig('socialIconBgColor', v)} />
                            <ColorPicker label={t('لون رمز التواصل', 'Icon Color')} value={template.config.socialIconColor} onChange={(v: string) => updateConfig('socialIconColor', v)} />
                            <ColorPicker label={t('لون حدود الأيقونة', 'Icon Border')} value={template.config.socialIconBorderColor} onChange={(v: string) => updateConfig('socialIconBorderColor', v)} />
                            <RangeControl label={t('سمك الحدود', 'Border Width')} min={0} max={5} value={template.config.socialIconBorderWidth || 1} onChange={(v: number) => updateConfig('socialIconBorderWidth', v)} icon={Ruler} />
                        </div>
                       )}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'elements' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-10">
                    <div className="flex items-center gap-4"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><Palette size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('ألوان عناصر الواجهة', 'Element UI Colors')}</h2></div>
                    
                    <div className="space-y-6">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('ألوان النصوص الأساسية', 'Primary Text Colors')}</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <ColorPicker label={t('لون الاسم', 'Name Color')} value={template.config.nameColor || '#111827'} onChange={(v: string) => updateConfig('nameColor', v)} />
                          <ColorPicker label={t('لون المسمى', 'Title Color')} value={template.config.titleColor || '#2563eb'} onChange={(v: string) => updateConfig('titleColor', v)} />
                          <ColorPicker label={t('لون النبذة', 'Bio Text Color')} value={template.config.bioTextColor || 'rgba(0,0,0,0.65)'} onChange={(v: string) => updateConfig('bioTextColor', v)} />
                       </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6">
                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('ألوان التفاعل والأيقونات', 'Interactive & Icon Colors')}</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <ColorPicker label={t('لون الروابط', 'Links Color')} value={template.config.linksColor || '#3b82f6'} onChange={(v: string) => updateConfig('linksColor', v)} />
                          <ColorPicker label={t('أيقونات التواصل', 'Social Icons Color')} value={template.config.socialIconsColor || '#3b82f6'} onChange={(v: string) => updateConfig('socialIconsColor', v)} />
                          <ColorPicker label={t('خلفية النبذة', 'Bio Background Color')} value={template.config.bioBgColor || 'rgba(0,0,0,0.03)'} onChange={(v: string) => updateConfig('bioBgColor', v)} />
                          <ColorPicker label={t('لون زر الاتصال', 'Phone Button Color')} value={template.config.contactPhoneColor || '#2563eb'} onChange={(v: string) => updateConfig('contactPhoneColor', v)} />
                          <ColorPicker label={t('لون زر واتساب', 'WhatsApp Button Color')} value={template.config.contactWhatsappColor || '#10b981'} onChange={(v: string) => updateConfig('contactWhatsappColor', v)} />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'visuals' && (
              <div className="space-y-8 animate-fade-in">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                  <div className="flex items-center gap-3"><Palette className="text-blue-600" size={24} /><h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('تدرجات الألوان والسمة', 'Gradients & Theme')}</h4></div>
                  
                  <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-black/20 p-2 rounded-[2rem]">
                       {['color', 'gradient', 'image'].map(type => (
                         <button type="button" key={type} onClick={() => updateConfig('defaultThemeType', type as ThemeType)} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 flex-1 ${template.config.defaultThemeType === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400 border-transparent shadow-sm'}`}>
                           {type === 'color' ? <Palette size={20}/> : type === 'gradient' ? <Sparkles size={20}/> : <ImageIcon size={20}/>}
                           <span className="text-[10px] font-black uppercase tracking-widest">{t(type === 'color' ? 'لون ثابت' : type === 'gradient' ? 'تدرج' : 'صورة', type.toUpperCase())}</span>
                         </button>
                       ))}
                  </div>

                  {template.config.defaultThemeType === 'color' && (
                    <div className="space-y-6 animate-fade-in">
                       <label className="text-[10px] font-black text-gray-400 uppercase">{t('لوحة الألوان السريعة', 'Quick Color Palette')}</label>
                       <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                          {ADMIN_PRESET_COLORS.map((clr, i) => (
                            <button type="button" key={i} onClick={() => updateConfig('defaultThemeColor', clr)} className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-125 ${template.config.defaultThemeColor === clr ? 'border-blue-600 scale-125 shadow-lg' : 'border-white dark:border-gray-600'}`} style={{ backgroundColor: clr }} />
                          ))}
                       </div>
                    </div>
                  )}

                  {template.config.defaultThemeType === 'gradient' && (
                    <div className="space-y-6 animate-fade-in">
                       <label className="text-[10px] font-black text-gray-400 uppercase">{t('اختر التدرج اللوني المفضل', 'Select Color Gradient')}</label>
                       <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                          {THEME_GRADIENTS.map((grad, i) => (
                            <button type="button" key={i} onClick={() => updateConfig('defaultThemeGradient', grad)} className={`h-12 rounded-2xl border-2 transition-all ${template.config.defaultThemeGradient === grad ? 'border-blue-600 scale-110 shadow-lg' : 'border-transparent opacity-60'}`} style={{ background: grad }} />
                          ))}
                       </div>
                    </div>
                  )}

                  {template.config.defaultThemeType === 'image' && (
                    <div className="space-y-6 animate-fade-in">
                       <label className="text-[10px] font-black text-gray-400 uppercase">{t('خلفيات فنية افتراضية', 'Artistic Background Presets')}</label>
                       <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {BACKGROUND_PRESETS.map((url, i) => (
                            <button type="button" key={i} onClick={() => updateConfig('defaultBackgroundImage', url)} className={`h-24 rounded-2xl border-2 overflow-hidden transition-all ${template.config.defaultBackgroundImage === url ? 'border-blue-600 scale-105 shadow-xl' : 'border-transparent opacity-60'}`}>
                               <img src={url} className="w-full h-full object-cover" alt={`Preset ${i}`} />
                            </button>
                          ))}
                       </div>
                       <div className="pt-4 border-t dark:border-gray-800">
                          <input type="file" ref={bgInputRef} onChange={handleBgUpload} className="hidden" accept="image/*" />
                          <button type="button" onClick={() => checkAuthAndClick(bgInputRef)} className="w-full py-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-3xl font-black text-xs uppercase flex items-center justify-center gap-3 border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 transition-all">
                             {uploadingBg ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                             {t('رفع خلفية خاصة للقالب', 'Upload Custom Background')}
                          </button>
                       </div>
                    </div>
                  )}

                  <ColorPicker label={t('لون السمة الأساسي', 'Base Theme Color')} value={template.config.defaultThemeColor} onChange={(v: string) => updateConfig('defaultThemeColor', v)} />

                  <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('خلفيات الصفحة والأرضية', 'Site & Card Base Backgrounds')}</h4>
                    
                    <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/20 space-y-4">
                       <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-1 flex items-center gap-2">
                          <Repeat size={14} /> {t('استراتيجية خلفية الموقع', 'Page Background Strategy')}
                       </label>
                       <div className="grid grid-cols-2 gap-3">
                          <button 
                             type="button"
                             onClick={() => updateConfig('pageBgStrategy', 'solid')}
                             className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.pageBgStrategy !== 'mirror-header' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-400'}`}
                          >
                             <Pipette size={18} />
                             <span className="text-[9px] font-black uppercase">{t('لون ثابت', 'Solid Color')}</span>
                          </button>
                          <button 
                             type="button"
                             onClick={() => updateConfig('pageBgStrategy', 'mirror-header')}
                             className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.pageBgStrategy === 'mirror-header' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-400'}`}
                          >
                             <Layers size={18} />
                             <span className="text-[9px] font-black uppercase">{t('مطابقة ألوان الترويسة الخلفية', 'Mirror Header Background')}</span>
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ColorPicker 
                          label={t('لون أرضية البطاقة', 'Card Base Bg')} 
                          value={template.config.cardBgColor || ''} 
                          onChange={(v: string) => updateConfig('cardBgColor', v)} 
                        />
                        {template.config.pageBgStrategy !== 'mirror-header' && (
                          <ColorPicker 
                            label={t('لون خلفية الصفحة', 'Page Background')} 
                            value={template.config.pageBgColor || ''} 
                            onChange={(v: string) => updateConfig('pageBgColor', v)} 
                          />
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div className="flex items-center gap-3"><Moon className="text-gray-400" size={18} /><span className="text-xs font-black dark:text-white uppercase tracking-widest">{t('الوضع ليلي افتراضياً', 'Default Dark Mode')}</span></div>
                      <button type="button" onClick={() => updateConfig('defaultIsDark', !template.config.defaultIsDark)} className={`w-14 h-7 rounded-full relative transition-all ${template.config.defaultIsDark ? 'bg-blue-600 shadow-lg' : 'bg-gray-200 dark:bg-gray-700'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isRtl ? (template.config.defaultIsDark ? 'right-8' : 'right-1') : (template.config.defaultIsDark ? 'left-8' : 'left-1')}`} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'occasion' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-8 relative overflow-hidden">
                     <div className="flex items-center gap-3 relative z-10">
                        <PartyPopper className="text-blue-600" size={24} />
                        <h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('قسم المناسبة خاصة', 'Special Occasion Section')}</h4>
                     </div>

                     <ToggleSwitch label={t('تفعيل المناسبة افتراضياً', 'Activate by Default')} value={template.config.showOccasionByDefault} onChange={(v: boolean) => updateConfig('showOccasionByDefault', v)} icon={CheckCircle2} />
                     
                     <div className="grid grid-cols-1 gap-6 pt-4 border-t dark:border-gray-800">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('صاحب الدعوة الافتراضي', 'Default Organizer Name')}</label>
                           <div className="relative">
                              <UserCircle className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-50`} size={16} />
                              <input type="text" value={template.config.defaultName || ''} onChange={e => updateConfig('defaultName', e.target.value)} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all`} placeholder={t('أدخل اسم صاحب الدعوة...', 'Enter organizer name...')} />
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('نص البادئة الافتراضي (يتشرف)', 'Default Prefix')}</label>
                              <input type="text" value={template.config.invitationPrefix || ''} onChange={e => updateConfig('invitationPrefix', e.target.value)} className={`w-full py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold px-5`} />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('نص الترحيب الافتراضي (بدعوتكم)', 'Default Welcome')}</label>
                              <input type="text" value={template.config.invitationWelcome || ''} onChange={e => updateConfig('invitationWelcome', e.target.value)} className={`w-full py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold px-5`} />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('عنوان المناسبة', 'Occasion Title')}</label>
                           <div className="relative">
                              <TypographyIcon className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-500`} size={16} />
                              <input type="text" value={template.config.occasionTitle || ''} onChange={e => updateConfig('occasionTitle', e.target.value)} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all`} placeholder="مثلاً: حفل تخرج عبدالله" />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('نبذة عن المناسبة', 'Occasion Description')}</label>
                           <textarea value={template.config.occasionDesc || ''} onChange={e => updateConfig('occasionDesc', e.target.value)} className="w-full p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all min-h-[100px] resize-none" placeholder="اكتب تفاصيل مختصرة عن المناسبة..." />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('تاريخ ووقت المناسبة', 'Event Date & Time')}</label>
                              <div className="relative">
                                 <Calendar className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-500`} size={16} />
                                 <input type="datetime-local" value={template.config.occasionDate || ''} onChange={e => updateConfig('occasionDate', e.target.value)} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all [direction:ltr]`} />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('موقع المناسبة (خرائط قوقل)', 'Google Maps Location')}</label>
                              <div className="relative">
                                 <MapPin className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-red-500`} size={16} />
                                 <input type="url" value={template.config.occasionMapUrl || ''} onChange={e => updateConfig('occasionMapUrl', e.target.value)} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all`} placeholder="https://maps.google.com/..." />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <ColorPicker label={t('لون البادئة الافتراضي', 'Default Prefix Color')} value={template.config.occasionPrefixColor || '#2563eb'} onChange={(v: string) => updateConfig('occasionPrefixColor', v)} />
                           <ColorPicker label={t('لون الاسم الافتراضي', 'Default Name Color')} value={template.config.occasionNameColor || '#111827'} onChange={(v: string) => updateConfig('occasionNameColor', v)} />
                           <ColorPicker label={t('اللون الأساسي للمناسبة', 'Primary Accent Color')} value={template.config.occasionPrimaryColor || '#7c3aed'} onChange={(v: string) => updateConfig('occasionPrimaryColor', v)} />
                           <ColorPicker label={t('لون خلفية الصندوق', 'Box Background Color')} value={template.config.occasionBgColor || '#ffffff'} onChange={(v: string) => updateConfig('occasionBgColor', v)} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <ToggleSwitch label={t('تأثير زجاجي للصندوق', 'Glass Occasion Box')} value={template.config.occasionGlassy} onChange={(v: boolean) => updateConfig('occasionGlassy', v)} icon={GlassWater} color="bg-indigo-600" />
                           <RangeControl label={t('شفافية صندوق المناسبة', 'Occasion Box Transparency')} min={0} max={100} unit="%" value={template.config.occasionOpacity ?? 100} onChange={(v: number) => updateConfig('occasionOpacity', v)} icon={Sun} />
                        </div>
                        <RangeControl label={t('إزاحة كتلة الدعوة كاملة', 'Full Invitation Block Displacement')} min={-200} max={300} value={template.config.invitationYOffset || 0} onChange={(v: number) => updateConfig('invitationYOffset', v)} icon={Move} />
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'qrcode' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                     <div className="flex items-center gap-3"><QrCode className="text-blue-600" size={24} /><h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('تخصيص الباركود', 'QR Code Customization')}</h4></div>
                     <ToggleSwitch label={t('إظهار الباركود افتراضياً', 'Show QR by Default')} value={template.config.showQrCodeByDefault} onChange={(v: boolean) => updateConfig('showQrCodeByDefault', v)} icon={QrCode} />
                     <RangeControl label={t('حجم الباركود', 'QR Size')} min={40} max={200} value={template.config.qrSize || 90} onChange={(v: number) => updateConfig('qrSize', v)} icon={Maximize2} />
                     <RangeControl label={t('إزاحة الباركود رأسياً', 'QR Vertical Offset')} min={-200} max={300} value={template.config.qrOffsetY || 0} onChange={(v: number) => updateConfig('qrOffsetY', v)} icon={Move} />
                     <ColorPicker label={t('لون الباركود', 'QR Foreground')} value={template.config.qrColor || '#2563eb'} onChange={(v: string) => updateConfig('qrColor', v)} />
                  </div>
               </div>
            )}

            {activeTab === 'special-features' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 p-8 rounded-[3rem] border border-indigo-100 dark:border-indigo-900/20 shadow-xl space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12 transition-transform duration-700 pointer-events-none">
                       <Trophy size={180} />
                    </div>
                    
                    <div className="flex items-center gap-4 relative z-10">
                       <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Trophy size={24} /></div>
                       <div>
                          <h2 className="text-2xl font-black dark:text-white uppercase leading-none mb-1">{t('specialFeatures')}</h2>
                          <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">{t('premiumFeaturesDesc')}</p>
                       </div>
                    </div>

                    <div className="bg-white/60 dark:bg-black/20 backdrop-blur-sm p-6 rounded-3xl border border-white dark:border-white/5 space-y-6">
                       <div className="flex gap-4 items-start border-b dark:border-white/5 pb-6">
                          <AlertTriangle size={24} className="text-amber-500 shrink-0" />
                          <div className="space-y-1">
                             <h4 className="text-xs font-black dark:text-white">{isRtl ? 'تحكم في الميزات الخاصة للبطاقة' : 'Control Card Special Features'}</h4>
                             <p className="text-[10px] font-bold text-gray-500 leading-relaxed">
                                {isRtl 
                                  ? 'هذا القسم يسمح لك بتفعيل ميزات مرئية إضافية تجعل القالب فريداً واحترافياً للغاية.' 
                                  : 'This section allows you to enable extra visual features that make the template unique and highly professional.'}
                             </p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 gap-4">
                          <ToggleSwitch 
                            label={isRtl ? 'إضافة نجوم التميز تحت الاسم' : 'Add Excellence Stars under name'} 
                            value={template.config.showStarsByDefault} 
                            onChange={(v: boolean) => updateConfig('showStarsByDefault', v)} 
                            icon={Star} 
                            color="bg-amber-500" 
                          />
                          <ToggleSwitch 
                            label={isRtl ? 'وسام الحساب الموثق (Verified)' : 'Verified Account Badge'} 
                            value={template.config.isVerifiedByDefault} 
                            onChange={(v: boolean) => updateConfig('isVerifiedByDefault', v)} 
                            icon={CheckCircle2} 
                            color="bg-blue-500" 
                          />
                          <ToggleSwitch 
                            label={isRtl ? 'إطار ذهبي للبطاقة كاملة' : 'Full Card Golden Frame'} 
                            value={template.config.hasGoldenFrameByDefault} 
                            onChange={(v: boolean) => updateConfig('hasGoldenFrameByDefault', v)} 
                            icon={Maximize2} 
                            color="bg-yellow-600" 
                          />
                       </div>

                       {/* تم نقل ميزة جسم البطاقة الخاصة هنا */}
                       <div className="pt-8 border-t dark:border-white/5 space-y-8">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Sparkle className="text-blue-600" size={22} />
                                <h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('ميزة جسم البطاقة الخاصة (مربع حصري)', 'Special Body Feature (Exclusive Box)')}</h4>
                             </div>
                             <ToggleSwitch label={t('تفعيل الميزة', 'Enable')} value={template.config.showBodyFeatureByDefault} onChange={(v: boolean) => updateConfig('showBodyFeatureByDefault', v)} color="bg-emerald-600" />
                          </div>

                          {template.config.showBodyFeatureByDefault && (
                             <div className="grid grid-cols-1 gap-6 animate-fade-in p-6 bg-blue-50/30 dark:bg-blue-900/10 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/20">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                   <div className="space-y-2">
                                      <label className="text-[9px] font-black text-gray-400 uppercase px-1">{t('نص الميزة (AR)', 'Feature Text (AR)')}</label>
                                      <input type="text" value={template.config.bodyFeatureTextAr || ''} onChange={e => updateConfig('bodyFeatureTextAr', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border text-xs font-bold dark:text-white" />
                                   </div>
                                   <div className="space-y-2">
                                      <label className="text-[9px] font-black text-gray-400 uppercase px-1">{t('نص الميزة (EN)', 'Feature Text (EN)')}</label>
                                      <input type="text" value={template.config.bodyFeatureTextEn || ''} onChange={e => updateConfig('bodyFeatureTextEn', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border text-xs font-bold dark:text-white" />
                                   </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <RangeControl 
                                      label={t('توسعة الميزة جانبياً', 'Side Expansion')} 
                                      min={0} max={60} 
                                      value={template.config.bodyFeaturePaddingX ?? 0} 
                                      onChange={(v: number) => updateConfig('bodyFeaturePaddingX', v)} 
                                      icon={SlidersHorizontal} 
                                   />
                                   <RangeControl 
                                      label={t('إزاحة الميزة رأسياً', 'Vertical Offset')} 
                                      min={-100} max={150} 
                                      value={template.config.bodyFeatureOffsetY ?? 0} 
                                      onChange={(v: number) => updateConfig('bodyFeatureOffsetY', v)} 
                                      icon={Move} 
                                   />
                                   <RangeControl label={t('ارتفاع القسم', 'Height')} min={30} max={120} value={template.config.bodyFeatureHeight ?? 45} onChange={(v: number) => updateConfig('bodyFeatureHeight', v)} icon={Maximize2} />
                                   <RangeControl label={t('انحناء الحواف', 'Radius')} min={0} max={50} value={template.config.bodyFeatureBorderRadius ?? 16} onChange={(v: number) => updateConfig('bodyFeatureBorderRadius', v)} icon={Ruler} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                   <ColorPicker label={t('لون خلفية', 'Background')} value={template.config.bodyFeatureBgColor} onChange={(v: string) => updateConfig('bodyFeatureBgColor', v)} />
                                   <ColorPicker label={t('لون النص', 'Text Color')} value={template.config.bodyFeatureTextColor} onChange={(v: string) => updateConfig('bodyFeatureTextColor', v)} />
                                   <ToggleSwitch label={t('نمط زجاجي', 'Glassy')} value={template.config.bodyFeatureGlassy} onChange={(v: boolean) => updateConfig('bodyFeatureGlassy', v)} icon={GlassWater} color="bg-indigo-600" />
                                </div>
                             </div>
                          )}
                       </div>
                    </div>

                    <div className="p-4 bg-indigo-600/5 dark:bg-indigo-600/20 rounded-2xl border border-indigo-600/10 text-center">
                       <span className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 tracking-[0.3em]">
                          {isRtl ? 'هذه الميزات فعالة الآن في المعاينة' : 'These features are now active in preview'}
                       </span>
                    </div>
                 </div>
              </div>
            )}

          </div>
        </div>

        <div className="hidden lg:flex w-full lg:w-[480px] bg-gray-50/50 dark:bg-black/40 border-r lg:border-r-0 lg:border-l dark:border-gray-800 p-6 flex flex-col items-center relative overflow-y-auto no-scrollbar scroll-smooth">
           <div className="flex flex-col items-center w-full">
              <div className="mb-6 w-full flex items-center justify-between px-4">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div><span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('معاينة حية', 'Live Preview')}</span></div>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                   <button type="button" onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-lg transition-all ${previewDevice === 'mobile' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Smartphone size={16}/></button>
                   <button type="button" onClick={() => setPreviewDevice('tablet')} className={`p-2 rounded-lg transition-all ${previewDevice === 'tablet' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Tablet size={16}/></button>
                   <button type="button" onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-lg transition-all ${previewDevice === 'desktop' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Monitor size={18}/></button>
                </div>
              </div>
              
              <div className={`transition-all duration-500 origin-top rounded-[3.5rem] shadow-2xl overflow-hidden bg-white dark:bg-gray-950 relative border-[12px] border-gray-900 dark:border-gray-800 ${previewDevice === 'mobile' ? 'w-[360px]' : previewDevice === 'tablet' ? 'w-[480px]' : 'w-[400px]'}`} 
                   style={{ isolation: 'isolate', transform: 'translateZ(0)' }}>
                <div className="themed-scrollbar overflow-x-hidden h-[620px] scroll-smooth relative z-0" style={{ borderRadius: '2.6rem' }}>
                   <CardPreview 
                     data={{ 
                       ...sampleCardData, 
                       name: template.config.defaultName || sampleCardData.name,
                       profileImage: template.config.defaultProfileImage || sampleCardData.profileImage || '',
                       isDark: template.config.defaultIsDark,
                       showOccasion: template.config.showOccasionByDefault,
                       showBodyFeature: template.config.showBodyFeatureByDefault,
                       showQrCode: template.config.showQrCodeByDefault,
                       showStars: template.config.showStarsByDefault,
                       isVerified: template.config.isVerifiedByDefault,
                       hasGoldenFrame: template.config.hasGoldenFrameByDefault,
                       themeType: template.config.defaultThemeType, 
                       themeColor: template.config.defaultThemeColor, 
                       themeGradient: template.config.defaultThemeGradient,
                       backgroundImage: template.config.defaultBackgroundImage
                     } as any} 
                     lang={lang} 
                     customConfig={template.config} 
                     hideSaveButton={true} 
                     isFullFrame={true}
                   />
                </div>
              </div>
           </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[3.5rem] shadow-2xl border dark:border-gray-800 overflow-hidden p-8 space-y-8 animate-zoom-in">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? 'حفظ التصميم ونشره' : 'Publish Template'}</h3>
                 <button type="button" onClick={() => setShowSaveModal(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
              </div>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase px-1">{t('الاسم (AR)', 'Name (AR)')}</label>
                       <input type="text" value={template.nameAr} onChange={e => updateTemplate('nameAr', e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold outline-none" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase px-1">{t('الاسم (EN)', 'Name (EN)')}</label>
                       <input type="text" value={template.nameEn} onChange={e => updateTemplate('nameEn', e.target.value)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold outline-none" />
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase px-1">{t('القسم (Category)', 'Section Category')}</label>
                       <select value={template.categoryId} onChange={e => updateTemplate('categoryId', e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold outline-none">
                          <option value="">{t('اختر القسم...', 'Select Category...')}</option>
                          {categories.map(cat => <option key={cat.id} value={cat.id}>{isRtl ? cat.nameAr : cat.nameEn}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase px-1">{t('ترتيب العرض', 'Display Order')}</label>
                       <input type="number" value={template.order} onChange={e => updateTemplate('order', parseInt(e.target.value) || 0)} className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold outline-none" />
                    </div>
                 </div>

                 <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Star className={template.isFeatured ? "text-amber-500" : "text-gray-300"} size={20} fill={template.isFeatured ? "currentColor" : "none"} />
                       <span className="text-[11px] font-black uppercase tracking-widest dark:text-white">{t('تمييز القالب (تثبيت في المقدمة)', 'Feature Template (Stay on top)')}</span>
                    </div>
                    <button type="button" onClick={() => updateTemplate('isFeatured', !template.isFeatured)} className={`w-12 h-6 rounded-full relative transition-all ${template.isFeatured ? 'bg-amber-50 shadow-md' : 'bg-gray-200 dark:bg-gray-700'}`}>
                       <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (template.isFeatured ? 'right-7' : 'right-1') : (template.isFeatured ? 'left-7' : 'left-1')}`} />
                    </button>
                 </div>
              </div>
              <button type="button" onClick={() => onSave(template)} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase shadow-2xl active:scale-95 transition-all">{t('تأكيد الحفظ', 'Confirm Publish')}</button>
           </div>
        </div>
      )}

      {showResetConfirm && (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-sm rounded-[3rem] p-10 text-center shadow-2xl border border-orange-100 dark:border-orange-900/20 animate-zoom-in">
             <div className="w-20 h-20 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
             </div>
             <h3 className="text-2xl font-black dark:text-white mb-4">{t('تأكيد إعادة الضبط', 'Confirm Reset')}</h3>
             <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                {t('هل أنت متأكد من تصفير كافة قيم الإزاحة والتباعد؟ هذا الإجراء سيعيد العناصر لمواقعها الافتراضية.', 'Are you sure? This will reset all offsets and spacing to their original default values.')}
             </p>
             <div className="flex flex-col gap-3">
                <button 
                  onClick={handleActualReset}
                  className="w-full py-5 bg-orange-600 text-white rounded-3xl font-black text-sm uppercase shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} />
                  {t('نعم، قم بإعادة الضبط', 'Yes, Reset Now')}
                </button>
                <button 
                  onClick={() => setShowResetConfirm(false)}
                  className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-3xl font-black text-sm uppercase transition-all"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateBuilder;
