
import React, { useState, useRef, useEffect } from 'react';
import { CustomTemplate, TemplateConfig, Language, CardData, TemplateCategory, VisualStyle, ThemeType, PageBgStrategy, SpecialLinkItem } from '../types';
import { TRANSLATIONS, SAMPLE_DATA, THEME_COLORS, THEME_GRADIENTS, BACKGROUND_PRESETS, AVATAR_PRESETS, PATTERN_PRESETS, SVG_PRESETS } from '../constants';
import { uploadImageToCloud } from '../services/uploadService';
import { getAllCategories, saveTemplateCategory, getAllVisualStyles, auth, getSiteSettings, searchUsersByEmail } from '../services/firebase';
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
  CheckCircle2, Grid, RefreshCcw, Shapes, Code2, MousePointer2, AlignJustify, EyeOff, Briefcase, Wand2, RotateCcw, AlertTriangle, Repeat, Sparkle, LogIn, Trophy, Trash2, ImagePlus, Navigation2, Map as MapIcon, ShoppingCart, Quote, User as UserIcon, Image as ImageIconLucide, ArrowLeftRight, ArrowUpDown, MonitorDot, TabletSmartphone, ShieldCheck, UserCheck, Search
} from 'lucide-react';

type BuilderTab = 'header' | 'body-style' | 'avatar' | 'visuals' | 'bio-lab' | 'identity-lab' | 'direct-links' | 'membership-lab' | 'contact-lab' | 'desktop-lab' | 'special-links' | 'location' | 'social-lab' | 'qrcode' | 'special-features';

interface TemplateBuilderProps {
  lang: Language;
  onSave: (template: CustomTemplate) => void;
  onCancel?: () => void;
  initialTemplate?: CustomTemplate;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ lang, onSave, onCancel, initialTemplate }) => {
  const isRtl = lang === 'ar';
  const labelTextClasses = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 block mb-1.5";
  const inputClasses = "w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all shadow-inner";

  const headerAssetInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const specialLinkInputRef = useRef<HTMLInputElement>(null);
  
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
  const [uploadingSpecialImg, setUploadingSpecialImg] = useState(false);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [visualStyles, setVisualStyles] = useState<VisualStyle[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(initialTemplate?.parentStyleId || '');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showDirectAuth, setShowDirectAuth] = useState(false);
  
  // منطق البحث عن الأعضاء
  const [userQuery, setUserQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [uploadConfig, setUploadConfig] = useState({ storageType: 'database', uploadUrl: '' });

  const [template, setTemplate] = useState<CustomTemplate>(initialTemplate || {
    id: `tmpl_${Date.now()}`,
    categoryId: '',
    parentStyleId: '',
    restrictedUserId: '',
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
      contactButtonsGap: 12,
      contactButtonsRadius: 16,
      contactButtonsPaddingV: 16,
      contactButtonsGlassy: false,
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
      showSpecialLinksByDefault: true,
      specialLinksCols: 2,
      specialLinksGap: 12,
      specialLinksRadius: 24,
      specialLinksAspectRatio: 'square',
      specialLinksOffsetY: 0,
      defaultSpecialLinks: [],
      showMembershipByDefault: false,
      membershipTitleAr: 'اشتراك مفعل',
      membershipTitleEn: 'Active Subscription',
      membershipStartDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      membershipExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      membershipOffsetY: 0,
      membershipGlassy: false,
      membershipBgColor: '',
      membershipBorderColor: '',
      membershipTextColor: '',
      membershipAccentColor: '',
      showLocationByDefault: true,
      locationOffsetY: 0,
      locationBgColor: '',
      locationIconColor: '',
      locationTextColor: '',
      locationBorderRadius: 24,
      locationGlassy: false,
      locationPaddingV: 20,
      locationAddressSize: 13,
      linksSectionVariant: 'list',
      linksSectionBgColor: '',
      linksSectionTextColor: '',
      linksSectionIconColor: '',
      linksSectionRadius: 24,
      linksSectionGlassy: false,
      linksSectionOffsetY: 0,
      linksSectionPadding: 0,
      linksSectionPaddingV: 24,
      linksSectionGap: 12,
      linksShowText: true,
      linksShowBg: true,
      linksWebsiteIconType: 'globe',
      linksItemBgColor: '',
      linksItemRadius: 16,
      showStarsByDefault: false,
      isVerifiedByDefault: false,
      hasGoldenFrameByDefault: false,
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
      bioBorderRadius: 32,
      bioBorderWidth: 1,
      bioBorderColor: '',
      bioPaddingV: 20,
      bioPaddingH: 20,
      bioGlassy: false,
      bioOpacity: 100,
      bioMaxWidth: 90,
      bioTextAlign: 'center',
      defaultBioAr: '',
      defaultBioEn: '',
      linksColor: '#3b82f6',
      socialIconsColor: '#3b82f6',
      contactPhoneColor: '#2563eb',
      contactWhatsappColor: '#10b981',
      defaultThemeType: 'gradient',
      defaultThemeColor: '#2563eb',
      defaultThemeGradient: THEME_GRADIENTS[0],
      defaultName: '',
      defaultTitle: '',
      defaultCompany: '',
      defaultIsDark: false,
      cardBodyColor: '#ffffff',
      cardBgColor: '#f1f5f9', 
      pageBgColor: '',
      pageBgStrategy: 'solid',
      desktopLayout: 'centered-card',
      cardMaxWidth: 500,
      desktopBodyOffsetY: -60,
      mobileBodyOffsetY: 0,
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

  const [currentSpecialLinks, setCurrentSpecialLinks] = useState<SpecialLinkItem[]>(initialTemplate?.config.defaultSpecialLinks || (SAMPLE_DATA[lang]?.specialLinks as SpecialLinkItem[]) || []);
  const [defaultEmails, setDefaultEmails] = useState<string[]>([]);
  const [defaultWebsites, setDefaultWebsites] = useState<string[]>([]);

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

  useEffect(() => {
    updateConfig('defaultSpecialLinks', currentSpecialLinks);
  }, [currentSpecialLinks]);

  // منطق البحث التلقائي عن المستخدم
  useEffect(() => {
    if (userQuery.length >= 3) {
      setIsSearchingUsers(true);
      const timer = setTimeout(async () => {
        const results = await searchUsersByEmail(userQuery);
        setUserSearchResults(results);
        setIsSearchingUsers(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUserSearchResults([]);
    }
  }, [userQuery]);

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
      bodyFeatureOffsetY: 0,
      bodyFeaturePaddingX: 0,
      specialLinksOffsetY: 0,
      locationOffsetY: 0,
      linksSectionOffsetY: 0,
      membershipOffsetY: 0,
      spacing: 'normal',
      contentAlign: 'center',
      mobileBodyOffsetY: 0,
      desktopBodyOffsetY: -60
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

  const handleSpecialLinkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingSpecialImg(true);
    try {
      const b = await uploadImageToCloud(file, 'avatar', uploadConfig as any);
      if (b) {
        const newItem: SpecialLinkItem = {
          id: Date.now().toString(),
          imageUrl: b,
          linkUrl: '',
          titleAr: '',
          titleEn: ''
        };
        setCurrentSpecialLinks([...currentSpecialLinks, newItem]);
      }
    } finally {
      setUploadingSpecialImg(false);
    }
  };

  const updateSpecialLink = (id: string, field: keyof SpecialLinkItem, value: string) => {
    setCurrentSpecialLinks(currentSpecialLinks.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const removeSpecialLink = (id: string) => {
    setCurrentSpecialLinks(currentSpecialLinks.filter(l => l.id !== id));
  };

  const handleAddDefaultLink = (type: 'email' | 'website') => {
    if (type === 'email') setDefaultEmails([...defaultEmails, '']);
    else setDefaultWebsites([...defaultWebsites, '']);
  };

  const handleUpdateDefaultLink = (type: 'email' | 'website', index: number, val: string) => {
    if (type === 'email') {
      const copy = [...defaultEmails]; copy[index] = val; setDefaultEmails(copy);
    } else {
      const copy = [...defaultWebsites]; copy[index] = val; setDefaultWebsites(copy);
    }
  };

  const handleRemoveDefaultLink = (type: 'email' | 'website', index: number) => {
    if (type === 'email') setDefaultEmails(defaultEmails.filter((_, i) => i !== index));
    else setDefaultWebsites(defaultWebsites.filter((_, i) => i !== index));
  };

  const sampleCardData = (SAMPLE_DATA[lang] || SAMPLE_DATA['en']) as CardData;

  const RangeControl = ({ label, value, min, max, onChange, unit = "px", icon: Icon, hint }: any) => (
    <div className="bg-white dark:bg-[#121215] p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-4 transition-all hover:border-blue-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
             {Icon && <Icon size={14} />}
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</span>
              {hint && <span className="text-[8px] text-gray-400 font-bold">{hint}</span>}
           </div>
        </div>
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
    </div>
  );

  const ToggleSwitch = ({ label, value, onChange, icon: Icon, color = "bg-blue-600" }: any) => (
    <div className="flex items-center justify-between p-6 bg-white dark:bg-[#121215] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-sm transition-all hover:bg-gray-50/50">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
          {Icon && <Icon size={20} />}
        </div>
        <span className={`text-xs font-black uppercase tracking-widest ${value ? 'dark:text-white' : 'text-gray-400'}`}>{label}</span>
      </div>
      <button type="button" onClick={() => onChange(!value)} className={`w-14 h-7 rounded-full relative transition-all ${value ? color + ' shadow-lg' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isRtl ? (value ? 'right-8' : 'right-1') : (value ? 'left-8' : 'left-1')}`} />
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

  const isFullHeaderPreview = template.config.desktopLayout === 'full-width-header' && previewDevice === 'desktop';

  const previewBodyOffsetY = (previewDevice === 'mobile' || previewDevice === 'tablet') 
    ? (template.config.mobileBodyOffsetY ?? 0) 
    : 0;

  const previewDesktopPullUp = (previewDevice === 'desktop' && template.config.desktopLayout === 'full-width-header')
    ? (template.config.desktopBodyOffsetY ?? -60)
    : 0;

  const previewPageBg = template.config.pageBgStrategy === 'mirror-header' 
    ? (template.config.defaultThemeType === 'color' ? template.config.defaultThemeColor : '#f8fafc')
    : (template.config.pageBgColor || (template.config.defaultIsDark ? '#050507' : '#f8fafc'));

  return (
    <div className="bg-white dark:bg-[#0a0a0c] rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[calc(100vh-100px)] min-h-[850px] relative">
      
      {showAuthWarning && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
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
          <NavItem id="body-style" label={t('جسم البطاقة', 'Card Body Style')} icon={Box} />
          <NavItem id="avatar" label={t('الصورة الشخصية', 'Avatar Style')} icon={Circle} />
          <NavItem id="visuals" label={t('الألوان والسمة', 'Colors & Theme')} icon={Palette} />
          <NavItem id="identity-lab" label={t('بيانات الهوية', 'Identity Details')} icon={UserIcon} />
          <NavItem id="bio-lab" label={t('النبذة المهنية', 'Professional Bio')} icon={Quote} />
          <NavItem id="direct-links" label={t('قسم الروابط المباشرة', 'Direct Links Section')} icon={LinkIcon} />
          <NavItem id="membership-lab" label={t('membershipSection')} icon={ShieldCheck} />
          <NavItem id="contact-lab" label={t('قسم الاتصال', 'Contact Section')} icon={Phone} />
          <NavItem id="special-links" label={t('روابط صور (عروض/منتجات)', 'Image Links (Offers/Products)')} icon={ImagePlus} />
          <NavItem id="location" label={t('الموقع الجغرافي', 'Geographical Location')} icon={MapIcon} />
          <NavItem id="social-lab" label={t('أيقونات التواصل', 'Social Icons')} icon={Share2} />
          <NavItem id="qrcode" label={t('رمز الـ QR', 'QR Code Style')} icon={QrCode} />
          <NavItem id="special-features" label={t('المميزات الخاصة', 'Special Features')} icon={Trophy} />
          <NavItem id="desktop-lab" label={t('إعدادات العرض (سطح المكتب)', 'Display Settings (Desktop)')} icon={MonitorDot} />
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
                           {id: 'modern-split', icon: Columns, label: 'حديث'}
                         ].map(item => (
                           <button 
                            key={item.id} 
                            onClick={() => updateConfig('headerType', item.id)} 
                            className={`py-4 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.headerType === item.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                           >
                             <item.icon size={20} /> 
                             <span className="text-[7px] font-black uppercase text-center leading-tight">{t(item.label, item.id)}</span>
                           </button>
                         ))}
                    </div>
                    <RangeControl label={t('ارتفاع الترويسة', 'Header Height')} min={40} max={1000} value={template.config.headerHeight} onChange={(v: number) => updateConfig('headerHeight', v)} icon={Maximize2} />
                 </div>
              </div>
            )}

            {activeTab === 'body-style' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                     <div className="flex items-center gap-3"><Box className="text-blue-600" size={24} /><h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('تنسيق جسم البطاقة', 'Card Content Area Style')}</h4></div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ToggleSwitch label={t('تفعيل تأثير زجاجي شفاف (Glassmorphism)', 'Premium Glass Body')} value={template.config.bodyGlassy} onChange={(v: boolean) => updateConfig('bodyGlassy', v)} icon={GlassWater} color="bg-indigo-600" />
                        
                        <ColorPicker label={isRtl ? 'لون جسم البطاقة' : 'Card Body Color'} value={template.config.cardBodyColor || ''} onChange={(v: string) => updateConfig('cardBodyColor', v)} />

                        <RangeControl 
                           label={t('شفافية جسم البطاقة', 'Body Transparency')} 
                           min={0} max={100} unit="%" 
                           value={template.config.bodyOpacity ?? 100} 
                           onChange={(v: number) => updateConfig('bodyOpacity', v)} 
                           icon={Sun} 
                           hint={t('اضبطه على 0 للكتابة مباشرة فوق الصورة', 'Set to 0 to write directly over background')}
                        />
                        
                        <RangeControl label={t('انحناء الحواف العلوي', 'Border Radius')} min={0} max={120} value={template.config.bodyBorderRadius ?? 48} onChange={(v: number) => updateConfig('bodyBorderRadius', v)} icon={Ruler} />
                        
                        <div className="md:col-span-2">
                           <RangeControl label={isRtl ? 'إزاحة جسم البطاقة (الجوال/الداخلي)' : 'Mobile/Internal Body Offset'} min={-200} max={200} value={template.config.mobileBodyOffsetY ?? 0} onChange={(v: number) => updateConfig('mobileBodyOffsetY', v)} icon={Move} hint={isRtl ? "تزامن مع خيار إزاحة الجوال" : "Synced with mobile offset option"} />
                        </div>
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

            {activeTab === 'membership-lab' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-10">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl shadow-sm"><ShieldCheck size={24} /></div>
                       <div>
                          <h2 className="text-2xl font-black dark:text-white uppercase leading-none mb-1">{t('membershipSection')}</h2>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isRtl ? 'إدارة تواريخ العضوية والاشتراكات وشريط الإنجاز' : 'Manage membership dates and subscription progress bar'}</p>
                       </div>
                    </div>

                    <div className="space-y-10">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className={labelTextClasses}>{t('عنون العضوية (AR)', 'Membership Title (AR)')}</label>
                             <input type="text" value={template.config.membershipTitleAr || ''} onChange={e => updateConfig('membershipTitleAr', e.target.value)} className={inputClasses} placeholder="اشتراك مفعل" />
                          </div>
                          <div className="space-y-2">
                             <label className={labelTextClasses}>{t('عنون العضوية (EN)', 'Membership Title (EN)')}</label>
                             <input type="text" value={template.config.membershipTitleEn || ''} onChange={e => updateConfig('membershipTitleEn', e.target.value)} className={inputClasses} placeholder="Active Subscription" />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className={labelTextClasses}>{t('تاريخ البدء', 'Start Date')}</label>
                             <input type="date" value={template.config.membershipStartDate || ''} onChange={e => updateConfig('membershipStartDate', e.target.value)} className={inputClasses} />
                          </div>
                          <div className="space-y-2">
                             <label className={labelTextClasses}>{t('تاريخ الانتهاء', 'Expiry Date')}</label>
                             <input type="date" value={template.config.membershipExpiryDate || ''} onChange={e => updateConfig('membershipExpiryDate', e.target.value)} className={inputClasses} />
                          </div>
                       </div>

                       <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                          <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">{isRtl ? 'ألوان قسم العضوية والاشتراك' : 'Membership Section Colors'}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <ColorPicker label={t('لون الخلفية (المربع)', 'Box Background')} value={template.config.membershipBgColor} onChange={(v: string) => updateConfig('membershipBgColor', v)} />
                             <ColorPicker label={t('لون الإطار (الفريم)', 'Border/Frame Color')} value={template.config.membershipBorderColor} onChange={(v: string) => updateConfig('membershipBorderColor', v)} />
                             <ColorPicker label={t('لون النصوص', 'Text Color')} value={template.config.membershipTextColor} onChange={(v: string) => updateConfig('membershipTextColor', v)} />
                             <ColorPicker label={t('اللون المميز (ACCENT)', 'Accent Color')} value={template.config.membershipAccentColor} onChange={(v: string) => updateConfig('membershipAccentColor', v)} />
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 mt-4 italic px-2">
                             {isRtl ? "* اللون المميز يتحكم في الأيقونة وشريط الإنجاز ونص الأيام المتبقية." : "* Accent color controls icon, progress bar, and remaining days text."}
                          </p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t dark:border-gray-800 items-center">
                          <ToggleSwitch label={t('نمط زجاجي', 'Glassy Style')} value={template.config.membershipGlassy} onChange={(v: boolean) => updateConfig('membershipGlassy', v)} icon={GlassWater} color="bg-indigo-600" />
                          <div className="bg-white dark:bg-[#121215] p-5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm space-y-3">
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                   <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Move size={14} /></div>
                                   <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('الإزاحة الرأسية')}</span>
                                </div>
                                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{template.config.membershipOffsetY || 0}px</span>
                             </div>
                             <input type="range" min={-100} max={150} value={template.config.membershipOffsetY || 0} onChange={(e) => updateConfig('membershipOffsetY', parseInt(e.target.value))} className="w-full h-1 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                          </div>
                       </div>

                       <div className="pt-4 flex justify-end">
                          <ToggleSwitch label={t('إظهار قسم العضوية', 'Show Section')} value={template.config.showMembershipByDefault} onChange={(v: boolean) => updateConfig('showMembershipByDefault', v)} icon={Eye} color="bg-emerald-600" />
                       </div>
                    </div>
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
                          <ImageIconLucide className="text-blue-600" size={20} />
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t dark:border-gray-800 pt-4">
                       <RangeControl 
                          label={t('إزاحة (أعلى/أسفل)', 'Vertical Offset')} 
                          min={-200} max={200} 
                          value={template.config.avatarOffsetY || 0} 
                          onChange={(v: number) => updateConfig('avatarOffsetY', v)} 
                          icon={ArrowUpDown} 
                       />
                       <RangeControl 
                          label={t('إزاحة (يمين/يسار)', 'Horizontal Offset')} 
                          min={-150} max={150} 
                          value={template.config.avatarOffsetX || 0} 
                          onChange={(v: number) => updateConfig('avatarOffsetX', v)} 
                          icon={ArrowLeftRight} 
                       />
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
                             <ColorPicker label={t('لون حركة 1', 'Motion Color 1')} value={template.config.avatarAnimatedBorderColor1} onChange={(v: string) => updateConfig('avatarAnimatedBorderColor1', v)} />
                             <ColorPicker label={t('لون حركة 2', 'Motion Color 2')} value={template.config.avatarAnimatedBorderColor2} onChange={(v: string) => updateConfig('avatarAnimatedBorderColor2', v)} />
                             <RangeControl label={t('سرعة الدوران', 'Rotation Speed')} min={1} max={10} value={template.config.avatarAnimatedBorderSpeed || 3} onChange={(v: number) => updateConfig('avatarAnimatedBorderSpeed', v)} icon={RefreshCcw} unit="s" hint={t('كلما قل الرقم زادت السرعة', 'Lower is faster')} />
                             <ToggleSwitch label={t('تأثير التوهج (Glow)', 'Glow Effect')} value={template.config.avatarAnimatedGlow} onChange={(v: boolean) => updateConfig('avatarAnimatedGlow', v)} icon={Sun} color="bg-blue-600" />
                          </div>
                       )}
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
                           {type === 'color' ? <Palette size={20}/> : type === 'gradient' ? <Sparkles size={20}/> : <ImageIconLucide size={20}/>}
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
                  
                  <div className="pt-4 border-t dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-3"><Moon className="text-gray-400" size={18} /><span className="text-xs font-black dark:text-white uppercase tracking-widest">{t('الوضع ليلي افتراضياً', 'Default Dark Mode')}</span></div>
                      <button type="button" onClick={() => updateConfig('defaultIsDark', !template.config.defaultIsDark)} className={`w-14 h-7 rounded-full relative transition-all ${template.config.defaultIsDark ? 'bg-blue-600 shadow-lg' : 'bg-gray-200 dark:bg-gray-700'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isRtl ? (template.config.defaultIsDark ? 'right-8' : 'right-1') : (template.config.defaultIsDark ? 'left-8' : 'left-1')}`} /></button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'identity-lab' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                     <div className="flex items-center gap-3"><UserIcon className="text-blue-600" size={24} /><h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('بيانات الهوية والظهور', 'Identity Details & Visibility')}</h4></div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 dark:bg-gray-800/40 rounded-3xl border border-gray-100 dark:border-gray-800">
                        <div className="space-y-4">
                           <div>
                              <label className={labelTextClasses}>{t('الاسم الافتراضي', 'Default Name')}</label>
                              <input type="text" value={template.config.defaultName || ''} onChange={e => updateConfig('defaultName', e.target.value)} className={inputClasses} placeholder={t('أدخل الاسم', 'Enter Name')} />
                           </div>
                           <div>
                              <label className={labelTextClasses}>{t('المسمى الوظيفي الافتراضي', 'Default Title')}</label>
                              <input type="text" value={template.config.defaultTitle || ''} onChange={e => updateConfig('defaultTitle', e.target.value)} className={inputClasses} placeholder={t('أدخل المسمى', 'Enter Title')} />
                           </div>
                           <div>
                              <label className={labelTextClasses}>{t('اسم الشركة الافتراضي', 'Default Company')}</label>
                              <input type="text" value={template.config.defaultCompany || ''} onChange={e => updateConfig('defaultCompany', e.target.value)} className={inputClasses} placeholder={t('أدخل الشركة', 'Enter Company')} />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                           <ToggleSwitch label={t('إظهار الاسم', 'Show Name')} value={template.config.showNameByDefault} onChange={(v: boolean) => updateConfig('showNameByDefault', v)} icon={TypographyIcon} />
                           <ToggleSwitch label={t('المسمى الوظيفي', 'Show Title')} value={template.config.showTitleByDefault} onChange={(v: boolean) => updateConfig('showTitleByDefault', v)} icon={Briefcase} />
                           <ToggleSwitch label={t('اسم الشركة', 'Show Company')} value={template.config.showCompanyByDefault} onChange={(v: boolean) => updateConfig('showCompanyByDefault', v)} icon={Box} />
                        </div>
                     </div>

                     <div className="pt-8 border-t dark:border-gray-800 space-y-6">
                        <h4 className={labelTextClasses}>{t('ألوان خطوط الهوية', 'Identity Typography Colors')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <ColorPicker label={t('لون الاسم', 'Name Color')} value={template.config.nameColor || '#111827'} onChange={(v: string) => updateConfig('nameColor', v)} />
                           <ColorPicker label={t('لون المسمى الوظيفي', 'Job Title Color')} value={template.config.titleColor || '#2563eb'} onChange={(v: string) => updateConfig('titleColor', v)} />
                        </div>
                     </div>

                     <div className="pt-8 border-t dark:border-gray-800 space-y-8">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <TypographyIcon className="text-blue-600" size={24} />
                              <h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('محرك إزاحة العناصر والتباعد', 'Displacement & Spacing Engine')}</h4>
                           </div>
                           <button 
                             type="button"
                             onClick={resetOffsets}
                             className="flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-orange-100 dark:border-orange-800/30 hover:bg-orange-100 transition-all shadow-sm"
                           >
                             <RotateCcw size={14} />
                             {t('إعادة ضبط التموضع', 'Reset Offsets')}
                           </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <RangeControl label={t('حجم خط الاسم', 'Name Font Size')} min={16} max={56} value={template.config.nameSize} onChange={(v: number) => updateConfig('nameSize', v)} icon={TypographyIcon} />
                           <RangeControl label={t('إزاحة الاسم (رأسياً)', 'Name Y Offset')} min={-100} max={150} value={template.config.nameOffsetY} onChange={(v: number) => updateConfig('nameOffsetY', v)} icon={MousePointer2} />
                           <RangeControl label={t('إزاحة المسمى الوظيفي (رأسياً)', 'Title Y Offset')} min={-100} max={150} value={template.config.titleOffsetY || 0} onChange={(v: number) => updateConfig('titleOffsetY', v)} icon={MousePointer2} />
                           <RangeControl label={t('إزاحة منطقة الصورة (رأسياً)', 'Avatar Y Offset')} min={-150} max={200} value={template.config.avatarOffsetY} onChange={(v: number) => updateConfig('avatarOffsetY', v)} icon={Move} />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'bio-lab' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-10">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl shadow-sm"><Quote size={24} /></div>
                       <div>
                          <h2 className="text-2xl font-black dark:text-white uppercase leading-none mb-1">{t('bio')}</h2>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('تخصيص كامل لقسم النبذة التعريفية', 'Full customization for the Bio section')}</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <ToggleSwitch label={t('تفعيل عرض النبذة', 'Show Bio')} value={template.config.showBioByDefault} onChange={(v: boolean) => updateConfig('showBioByDefault', v)} icon={Eye} />
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t dark:border-gray-800 pt-6">
                          <div className="space-y-2">
                             <label className={labelTextClasses}>{t('النبذة الافتراضية (AR)', 'Default Bio (AR)')}</label>
                             <textarea 
                               value={template.config.defaultBioAr || ''} 
                               onChange={e => updateConfig('defaultBioAr', e.target.value)} 
                               className={`${inputClasses} min-h-[100px] resize-none text-xs`} 
                               placeholder="اكتب نبذة تظهر لمستخدمي هذا القالب..."
                             />
                          </div>
                          <div className="space-y-2">
                             <label className={labelTextClasses}>{t('النبذة الافتراضية (EN)', 'Default Bio (EN)')}</label>
                             <textarea 
                               value={template.config.defaultBioEn || ''} 
                               onChange={e => updateConfig('defaultBioEn', e.target.value)} 
                               className={`${inputClasses} min-h-[100px] resize-none text-xs`} 
                               placeholder="Write a bio that appears for this template users..."
                             />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <RangeControl label={t('حجم الخط', 'Font Size')} min={10} max={40} value={template.config.bioSize} onChange={(v: number) => updateConfig('bioSize', v)} icon={TypographyIcon} />
                          <RangeControl label={t('إزاحة القسم رأسياً', 'Y Offset')} min={-100} max={200} value={template.config.bioOffsetY} onChange={(v: number) => updateConfig('bioOffsetY', v)} icon={Move} />
                          <RangeControl label={t('العرض الأقصى (%)', 'Max Width')} min={50} max={100} value={template.config.bioMaxWidth ?? 90} onChange={(v: number) => updateConfig('bioMaxWidth', v)} icon={Maximize2} />
                          <RangeControl label={t('انحناء الحواف', 'Border Radius')} min={0} max={60} value={template.config.bioBorderRadius ?? 32} onChange={(v: number) => updateConfig('bioBorderRadius', v)} icon={Ruler} />
                       </div>

                       <div className="space-y-4">
                          <label className={labelTextClasses}>{t('محاذاة النص', 'Text Alignment')}</label>
                          <div className="grid grid-cols-3 gap-2">
                             {['start', 'center', 'end'].map(align => (
                                <button 
                                  key={align} 
                                  onClick={() => updateConfig('bioTextAlign', align)} 
                                  className={`py-3 rounded-xl border-2 transition-all flex items-center justify-center ${template.config.bioTextAlign === align ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
                                >
                                   {align === 'start' ? <AlignLeft size={18}/> : align === 'center' ? <AlignCenter size={18}/> : <AlignRight size={18}/>}
                                </button>
                             ))}
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in pt-6 border-t dark:border-gray-800">
                          <ToggleSwitch label={t('تأثير زجاجي (Glassy)', 'Glassy Effect')} value={template.config.bioGlassy} onChange={(v: boolean) => updateConfig('bioGlassy', v)} icon={GlassWater} color="bg-indigo-600" />
                          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
                             <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إظهار الإطار', 'Show Border')}</span>
                                <span className="text-[8px] font-bold text-gray-300">0 تعني إخفاء</span>
                             </div>
                             <input type="number" min={0} max={10} value={template.config.bioBorderWidth ?? 1} onChange={e => updateConfig('bioBorderWidth', parseInt(e.target.value) || 0)} className="w-16 bg-gray-50 dark:bg-gray-800 border-none rounded-lg p-2 text-center text-xs font-black dark:text-white outline-none" />
                          </div>
                          <ColorPicker label={t('لون خلفية النبذة', 'Bio Background')} value={template.config.bioBgColor} onChange={(v: string) => updateConfig('bioBgColor', v)} />
                          <ColorPicker label={t('لون نص النبذة', 'Bio Text Color')} value={template.config.bioTextColor} onChange={(v: string) => updateConfig('bioTextColor', v)} />
                          <ColorPicker label={t('لون البرواز (الحدود)', 'Border Color')} value={template.config.bioBorderColor} onChange={(v: string) => updateConfig('bioBorderColor', v)} />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'direct-links' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-10">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><LinkIcon size={24} /></div>
                       <h2 className="text-2xl font-black dark:text-white uppercase tracking-widest">{t('directLinksSection')}</h2>
                    </div>

                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ToggleSwitch label={t('إظهار البريد', 'Show Email')} value={template.config.showEmailByDefault} onChange={(v: boolean) => updateConfig('showEmailByDefault', v)} icon={Mail} />
                          <ToggleSwitch label={t('إظهار الموقع', 'Show Website')} value={template.config.showWebsiteByDefault} onChange={(v: boolean) => updateConfig('showWebsiteByDefault', v)} icon={ShoppingCart} />
                          <ToggleSwitch label={t('أزرار الحفظ', 'Show Save Buttons')} value={template.config.showButtonsByDefault} onChange={(v: boolean) => updateConfig('showButtonsByDefault', v)} icon={Save} />
                          <ToggleSwitch label={t('إظهار النص (رابط/بريد)', 'Show Link Text')} value={template.config.linksShowText} onChange={(v: boolean) => updateConfig('linksShowText', v)} icon={TypographyIcon} />
                       </div>

                       <div className="pt-8 border-t dark:border-gray-800 space-y-6">
                          <h4 className={labelTextClasses}>{t('ألوان قسم الروابط المباشرة', 'Direct Links Colors')}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             <ColorPicker label={t('لون الروابط العامة', 'Links Base Color')} value={template.config.linksColor || '#3b82f6'} onChange={(v: string) => updateConfig('linksColor', v)} />
                             <ColorPicker label={t('خلفية قسم الروابط', 'Section Background')} value={template.config.linksSectionBgColor} onChange={(v: string) => updateConfig('linksSectionBgColor', v)} />
                             <ColorPicker label={t('لون نص في الروابط', 'Links Text Color')} value={template.config.linksSectionTextColor} onChange={(v: string) => updateConfig('linksSectionTextColor', v)} />
                             <ColorPicker label={t('لون الأيقونة في الروابط', 'Links Icon Color')} value={template.config.linksSectionIconColor} onChange={(v: string) => updateConfig('linksSectionIconColor', v)} />
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t dark:border-gray-800">
                          <RangeControl label={t('انحناء حواف القسم', 'Section Radius')} min={0} max={60} value={template.config.linksSectionRadius ?? 24} onChange={(v: number) => updateConfig('linksSectionRadius', v)} icon={Ruler} />
                          <RangeControl label={t('انحناء حواف الروابط', 'Item Radius')} min={0} max={50} value={template.config.linksItemRadius ?? 16} onChange={(v: number) => updateConfig('linksItemRadius', v)} icon={Ruler} />
                          <RangeControl label={t('إزاحة القسم رأسياً', 'Vertical Offset')} min={-200} max={200} value={template.config.linksSectionOffsetY || 0} onChange={(v: number) => updateConfig('linksSectionOffsetY', v)} icon={Move} />
                          <RangeControl label={t('الارتفاع الداخلي للقسم', 'Vertical Padding')} min={0} max={100} value={template.config.linksSectionPaddingV ?? 24} onChange={(v: number) => updateConfig('linksSectionPaddingV', v)} icon={Maximize2} />
                       </div>

                       <div className="pt-6 space-y-4">
                          <label className={labelTextClasses}>{t('نمط العرض', 'Layout Style')}</label>
                          <div className="grid grid-cols-3 gap-2">
                             {['list', 'grid', 'pills'].map(v => (
                                <button key={v} onClick={() => updateConfig('linksSectionVariant', v)} className={`py-3 rounded-xl border-2 transition-all font-black text-[9px] uppercase ${template.config.linksSectionVariant === v ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                   {t(v, v.toUpperCase())}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'contact-lab' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-10">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl shadow-sm"><Phone size={24} /></div>
                       <div>
                          <h2 className="text-2xl font-black dark:text-white uppercase leading-none mb-1">{t('قسم أزرار الاتصال', 'Contact Buttons Section')}</h2>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('التحكم الكامل في أزرار الهاتف وواتساب', 'Full control over Phone and WhatsApp buttons')}</p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ToggleSwitch label={t('إظهار زر الهاتف', 'Show Phone')} value={template.config.showPhoneByDefault} onChange={(v: boolean) => updateConfig('showPhoneByDefault', v)} icon={Phone} />
                          <ToggleSwitch label={t('إظهار زر واتساب', 'Show WhatsApp')} value={template.config.showWhatsappByDefault} onChange={(v: boolean) => updateConfig('showWhatsappByDefault', v)} icon={MessageCircle} />
                       </div>

                       <div className="pt-8 border-t dark:border-gray-800 space-y-6">
                          <h4 className={labelTextClasses}>{t('ألوان أزرار الاتصال', 'Contact Buttons Colors')}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <ColorPicker label={t('لون زر الاتصال', 'Phone Button Color')} value={template.config.contactPhoneColor || '#2563eb'} onChange={(v: string) => updateConfig('contactPhoneColor', v)} />
                             <ColorPicker label={t('لون زر واتساب', 'WhatsApp Button Color')} value={template.config.contactWhatsappColor || '#10b981'} onChange={(v: string) => updateConfig('contactWhatsappColor', v)} />
                          </div>
                       </div>

                       <div className="pt-8 border-t dark:border-gray-800 space-y-8">
                          <div className="flex items-center gap-3">
                             <Settings2 className="text-indigo-600" size={24} />
                             <h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('محرك هندسة أزرار الاتصال', 'Contact Buttons Geometry')}</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <RangeControl label={t('إزاحة القسم رأسياً', 'Y Offset')} min={-100} max={200} value={template.config.contactButtonsOffsetY} onChange={(v: number) => updateConfig('contactButtonsOffsetY', v)} icon={Move} />
                             <RangeControl label={t('المسافة بين الزرين', 'Buttons Gap')} min={0} max={40} value={template.config.contactButtonsGap ?? 12} onChange={(v: number) => updateConfig('contactButtonsGap', v)} icon={SlidersHorizontal} />
                             <RangeControl label={t('انحناء الحواف', 'Border Radius')} min={0} max={60} value={template.config.contactButtonsRadius ?? 16} onChange={(v: number) => updateConfig('contactButtonsRadius', v)} icon={Ruler} />
                             <RangeControl label={t('ارتفاع الأزرار (تعبئة)', 'Buttons Height')} min={4} max={40} value={template.config.contactButtonsPaddingV ?? 16} onChange={(v: number) => updateConfig('contactButtonsPaddingV', v)} icon={Maximize2} />
                          </div>

                          <ToggleSwitch label={t('تأثير زجاجي (Glassy)', 'Glassy Style')} value={template.config.contactButtonsGlassy} onChange={(v: boolean) => updateConfig('contactButtonsGlassy', v)} icon={GlassWater} color="bg-indigo-600" />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'special-links' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-[#0a0a0c] p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-white/10 shadow-2xl space-y-12">
                    
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                         <ImagePlus size={30} />
                       </div>
                       <h2 className="text-3xl font-black dark:text-white uppercase leading-none">{t('specialLinks')}</h2>
                    </div>

                    <div className="space-y-8">
                       <ToggleSwitch 
                        label={t('تفعيل عرض الروابط', 'Enable Image Links')} 
                        value={template.config.showSpecialLinksByDefault} 
                        onChange={(v: boolean) => updateConfig('showSpecialLinksByDefault', v)} 
                        icon={Eye} 
                       />
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <RangeControl label={t('المسافة بين الصور', 'Link Spacing')} min={0} max={40} value={template.config.specialLinksGap || 12} onChange={(v: number) => updateConfig('specialLinksGap', v)} icon={SlidersHorizontal} />
                          <RangeControl label={t('عدد الأعمدة', 'Columns')} min={1} max={3} value={template.config.specialLinksCols || 2} onChange={(v: number) => updateConfig('specialLinksCols', v)} icon={Grid} />
                          <RangeControl label={t('إزاحة القسم رأسياً', 'Vertical Offset')} min={-100} max={150} value={template.config.specialLinksOffsetY || 0} onChange={(v: number) => updateConfig('specialLinksOffsetY', v)} icon={Move} />
                          <RangeControl label={t('انحناء الحواف', 'Border Radius')} min={0} max={60} value={template.config.specialLinksRadius ?? 24} onChange={(v: number) => updateConfig('specialLinksRadius', v)} icon={Ruler} />
                       </div>

                       <div className="space-y-4 pt-4 border-t dark:border-white/5">
                          <label className="text-[10px] font-black text-gray-400 uppercase text-center block w-full tracking-[0.2em]">{t('نسبة العرض للارتفاع', 'Aspect Ratio Selection')}</label>
                          <div className="grid grid-cols-3 gap-3">
                             {[
                               { id: 'square', label: 'مربع' },
                               { id: 'video', label: 'بانورامي' },
                               { id: 'portrait', label: 'طولي' }
                             ].map(ratio => (
                                <button 
                                  key={ratio.id} 
                                  onClick={() => updateConfig('specialLinksAspectRatio', ratio.id)} 
                                  className={`py-5 rounded-2xl border-2 transition-all font-black text-xs uppercase ${template.config.specialLinksAspectRatio === ratio.id ? 'bg-blue-600 text-white border-blue-600 shadow-xl scale-[1.02]' : 'bg-white dark:bg-[#121215] text-gray-400 border-gray-100 dark:border-white/5 hover:bg-gray-50'}`}
                                >
                                   {t(ratio.label, ratio.id.toUpperCase())}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="pt-12 border-t dark:border-white/10 space-y-8">
                       <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xl font-black dark:text-white leading-none mb-1">{t('إدارة العينات الافتراضية', 'Manage Template Samples')}</h4>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{t('حدد الصور والروابط التي ستظهر لمستخدمي هذا القالب', 'Set default content for this template')}</p>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => specialLinkInputRef.current?.click()}
                            className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase shadow-xl hover:scale-105 transition-all"
                          >
                             <Plus size={16} />
                             {t('إضافة صورة', 'Add Image')}
                          </button>
                          <input type="file" ref={specialLinkInputRef} className="hidden" onChange={handleSpecialLinkUpload} accept="image/*" />
                       </div>

                       <div className="grid grid-cols-1 gap-5">
                          {currentSpecialLinks.map((link) => (
                             <div key={link.id} className="flex flex-col md:flex-row gap-6 p-6 bg-gray-50 dark:bg-white/5 rounded-[2.5rem] border border-gray-100 dark:border-white/10 group">
                                <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-lg border-2 border-white dark:border-gray-800 relative">
                                   <img src={link.imageUrl} className="w-full h-full object-cover" alt="Sample" />
                                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <ImageIcon size={20} className="text-white" />
                                   </div>
                                </div>
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                   <div className="space-y-1">
                                      <label className="text-[8px] font-black text-blue-600 uppercase px-1">{t('رابط الوجهة', 'Link URL')}</label>
                                      <input 
                                        type="url" 
                                        value={link.linkUrl} 
                                        onChange={e => updateSpecialLink(link.id, 'linkUrl', e.target.value)} 
                                        placeholder="https://..." 
                                        className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                                      />
                                   </div>
                                   <div className="space-y-1">
                                      <label className={isRtl ? 'أدخل اسم العرض' : 'Display Title'}>{t('العنوان الافتراضى (AR)', 'Default Title (AR)')}</label>
                                      <input 
                                        type="text" 
                                        value={link.titleAr || ''} 
                                        onChange={e => updateSpecialLink(link.id, 'titleAr', e.target.value)} 
                                        className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
                                        placeholder={isRtl ? 'أدخل اسم العرض' : 'Display Title'}
                                      />
                                   </div>
                                </div>
                                <button onClick={() => removeSpecialLink(link.id)} className="p-4 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all self-center"><Trash2 size={22} /></button>
                             </div>
                          ))}
                          {currentSpecialLinks.length === 0 && (
                            <div className="py-12 text-center border-2 border-dashed border-gray-200 dark:border-white/5 rounded-[2.5rem]">
                               <ImageIcon size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                               <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{isRtl ? 'لا توجد عينات مضافة للقالب' : 'No samples added to template'}</p>
                            </div>
                          )}
                       </div>
                    </div>
                  </div>
               </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-10">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><Navigation2 size={24} /></div>
                       <h2 className="text-2xl font-black dark:text-white uppercase tracking-widest">{t('locationSection')}</h2>
                    </div>

                    <div className="space-y-6">
                       <ToggleSwitch label={t('تفعيل عرض الموقع', 'Show Location Section')} value={template.config.showLocationByDefault} onChange={(v: boolean) => updateConfig('showLocationByDefault', v)} icon={Eye} />
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <RangeControl label={t('انحناء حواف الصندوق', 'Border Radius')} min={0} max={60} value={template.config.locationBorderRadius ?? 24} onChange={(v: number) => updateConfig('locationBorderRadius', v)} icon={Ruler} />
                          <RangeControl label={t('إزاحة القسم رأسياً', 'Vertical Offset')} min={-100} max={150} value={template.config.locationOffsetY || 0} onChange={(v: number) => updateConfig('locationOffsetY', v)} icon={Move} />
                          <RangeControl label={t('تضييق الارتفاع (المساحة الداخلية)', 'Vertical Padding')} min={4} max={60} value={template.config.locationPaddingV ?? 20} onChange={(v: number) => updateConfig('locationPaddingV', v)} icon={Maximize2} />
                          <RangeControl label={t('حجم خط العنوان التفصيلي', 'Address Font Size')} min={8} max={20} value={template.config.locationAddressSize ?? 13} onChange={(v: number) => updateConfig('locationAddressSize', v)} icon={TypographyIcon} />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in pt-4 border-t dark:border-gray-800">
                          <ToggleSwitch label={t('نمط زجاجي', 'Glassy Style')} value={template.config.locationGlassy} onChange={(v: boolean) => updateConfig('locationGlassy', v)} icon={GlassWater} color="bg-blue-500" />
                          <ColorPicker label={t('لون خلفية', 'Background Color')} value={template.config.locationBgColor} onChange={(v: string) => updateConfig('locationBgColor', v)} />
                          <ColorPicker label={t('لون الأيقونة', 'Icon Color')} value={template.config.locationIconColor} onChange={(v: string) => updateConfig('locationIconColor', v)} />
                          <ColorPicker label={t('لون النص', 'Text Color')} value={template.config.locationTextColor} onChange={(v: string) => updateConfig('locationTextColor', v)} />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'social-lab' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-10">
                    <div className="flex items-center gap-4"><div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl shadow-sm"><Share2 size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('مختبر أيقونات التواصل', 'Social Icons Lab')}</h2></div>
                    
                    <div className="space-y-6">
                       <ToggleSwitch 
                        label={t('تفعيل عرض قسم التواصل', 'Show Social Section')} 
                        value={template.config.showSocialLinksByDefault} 
                        onChange={(v: boolean) => updateConfig('showSocialLinksByDefault', v)} 
                        icon={Eye} 
                        color="bg-indigo-600" 
                       />

                       <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pt-4 border-t dark:border-gray-800">{t('شكل وحجم الأيقونة', 'Shape & Size DNA')}</h4>
                       
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
                       <h4 className={labelTextClasses}>{t('نمط العرض والألوان', 'Visual Style & Colors')}</h4>
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
                            <ColorPicker label={t('أيقونات التواصل', 'Social Icons Global Color')} value={template.config.socialIconsColor || '#3b82f6'} onChange={(v: string) => updateConfig('socialIconsColor', v)} />
                            <ColorPicker label={t('لون حدود الأيقونة', 'Icon Border')} value={template.config.socialIconBorderColor} onChange={(v: string) => updateConfig('socialIconBorderColor', v)} />
                            <RangeControl label={t('سمك الحدود', 'Border Width')} min={0} max={5} value={template.config.socialIconBorderWidth || 1} onChange={(v: number) => updateConfig('socialIconBorderWidth', v)} icon={Ruler} />
                        </div>
                       )}
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
                             <h4 className="text-xs font-black dark:text-white">{isRtl ? 'تحكم في الميزات خاصة للبطاقة' : 'Control Card Special Features'}</h4>
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
                                      <label className={labelTextClasses}>{t('نص الميزة (AR)', 'Feature Text (AR)')}</label>
                                      <input type="text" value={template.config.bodyFeatureTextAr || ''} onChange={e => updateConfig('bodyFeatureTextAr', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border text-xs font-bold dark:text-white" />
                                   </div>
                                   <div className="space-y-2">
                                      <label className={labelTextClasses}>{t('نص الميزة (EN)', 'Feature Text (EN)')}</label>
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
                                   <ColorPicker label={t('لون نص', 'Text Color')} value={template.config.bodyFeatureTextColor} onChange={(v: string) => updateConfig('bodyFeatureTextColor', v)} />
                                   <ToggleSwitch label={t('نمط زجاجي', 'Glassy')} value={template.config.bodyFeatureGlassy} onChange={(v: boolean) => updateConfig('bodyFeatureGlassy', v)} icon={GlassWater} color="bg-indigo-600" />
                                </div>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'desktop-lab' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-10">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl shadow-sm"><Monitor size={24} /></div>
                       <div>
                          <h2 className="text-2xl font-black dark:text-white uppercase leading-none mb-1">{isRtl ? 'إعدادات العرض والخلفيات' : 'Display & Background Settings'}</h2>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isRtl ? 'تحكم في شكل الصفحة بعد النشر' : 'Control page appearance after publishing'}</p>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 space-y-6">
                          <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-1 flex items-center gap-2">
                             <MonitorDot size={14} /> {isRtl ? 'نمط العرض على سطح المكتب' : 'Desktop Display Strategy'}
                          </label>
                          <div className="grid grid-cols-2 gap-4">
                             <button 
                                onClick={() => updateConfig('desktopLayout', 'full-width-header')}
                                className={`py-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${template.config.desktopLayout === 'full-width-header' ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400'}`}
                             >
                                <Layout size={24} />
                                <span className="text-[10px] font-black uppercase">{isRtl ? 'ترويسة ممتدة' : 'Full Width Header'}</span>
                             </button>
                             <button 
                                onClick={() => updateConfig('desktopLayout', 'centered-card')}
                                className={`py-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${template.config.desktopLayout !== 'full-width-header' ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400'}`}
                             >
                                <Square size={24} />
                                <span className="text-[10px] font-black uppercase">{isRtl ? 'بطاقة في الوسط' : 'Boxed Card'}</span>
                             </button>
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 px-2 italic">
                             {isRtl ? "* هذا الخيار يحدد ما إذا كانت صورة الترويسة ستغطي عرض الشاشة بالكامل أم ستبقى داخل إطار البطاقة على أجهزة الكمبيوتر." : "* This determines if the header covers full screen width or stays inside the card box on desktop."}
                          </p>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <RangeControl 
                             label={isRtl ? 'سحب البطاقة للأعلى (سطح المكتب)' : 'Desktop Global Pull-up'} 
                             min={-500} max={200} 
                             value={template.config.desktopBodyOffsetY ?? -60} 
                             onChange={(v: number) => updateConfig('desktopBodyOffsetY', v)} 
                             icon={Move} 
                             hint={isRtl ? "سحب البطاقة كاملة للأعلى ليتداخل جسمها مع الترويسة الخارجية" : "Pull the whole card up to overlap external header"}
                          />
                          <RangeControl 
                             label={isRtl ? 'إزاحة جسم البطاقة (الجوال/الداخلي)' : 'Mobile/Internal Body Offset'} 
                             min={-200} max={200} 
                             value={template.config.mobileBodyOffsetY ?? 0} 
                             onChange={(v: number) => updateConfig('mobileBodyOffsetY', v)} 
                             icon={Smartphone} 
                             hint={isRtl ? "إزاحة محتوى البطاقة فوق ترويستها الداخلية في الجوال" : "Offset internal body over card's header on mobile"}
                          />
                       </div>

                       <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Pipette size={14}/> {isRtl ? 'خلفيات الصفحة والأرضية' : 'Page & Card Base Backgrounds'}</h4>
                          
                          <div className="bg-indigo-50 dark:bg-indigo-900/10 p-5 rounded-3xl border border-indigo-100 dark:border-indigo-900/20 space-y-4">
                             <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-1 flex items-center gap-2">
                                <Repeat size={14} /> {t('استراتيجية خلفية الموقع', 'Page Background Strategy')}
                             </label>
                             <div className="grid grid-cols-2 gap-3">
                                <button 
                                   type="button"
                                   onClick={() => updateConfig('pageBgStrategy', 'solid')}
                                   className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.pageBgStrategy !== 'mirror-header' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-400'}`}
                                >
                                   <Pipette size={18} />
                                   <span className="text-[9px] font-black uppercase">{t('لون ثابت', 'Solid')}</span>
                                </button>
                                <button 
                                   type="button"
                                   onClick={() => updateConfig('pageBgStrategy', 'mirror-header')}
                                   className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.pageBgStrategy === 'mirror-header' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-gray-800 text-gray-400'}`}
                                >
                                   <Layers size={18} />
                                   <span className="text-[9px] font-black uppercase">{isRtl ? 'مطابقة ألوان الترويسة' : 'Mirror Header Colors'}</span>
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
                                  label={t('لون خلفية الصفحة', 'Page Bg Color')} 
                                  value={template.config.pageBgColor || ''} 
                                  onChange={(v: string) => updateConfig('pageBgColor', v)} 
                                />
                              )}
                          </div>

                          <RangeControl 
                             label={isRtl ? 'أقصى عرض للبطاقة (سطح المكتب)' : 'Card Max Width (Desktop)'} 
                             min={300} max={1200} 
                             value={template.config.cardMaxWidth ?? 500} 
                             onChange={(v: number) => updateConfig('cardMaxWidth', v)} 
                             icon={ArrowLeftRight} 
                          />
                       </div>
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
              
              <div className={`transition-all duration-500 origin-top rounded-[3.5rem] shadow-2xl overflow-hidden relative border-[12px] border-gray-900 dark:border-gray-800 ${previewDevice === 'mobile' ? 'w-[360px]' : previewDevice === 'tablet' ? 'w-[480px]' : 'w-full'}`} 
                   style={{ 
                     isolation: 'isolate', 
                     transform: previewDevice === 'desktop' ? 'scale(0.48)' : 'none',
                     width: previewDevice === 'desktop' ? '850px' : undefined,
                     height: previewDevice === 'desktop' ? '1200px' : undefined,
                     minHeight: previewDevice === 'desktop' ? '1200px' : undefined,
                     backgroundColor: previewPageBg
                   }}>
                <div className="themed-scrollbar overflow-x-hidden h-full scroll-smooth relative z-0" style={{ borderRadius: '2.6rem' }}>
                   {isFullHeaderPreview && (
                      <div className="w-full overflow-hidden relative shrink-0" style={{ height: `${template.config.headerHeight}px` }}>
                        <div className="absolute inset-0 z-0">
                          {template.config.defaultThemeType === 'image' && template.config.defaultBackgroundImage && (
                            <img src={template.config.defaultThemeType === 'image' ? template.config.defaultBackgroundImage : undefined} className="w-full h-full object-cover" alt="Full Header" />
                          )}
                          {template.config.defaultThemeType === 'gradient' && (
                            <div className="w-full h-full" style={{ background: template.config.defaultThemeGradient }} />
                          )}
                          {template.config.defaultThemeType === 'color' && (
                            <div className="w-full h-full" style={{ backgroundColor: template.config.defaultThemeColor }} />
                          )}
                          {template.config.headerPatternId && template.config.headerPatternId !== 'none' && (
                            <div className="absolute inset-0 pointer-events-none opacity-[0.2]" 
                                style={{ 
                                  backgroundImage: `url("data:image/svg+xml;base64,${window.btoa((PATTERN_PRESETS.find(p => p.id === template.config.headerPatternId)?.svg || '').replace('currentColor', template.config.defaultIsDark ? '#ffffff' : '#000000'))}")`,
                                  backgroundSize: `${template.config.headerPatternScale || 100}%`,
                                  opacity: (template.config.headerPatternOpacity || 20) / 100
                                }} />
                          )}
                        </div>
                        {template.config.headerGlassy && (
                          <div className="absolute inset-0 backdrop-blur-md" style={{ backgroundColor: template.config.defaultIsDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)' }} />
                        )}
                      </div>
                   )}
                   
                   <div 
                     style={{ 
                        transform: previewDevice === 'desktop' ? `translateY(${previewDesktopPullUp}px)` : 'none',
                        maxWidth: isFullHeaderPreview ? `${template.config.cardMaxWidth || 500}px` : '100%',
                        marginRight: 'auto',
                        marginLeft: 'auto',
                        position: 'relative',
                        zIndex: 10,
                        transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                     }}
                   >
                     <CardPreview 
                       data={{ 
                         ...sampleCardData, 
                         name: template.config.defaultName || sampleCardData.name,
                         title: template.config.defaultTitle || sampleCardData.title,
                         company: template.config.defaultCompany || sampleCardData.company,
                         bio: (isRtl ? template.config.defaultBioAr : template.config.defaultBioEn) || sampleCardData.bio,
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
                         backgroundImage: template.config.defaultBackgroundImage,
                         specialLinks: currentSpecialLinks,
                         showSpecialLinks: template.config.showSpecialLinksByDefault,
                         showSocialLinks: template.config.showSocialLinksByDefault,
                         showMembership: template.config.showMembershipByDefault,
                         membershipTitleAr: template.config.membershipTitleAr,
                         membershipTitleEn: template.config.membershipTitleEn,
                         membershipStartDate: template.config.membershipStartDate,
                         membershipExpiryDate: template.config.membershipExpiryDate,
                         membershipGlassy: template.config.membershipGlassy,
                         membershipOffsetY: template.config.membershipOffsetY,
                         membershipBgColor: template.config.membershipBgColor,
                         membershipBorderColor: template.config.membershipBorderColor,
                         membershipTextColor: template.config.membershipTextColor,
                         membershipAccentColor: template.config.membershipAccentColor,
                         showLocation: template.config.showLocationByDefault,
                         location: isRtl ? 'عنوان الموقع الجغرافي الافتراضي' : 'Default Location Address',
                         locationUrl: 'https://maps.google.com',
                         linksShowText: template.config.linksShowText,
                         linksShowBg: template.config.linksShowBg,
                         emails: defaultEmails.length > 0 ? defaultEmails : sampleCardData.emails,
                         websites: defaultWebsites.length > 0 ? defaultWebsites : sampleCardData.websites,
                         bioBorderRadius: template.config.bioBorderRadius,
                         bioBorderWidth: template.config.bioBorderWidth,
                         bioBorderColor: template.config.bioBorderColor,
                         bioPaddingV: template.config.bioPaddingV,
                         bioPaddingH: template.config.bioPaddingH,
                         bioGlassy: template.config.bioGlassy,
                         bioOpacity: template.config.bioOpacity,
                         bioMaxWidth: template.config.bioMaxWidth,
                         bioTextAlign: template.config.bioTextAlign,
                         cardBodyColor: template.config.cardBodyColor,
                         cardBgColor: template.config.cardBgColor,
                         linksSectionPaddingV: template.config.linksSectionPaddingV
                       } as any} 
                       lang={lang} 
                       customConfig={template.config} 
                       hideSaveButton={true} 
                       isFullFrame={true}
                       hideHeader={isFullHeaderPreview}
                       bodyOffsetYOverride={previewBodyOffsetY}
                     />
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-w-5xl rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col lg:flex-row h-[90vh] lg:h-auto animate-zoom-in">
              
              {/* القسم الأيسر: البحث عن عضو مخصص */}
              <div className="w-full lg:w-[400px] bg-indigo-50/30 dark:bg-black/20 p-8 border-b lg:border-b-0 lg:border-l dark:border-gray-800 flex flex-col space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg"><UserCheck size={20} /></div>
                    <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? 'تخصيص القالب لعضو محدد' : 'Restrict to Member'}</h3>
                 </div>

                 <div className="relative">
                    <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                    <input 
                      type="text" 
                      value={userQuery} 
                      onChange={e => setUserQuery(e.target.value)} 
                      placeholder={isRtl ? "ابحث عن العضو بالبريد الإلكتروني..." : "Search member by email..."}
                      className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-xs font-black dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 transition-all`}
                    />
                 </div>

                 <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar max-h-[300px]">
                    {isSearchingUsers && <div className="flex justify-center py-4"><Loader2 className="animate-spin text-indigo-600" /></div>}
                    
                    {userSearchResults.map(user => (
                       <button 
                         key={user.uid} 
                         onClick={() => { setSelectedUser(user); updateTemplate('restrictedUserId', user.uid); }}
                         className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedUser?.uid === user.uid ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-indigo-200'}`}
                       >
                          <div className="flex items-center gap-3 min-w-0">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedUser?.uid === user.uid ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-900'}`}>
                                <UserIcon size={14} />
                             </div>
                             <span className="text-[11px] font-black truncate">{user.email}</span>
                          </div>
                          {selectedUser?.uid === user.uid ? <Check size={16} /> : <div className="w-5 h-5 rounded-full border-2 border-gray-100 dark:border-gray-700 group-hover:border-indigo-300"></div>}
                       </button>
                    ))}

                    {userQuery.length >= 3 && userSearchResults.length === 0 && !isSearchingUsers && (
                       <div className="text-center py-10 opacity-30">
                          <AlertTriangle size={32} className="mx-auto mb-2" />
                          <p className="text-[10px] font-black uppercase">{isRtl ? 'لا يوجد نتائج' : 'No users found'}</p>
                       </div>
                    )}
                 </div>

                 {selectedUser && (
                    <button 
                       onClick={() => { setSelectedUser(null); updateTemplate('restrictedUserId', ''); }}
                       className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-black text-[10px] uppercase hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                       <X size={14} /> {isRtl ? 'إلغاء التخصيص' : 'Clear Restriction'}
                    </button>
                 )}

                 <p className="text-[9px] font-bold text-gray-400 leading-relaxed italic border-t dark:border-gray-800 pt-4">
                    {isRtl ? "* في حال اختيار عضو، لن يظهر هذا التصميم إلا له في صفحة (التصاميم الخاصة) ولن يظهر في المعرض العام." : "* If a member is selected, this design will only appear for them in the (Private Designs) page and won't show in the public gallery."}
                 </p>
              </div>

              {/* القسم الأيمن: بيانات القالب الأساسية */}
              <div className="flex-1 p-8 md:p-12 flex flex-col space-y-8 justify-center">
                 <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? 'حفظ التصميم ونشره' : 'Publish Template'}</h3>
                    <button type="button" onClick={() => setShowSaveModal(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className={labelTextClasses}>{t('الاسم (AR)', 'Name (AR)')}</label>
                          <input type="text" value={template.nameAr} onChange={e => updateTemplate('nameAr', e.target.value)} className={inputClasses} />
                       </div>
                       <div className="space-y-2">
                          <label className={labelTextClasses}>{t('الاسم (EN)', 'Name (EN)')}</label>
                          <input type="text" value={template.nameEn} onChange={e => updateTemplate('nameEn', e.target.value)} className={inputClasses} />
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className={labelTextClasses}>{t('القسم (CATEGORY)', 'Template Category')}</label>
                          <select 
                             value={template.categoryId} 
                             onChange={e => updateTemplate('categoryId', e.target.value)} 
                             className={`${inputClasses} appearance-none cursor-pointer`}
                          >
                             <option value="">{t('اختر القسم...', 'Select Category...')}</option>
                             {categories.map(cat => <option key={cat.id} value={cat.id}>{isRtl ? cat.nameAr : cat.nameEn}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className={labelTextClasses}>{t('ترتيب العرض', 'Display Order')}</label>
                          <input type="number" value={template.order} onChange={e => updateTemplate('order', parseInt(e.target.value) || 0)} className={inputClasses} />
                       </div>
                    </div>

                    <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-[2rem] border border-amber-100 dark:border-amber-800/30 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${template.isFeatured ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                             <Star size={20} fill={template.isFeatured ? "currentColor" : "none"} />
                          </div>
                          <div>
                             <span className="text-xs font-black uppercase tracking-widest dark:text-white block">{t('تمييز القالب (تثبيت في المقدمة)', 'Feature Template (Stay on top)')}</span>
                             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{isRtl ? 'سيظهر القالب في بداية المعرض دائماً' : 'Template will always show at the gallery start'}</p>
                          </div>
                       </div>
                       <button type="button" onClick={() => updateTemplate('isFeatured', !template.isFeatured)} className={`w-14 h-7 rounded-full relative transition-all ${template.isFeatured ? 'bg-amber-500 shadow-md' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isRtl ? (template.isFeatured ? 'right-8' : 'right-1') : (template.isFeatured ? 'left-8' : 'left-1')}`} />
                       </button>
                    </div>
                 </div>

                 <button type="button" onClick={() => onSave(template)} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase shadow-2xl hover:scale-[1.01] active:scale-95 transition-all">{isRtl ? 'تأكيد الحفظ والنشر' : 'Confirm & Publish'}</button>
              </div>
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
