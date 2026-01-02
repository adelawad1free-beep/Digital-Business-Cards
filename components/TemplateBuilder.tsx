import React, { useState, useRef, useEffect } from 'react';
import { CustomTemplate, TemplateConfig, Language, CardData, TemplateCategory, VisualStyle, ThemeType } from '../types';
import { TRANSLATIONS, SAMPLE_DATA, THEME_COLORS, THEME_GRADIENTS, BACKGROUND_PRESETS, PATTERN_PRESETS, SVG_PRESETS } from '../constants';
import { uploadImageToCloud } from '../services/uploadService';
import { getAllCategories, saveTemplateCategory, getAllVisualStyles } from '../services/firebase';
import CardPreview from './CardPreview';
import { 
  Save, Layout, Smartphone, Layers, Move, Check, X, 
  Zap, AlignCenter, Circle, Box, Loader2, Type as TypographyIcon, 
  Ruler, Star, Hash, ArrowLeft, Palette, Sparkles, ImageIcon, 
  UploadCloud, Sun, Moon, Pipette, Settings, FileText, AlignLeft, 
  AlignRight, LayoutTemplate, Info, Maximize2, UserCircle, Mail, 
  Phone, Globe, MessageCircle, Camera, Download, Tablet, Monitor, 
  Eye, QrCode, Wind, GlassWater, ChevronRight, ChevronLeft, 
  Waves, Square, Columns, Minus, ToggleLeft, ToggleRight, Calendar, MapPin, Timer, PartyPopper, Link as LinkIcon, FolderOpen, Plus, Tag, Settings2, SlidersHorizontal, Share2, FileCode, HardDrive, Database,
  CheckCircle2, Grid, RefreshCcw, Shapes, Code2, MousePointer2, AlignJustify, EyeOff, Briefcase, Wand2
} from 'lucide-react';

interface TemplateBuilderProps {
  lang: Language;
  onSave: (template: CustomTemplate) => void;
  onCancel?: () => void;
  initialTemplate?: CustomTemplate;
}

type BuilderTab = 'header' | 'avatar' | 'design-system' | 'body-style' | 'elements' | 'visuals' | 'occasion' | 'qrcode';

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ lang, onSave, onCancel, initialTemplate }) => {
  const isRtl = lang === 'ar';
  const headerAssetInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  
  const ADMIN_PRESET_COLORS = ['#2563eb', '#1e40af', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#f43f5e', '#db2777', '#d946ef', '#a855f7', '#7c3aed', '#6366f1', '#4b5563', '#0f172a'];

  const t = (key: string, enVal?: string) => {
    if (enVal) return isRtl ? key : enVal;
    return TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;
  };
  
  const [activeTab, setActiveTab] = useState<BuilderTab>('header');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [loading, setLoading] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [visualStyles, setVisualStyles] = useState<VisualStyle[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>(initialTemplate?.parentStyleId || '');
  const [showSaveModal, setShowSaveModal] = useState(false);
  
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
      headerPatternId: 'none',
      headerPatternOpacity: 20,
      headerPatternScale: 100
    }
  });

  useEffect(() => {
    getAllCategories().then(setCategories);
    getAllVisualStyles().then(setVisualStyles);
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

  const applyVisualStyle = (style: VisualStyle) => {
    setSelectedStyleId(style.id);
    setTemplate(prev => ({
      ...prev,
      parentStyleId: style.id,
      config: { ...prev.config, ...style.config }
    }));
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBg(true);
    try {
      const b = await uploadImageToCloud(file);
      if (b) {
        updateConfig('defaultBackgroundImage', b);
        updateConfig('defaultThemeType', 'image');
      }
    } finally {
      setUploadingBg(false);
    }
  };

  const sampleCardData = (SAMPLE_DATA[lang] || SAMPLE_DATA['en']) as CardData;

  const RangeControl = ({ label, value, min, max, onChange, unit = "px", icon: Icon }: any) => (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 transition-all hover:border-blue-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           {Icon && <Icon size={14} className="text-blue-500" />}
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
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
      <button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full relative transition-all ${value ? color + ' shadow-lg' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (value ? 'right-7' : 'right-1') : (value ? 'left-7' : 'left-1')}`} />
      </button>
    </div>
  );

  const ColorPicker = ({ label, value, onChange }: any) => (
    <div className={`flex items-center justify-between p-5 bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm`}>
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-3">
         <div className="relative w-9 h-9 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
            <input type="color" value={value?.startsWith('rgba') || !value?.startsWith('#') ? '#3b82f6' : value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
            <div className="w-full h-full" style={{ backgroundColor: value }} />
         </div>
         <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-3 py-2 text-[10px] font-black text-blue-600 w-24 uppercase text-center outline-none" />
      </div>
    </div>
  );

  const NavItem = ({ id, label, icon: Icon }: { id: BuilderTab, label: string, icon: any }) => (
    <button onClick={() => setActiveTab(id)} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${activeTab === id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
      <div className={`p-2 rounded-xl ${activeTab === id ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700'} transition-colors`}><Icon size={18} /></div>
      <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{label}</span>
    </button>
  );

  return (
    <div className="bg-white dark:bg-[#0a0a0c] rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[calc(100vh-100px)] min-h-[850px] relative">
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
          <button onClick={() => setShowSaveModal(true)} disabled={loading} className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">{t('حفظ القالب', 'Save Template')}</button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-l dark:border-gray-800 p-6 flex flex-col gap-1 overflow-y-auto no-scrollbar shrink-0 bg-gray-50/30 dark:bg-transparent">
          <NavItem id="header" label={t('الترويسة والأنماط', 'Header & Patterns')} icon={Layout} />
          <NavItem id="avatar" label={t('الصورة الشخصية', 'Avatar Style')} icon={Circle} />
          <NavItem id="design-system" label={t('هيكلة النصوص والتصميم', 'Structure & Typography')} icon={Settings2} />
          <NavItem id="body-style" label={t('جسم البطاقة', 'Card Body Style')} icon={Box} />
          <NavItem id="elements" label={t('ألوان العناصر', 'Element Colors')} icon={Palette} />
          <NavItem id="visuals" label={t('الألوان والسمة', 'Colors & Theme')} icon={Palette} />
          <NavItem id="occasion" label={t('المناسبة الخاصة', 'Special Occasion')} icon={PartyPopper} />
          <NavItem id="qrcode" label={t('رمز الـ QR', 'QR Code Style')} icon={QrCode} />
        </div>

        <div className="flex-1 p-8 overflow-y-auto no-scrollbar bg-gray-50/20 dark:bg-transparent">
          <div className="max-w-3xl mx-auto space-y-10 animate-fade-in pb-32">
            
            {activeTab === 'header' && (
              <div className="space-y-8 animate-fade-in">
                 {/* Header Tab Content... */}
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
                           {id: 'split-left', icon: AlignLeft, label: 'منقسم يسار'},
                           {id: 'split-right', icon: AlignRight, label: 'منقسم يمين'},
                           {id: 'floating', icon: Square, label: 'عائم'},
                           {id: 'glass-card', icon: GlassWater, label: 'زجاجي'},
                           {id: 'modern-split', icon: Columns, label: 'حديث'},
                           {id: 'hero', icon: Monitor, label: 'بانورامي'},
                           {id: 'top-bar', icon: Minus, label: 'شريط علوي'},
                           {id: 'minimal', icon: Minus, label: 'بسيط'},
                           {id: 'custom-asset', icon: FileCode, label: 'ملف خاص'}
                         ].map(item => (
                           <button key={item.id} onClick={() => updateConfig('headerType', item.id)} className={`py-4 px-1 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.headerType === item.id ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <RangeControl label={t('حجم الصورة', 'Size')} min={60} max={250} value={template.config.avatarSize} onChange={(v: number) => updateConfig('avatarSize', v)} icon={Maximize2} />
                       <RangeControl label={t('سمك الإطار', 'Border Width')} min={0} max={20} value={template.config.avatarBorderWidth ?? 4} onChange={(v: number) => updateConfig('avatarBorderWidth', v)} icon={Ruler} />
                    </div>
                    <ColorPicker label={t('لون الإطار', 'Border Color')} value={template.config.avatarBorderColor || '#ffffff'} onChange={(v: string) => updateConfig('avatarBorderColor', v)} />
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
                     <div className="flex items-center gap-3"><TypographyIcon className="text-blue-600" size={24} /><h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('هيكلة النصوص والأبعاد', 'Text Structure & Typography')}</h4></div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RangeControl label={t('حجم خط الاسم', 'Name Font Size')} min={16} max={56} value={template.config.nameSize} onChange={(v: number) => updateConfig('nameSize', v)} icon={TypographyIcon} />
                        <RangeControl label={t('حجم خط النبذة', 'Bio Font Size')} min={10} max={28} value={template.config.bioSize} onChange={(v: number) => updateConfig('bioSize', v)} icon={FileText} />
                     </div>
                     <div className="pt-6 border-t dark:border-gray-800 space-y-6">
                        <label className="text-[10px] font-black text-gray-400 uppercase block tracking-widest">{t('محرك إزاحة العناصر (Vertical Offsets)', 'Precision Displacement Engine')}</label>
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
                        <RangeControl label={t('شفافية جسم البطاقة', 'Body Transparency')} min={0} max={100} unit="%" value={template.config.bodyOpacity ?? 100} onChange={(v: number) => updateConfig('bodyOpacity', v)} icon={Sun} />
                        <RangeControl label={t('انحناء الحواف العلوي', 'Border Radius')} min={0} max={120} value={template.config.bodyBorderRadius ?? 48} onChange={(v: number) => updateConfig('bodyBorderRadius', v)} icon={Ruler} />
                        <RangeControl label={t('إزاحة منطقة المحتوى (أعلى/أسفل)', 'Body Y Offset')} min={-1000} max={500} value={template.config.bodyOffsetY || 0} onChange={(v: number) => updateConfig('bodyOffsetY', v)} icon={Move} />
                     </div>

                     <div className="pt-8 border-t dark:border-gray-800 space-y-6">
                        <div className="flex items-center gap-3"><AlignJustify className="text-indigo-600" size={20} /><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('محاذاة المحتوى ونمط التباعد', 'Alignment & Spacing DNA')}</label></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="grid grid-cols-3 gap-2">
                             {['start', 'center', 'end'].map(align => (
                                <button key={align} onClick={() => updateConfig('contentAlign', align)} className={`py-3 rounded-xl border-2 transition-all flex items-center justify-center ${template.config.contentAlign === align ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                   {align === 'start' ? <AlignLeft size={18}/> : align === 'center' ? <AlignCenter size={18}/> : <AlignRight size={18}/>}
                                </button>
                             ))}
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                             {['compact', 'normal', 'relaxed'].map(s => (
                                <button key={s} onClick={() => updateConfig('spacing', s)} className={`py-3 rounded-xl border-2 transition-all font-black text-[8px] uppercase ${template.config.spacing === s ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}>
                                   {t(s === 'compact' ? 'مضغوط' : (s === 'normal' ? 'عادي' : 'مريح'), s.toUpperCase())}
                                </button>
                             ))}
                          </div>
                        </div>
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
                         <button key={type} onClick={() => updateConfig('defaultThemeType', type)} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 flex-1 ${template.config.defaultThemeType === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400 border-transparent shadow-sm'}`}>
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
                            <button key={i} onClick={() => updateConfig('defaultThemeColor', clr)} className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-125 ${template.config.defaultThemeColor === clr ? 'border-blue-600 scale-125 shadow-lg' : 'border-white dark:border-gray-600'}`} style={{ backgroundColor: clr }} />
                          ))}
                       </div>
                    </div>
                  )}

                  {template.config.defaultThemeType === 'gradient' && (
                    <div className="space-y-6 animate-fade-in">
                       <label className="text-[10px] font-black text-gray-400 uppercase">{t('اختر التدرج اللوني المفضل', 'Select Color Gradient')}</label>
                       <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                          {THEME_GRADIENTS.map((grad, i) => (
                            <button key={i} onClick={() => updateConfig('defaultThemeGradient', grad)} className={`h-12 rounded-2xl border-2 transition-all ${template.config.defaultThemeGradient === grad ? 'border-blue-600 scale-110 shadow-lg' : 'border-transparent opacity-60'}`} style={{ background: grad }} />
                          ))}
                       </div>
                    </div>
                  )}

                  {template.config.defaultThemeType === 'image' && (
                    <div className="space-y-6 animate-fade-in">
                       <label className="text-[10px] font-black text-gray-400 uppercase">{t('خلفيات فنية افتراضية', 'Artistic Background Presets')}</label>
                       <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {BACKGROUND_PRESETS.map((url, i) => (
                            <button key={i} onClick={() => updateConfig('defaultBackgroundImage', url)} className={`h-24 rounded-2xl border-2 overflow-hidden transition-all ${template.config.defaultBackgroundImage === url ? 'border-blue-600 scale-105 shadow-xl' : 'border-transparent opacity-60'}`}>
                               <img src={url} className="w-full h-full object-cover" alt={`Preset ${i}`} />
                            </button>
                          ))}
                       </div>
                       <div className="pt-4 border-t dark:border-gray-800">
                          <input type="file" ref={bgInputRef} onChange={handleBgUpload} className="hidden" accept="image/*" />
                          <button onClick={() => bgInputRef.current?.click()} className="w-full py-5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-3xl font-black text-xs uppercase flex items-center justify-center gap-3 border border-blue-100 dark:border-blue-900/40 hover:bg-blue-100 transition-all">
                             {uploadingBg ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                             {t('رفع خلفية خاصة للقالب', 'Upload Custom Background')}
                          </button>
                       </div>
                    </div>
                  )}

                  <ColorPicker label={t('لون السمة الأساسي', 'Base Theme Color')} value={template.config.defaultThemeColor} onChange={(v: string) => updateConfig('defaultThemeColor', v)} />

                  <div className="pt-6 border-t dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3"><Moon className="text-gray-400" size={18} /><span className="text-xs font-black dark:text-white uppercase tracking-widest">{t('الوضع ليلي افتراضياً', 'Default Dark Mode')}</span></div>
                    <button onClick={() => updateConfig('defaultIsDark', !template.config.defaultIsDark)} className={`w-14 h-7 rounded-full relative transition-all ${template.config.defaultIsDark ? 'bg-blue-600 shadow-lg' : 'bg-gray-200 dark:bg-gray-700'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isRtl ? (template.config.defaultIsDark ? 'right-8' : 'right-1') : (template.config.defaultIsDark ? 'left-8' : 'left-1')}`} /></button>
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
                        {/* Background Selection for Occasion inside Admin Builder */}
                        <div className="space-y-4">
                           <div className="flex items-center gap-2">
                              <ImageIcon className="text-indigo-600" size={16} />
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('خلفية المناسبة (اختياري)', 'Occasion Background (Optional)')}</label>
                           </div>
                           <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[160px] overflow-y-auto no-scrollbar p-1 bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-100 dark:border-gray-800">
                              {BACKGROUND_PRESETS.map((url, i) => (
                                <button key={i} onClick={() => { updateConfig('defaultBackgroundImage', url); updateConfig('defaultThemeType', 'image'); }} className={`aspect-square rounded-xl border-2 overflow-hidden transition-all ${template.config.defaultBackgroundImage === url ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent opacity-60'}`}>
                                   <img src={url} className="w-full h-full object-cover" />
                                </button>
                              ))}
                           </div>
                           <div className="flex gap-2">
                             {['color', 'gradient', 'image'].map((type) => (
                               <button 
                                 key={type} 
                                 onClick={() => updateConfig('defaultThemeType', type as ThemeType)}
                                 className={`flex-1 py-2 rounded-xl text-[8px] font-black uppercase transition-all ${template.config.defaultThemeType === type ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-400 border border-gray-100 dark:border-gray-800'}`}
                               >
                                 {t(type, type.toUpperCase())}
                               </button>
                             ))}
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('صاحب الدعوة الافتراضي', 'Default Organizer Name')}</label>
                           <div className="relative">
                              <UserCircle className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-500`} size={16} />
                              <input type="text" value={template.config.defaultName || ''} onChange={e => updateConfig('defaultName', e.target.value)} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all`} placeholder={t('أدخل اسم صاحب الدعوة...', 'Enter organizer name...')} />
                           </div>
                        </div>

                        {/* Admin Text Controls for Protocol */}
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
                           <ColorPicker label={t('لون الترحيب الافتراضي', 'Default Welcome Color')} value={template.config.occasionWelcomeColor || 'rgba(0,0,0,0.4)'} onChange={(v: string) => updateConfig('occasionWelcomeColor', v)} />
                           <ColorPicker label={t('اللون الأساسي للمناسبة', 'Primary Accent Color')} value={template.config.occasionPrimaryColor || '#7c3aed'} onChange={(v: string) => updateConfig('occasionPrimaryColor', v)} />
                           <ColorPicker label={t('لون خلفية الصندوق', 'Box Background Color')} value={template.config.occasionBgColor || '#ffffff'} onChange={(v: string) => updateConfig('occasionBgColor', v)} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <ToggleSwitch label={t('تأثير زجاجي للصندوق', 'Glass Occasion Box')} value={template.config.occasionGlassy} onChange={(v: boolean) => updateConfig('occasionGlassy', v)} icon={GlassWater} color="bg-indigo-600" />
                           <RangeControl label={t('شفافية صندوق المناسبة', 'Occasion Box Transparency')} min={0} max={100} unit="%" value={template.config.occasionOpacity ?? 100} onChange={(v: number) => updateConfig('occasionOpacity', v)} icon={Sun} />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                           <RangeControl label={t('إزاحة كتلة الدعوة كاملة (نصوص وصندوق)', 'Full Invitation Block Displacement')} min={-200} max={300} value={template.config.invitationYOffset || 0} onChange={(v: number) => updateConfig('invitationYOffset', v)} icon={Move} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <ToggleSwitch label={t('تفعيل العد التنازلي', 'Enable Countdown')} value={template.config.showCountdown} onChange={(v: boolean) => updateConfig('showCountdown', v)} icon={Timer} />
                           <ToggleSwitch label={t('تحريك الصندوق (عائم)', 'Floating Animation')} value={template.config.occasionFloating} onChange={(v: boolean) => updateConfig('occasionFloating', v)} icon={Wind} />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'qrcode' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                     <div className="flex items-center gap-3"><QrCode className="text-blue-600" size={24} /><h4 className="text-[12px] font-black uppercase tracking-widest dark:text-white">{t('تخصيص الباركود', 'QR Code Customization')}</h4></div>
                     <ToggleSwitch label={t('إظهار الباركود افتراضياً', 'Show QR by Default')} value={template.config.showQrCodeByDefault} onChange={(v: boolean) => updateConfig('showQrCodeByDefault', v)} icon={QrCode} />
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <RangeControl label={t('حجم الباركود', 'QR Size')} min={40} max={200} value={template.config.qrSize || 90} onChange={(v: number) => updateConfig('qrSize', v)} icon={Maximize2} />
                        <RangeControl label={t('سُمك الإطار', 'Border Width')} min={0} max={20} value={template.config.qrBorderWidth || 0} onChange={(v: number) => updateConfig('qrBorderWidth', v)} icon={Ruler} />
                        <RangeControl label={t('انحناء الحواف', 'Border Radius')} min={0} max={100} value={template.config.qrBorderRadius || 0} onChange={(v: number) => updateConfig('qrBorderRadius', v)} icon={Layout} />
                        <RangeControl label={t('إزاحة الباركود', 'QR Y Offset')} min={-50} max={150} value={template.config.qrOffsetY || 0} onChange={(v: number) => updateConfig('qrOffsetY', v)} icon={Move} />
                     </div>

                     <div className="space-y-4">
                        <ColorPicker label={t('لون الباركود', 'QR Foreground')} value={template.config.qrColor || '#2563eb'} onChange={(v: string) => updateConfig('qrColor', v)} />
                        <ColorPicker label={t('لون الخلفية', 'QR Background')} value={template.config.qrBgColor || 'transparent'} onChange={(v: string) => updateConfig('qrBgColor', v)} />
                        <ColorPicker label={t('لون الإطار', 'QR Border Color')} value={template.config.qrBorderColor || '#f9fafb'} onChange={(v: string) => updateConfig('qrBorderColor', v)} />
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
                   <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-lg transition-all ${previewDevice === 'mobile' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Smartphone size={16}/></button>
                   <button onClick={() => setPreviewDevice('tablet')} className={`p-2 rounded-lg transition-all ${previewDevice === 'tablet' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Tablet size={16}/></button>
                   <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-lg transition-all ${previewDevice === 'desktop' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Monitor size={18}/></button>
                </div>
              </div>
              <div className={`transition-all duration-500 origin-top border-[10px] border-gray-900 dark:border-gray-800 rounded-[3.5rem] shadow-2xl overflow-hidden bg-white dark:bg-gray-950 ${previewDevice === 'mobile' ? 'w-[320px]' : previewDevice === 'tablet' ? 'w-[440px]' : 'w-[360px]'}`}>
                <div className="themed-scrollbar overflow-x-hidden h-[620px] scroll-smooth">
                   <CardPreview 
                     data={{ 
                       ...sampleCardData, 
                       name: template.config.defaultName || sampleCardData.name,
                       templateId: template.id, 
                       themeType: template.config.defaultThemeType, 
                       themeColor: template.config.defaultThemeColor, 
                       themeGradient: template.config.defaultThemeGradient,
                       backgroundImage: template.config.defaultBackgroundImage,
                       isDark: template.config.defaultIsDark,
                       nameColor: template.config.nameColor,
                       titleColor: template.config.titleColor,
                       bioTextColor: template.config.bioTextColor,
                       bioBgColor: template.config.bioBgColor,
                       linksColor: template.config.linksColor,
                       socialIconsColor: template.config.socialIconsColor,
                       contactPhoneColor: template.config.contactPhoneColor,
                       contactWhatsappColor: template.config.contactWhatsappColor,
                       showOccasion: template.config.showOccasionByDefault,
                       occasionTitle: template.config.occasionTitle,
                       occasionPrimaryColor: template.config.occasionPrimaryColor,
                       occasionDate: template.config.occasionDate,
                       occasionGlassy: template.config.occasionGlassy,
                       occasionOpacity: template.config.occasionOpacity,
                       occasionPrefixColor: template.config.occasionPrefixColor,
                       occasionNameColor: template.config.occasionNameColor,
                       occasionWelcomeColor: template.config.occasionWelcomeColor,
                       invitationPrefix: template.config.invitationPrefix,
                       invitationWelcome: template.config.invitationWelcome,
                       invitationYOffset: template.config.invitationYOffset,
                       showQrCode: template.config.showQrCodeByDefault,
                       showName: template.config.showNameByDefault,
                       showTitle: template.config.showTitleByDefault,
                       showCompany: template.config.showCompanyByDefault,
                       showBio: template.config.showBioByDefault,
                       showEmail: template.config.showEmailByDefault,
                       showWebsite: template.config.showWebsiteByDefault,
                       showPhone: template.config.showPhoneByDefault,
                       showWhatsapp: template.config.showWhatsappByDefault,
                       showSocialLinks: template.config.showSocialLinksByDefault,
                       showButtons: template.config.showButtonsByDefault
                     } as any} 
                     lang={lang} 
                     customConfig={template.config} 
                     hideSaveButton={true} 
                   />
                </div>
              </div>
           </div>
        </div>
      </div>

      {showSaveModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-[3.5rem] shadow-2xl border dark:border-gray-800 overflow-hidden p-8 space-y-8 animate-zoom-in">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{isRtl ? 'حفظ التصميم ونشره' : 'Publish Template'}</h3>
                 <button onClick={() => setShowSaveModal(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={24}/></button>
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
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase px-1">{t('القسم (Category)', 'Section Category')}</label>
                    <select value={template.categoryId} onChange={e => updateTemplate('categoryId', e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border dark:text-white font-bold outline-none">
                       <option value="">{t('اختر القسم...', 'Select Category...')}</option>
                       {categories.map(cat => <option key={cat.id} value={cat.id}>{isRtl ? cat.nameAr : cat.nameEn}</option>)}
                    </select>
                 </div>
              </div>
              <button onClick={() => onSave(template)} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase shadow-2xl active:scale-95 transition-all">{t('تأكيد الحفظ', 'Confirm Publish')}</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default TemplateBuilder;