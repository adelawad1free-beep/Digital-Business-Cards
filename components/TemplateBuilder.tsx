
import React, { useState, useRef } from 'react';
import { CustomTemplate, TemplateConfig, Language, CardData } from '../types';
import { TRANSLATIONS, SAMPLE_DATA, THEME_COLORS, THEME_GRADIENTS, BACKGROUND_PRESETS } from '../constants';
import { uploadImageToCloud } from '../services/uploadService';
import CardPreview from './CardPreview';
import { 
  Save, Layout, Smartphone, 
  Layers, Move, Check, X, 
  Zap, AlignCenter, 
  Circle, Box, Loader2,
  Type as TypographyIcon, Ruler,
  Star, Hash, ArrowLeft, Palette, Sparkles, Image as ImageIcon, UploadCloud, Sun, Moon, Pipette,
  Settings, FileText, AlignLeft, AlignRight, LayoutTemplate, Info, Maximize2, UserCircle,
  Mail, Phone, Globe, MessageCircle, Camera, Download, Tablet, Monitor, Eye, QrCode, Wind, GlassWater
} from 'lucide-react';

interface TemplateBuilderProps {
  lang: Language;
  onSave: (template: CustomTemplate) => void;
  onCancel?: () => void;
  initialTemplate?: CustomTemplate;
}

type BuilderTab = 'info' | 'visuals' | 'header' | 'avatar' | 'typography' | 'layout' | 'qrcode';

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ lang, onSave, onCancel, initialTemplate }) => {
  const isRtl = lang === 'ar';
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  
  const t = (key: string, enVal?: string) => {
    if (enVal) return isRtl ? key : enVal;
    return TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;
  };
  
  const [activeTab, setActiveTab] = useState<BuilderTab>('info');
  const [activeBgImgTab, setActiveBgImgTab] = useState<'presets' | 'upload' | 'link'>('presets');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  
  const [template, setTemplate] = useState<CustomTemplate>(initialTemplate || {
    id: `tmpl_${Date.now()}`,
    nameAr: 'قالب جديد مخصص',
    nameEn: 'New Custom Template',
    descAr: 'وصف القالب الجديد المخصص',
    descEn: 'Description of the new custom template',
    isActive: true,
    isFeatured: false,
    order: 0,
    createdAt: new Date().toISOString(),
    config: {
      headerType: 'classic',
      headerHeight: 180,
      avatarStyle: 'circle',
      avatarSize: 120,
      avatarOffsetY: 0,
      avatarOffsetX: 0,
      nameOffsetY: 0,
      bioOffsetY: 0,
      emailOffsetY: 0,
      websiteOffsetY: 0,
      contactButtonsOffsetY: 0,
      socialLinksOffsetY: 0,
      contentAlign: 'center',
      buttonStyle: 'pill',
      animations: 'fade',
      spacing: 'normal',
      nameSize: 26,
      bioSize: 13,
      qrSize: 90,
      qrColor: '#2563eb',
      qrOffsetY: 0,
      showQrCodeByDefault: true,
      showBioByDefault: true,
      headerGlassy: false,
      headerOpacity: 100,
      bodyGlassy: false,
      bodyOpacity: 100,
      nameColor: '#111827',
      titleColor: '#2563eb',
      bioTextColor: 'rgba(0,0,0,0.65)',
      bioBgColor: 'rgba(0,0,0,0.03)',
      linksColor: '#3b82f6',
      defaultThemeType: 'gradient',
      defaultThemeColor: THEME_COLORS[0],
      defaultThemeGradient: THEME_GRADIENTS[0],
      defaultIsDark: false
    }
  });

  const updateTemplate = (key: keyof CustomTemplate, value: any) => {
    setTemplate(prev => ({ ...prev, [key]: value }));
  };

  const updateConfig = (key: keyof TemplateConfig, value: any) => {
    setTemplate(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'defaultBackgroundImage' | 'defaultProfileImage') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const base64 = await uploadImageToCloud(file);
      if (base64) updateConfig(field, base64);
    } finally {
      setUploadingImg(false);
    }
  };

  const downloadImage = (base64: string | undefined, name: string) => {
    if (!base64) return;
    const link = document.createElement('a');
    link.href = base64;
    link.download = `${name}.png`;
    link.click();
  };

  const sampleCardData = (SAMPLE_DATA[lang] || SAMPLE_DATA['en']) as CardData;

  const RangeControl = ({ label, value, min, max, onChange, unit = "px", icon: Icon }: any) => (
    <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           {Icon && <Icon size={14} className="text-blue-500" />}
           <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">{value}{unit}</span>
      </div>
      <input 
        type="range" min={min} max={max} value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );

  const ColorPicker = ({ label, value, onChange, compact = false }: any) => (
    <div className={`flex items-center justify-between ${compact ? 'p-2' : 'p-5'} bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm transition-all hover:border-blue-100 dark:hover:border-blue-900/30`}>
      <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-3">
         <div className="relative w-9 h-9 rounded-2xl overflow-hidden border-2 border-white dark:border-gray-700 shadow-md">
            <input 
              type="color" 
              value={value?.startsWith('rgba') || !value?.startsWith('#') ? '#3b82f6' : value} 
              onChange={(e) => onChange(e.target.value)} 
              className="absolute inset-0 opacity-0 cursor-pointer scale-150" 
            />
            <div className="w-full h-full" style={{ backgroundColor: value }} />
         </div>
         <input 
           type="text" 
           value={value} 
           onChange={(e) => onChange(e.target.value)}
           className="bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-3 py-2 text-[10px] font-black text-blue-600 w-24 uppercase text-center focus:ring-2 focus:ring-blue-100 outline-none"
         />
      </div>
    </div>
  );

  const NavItem = ({ id, label, icon: Icon }: { id: BuilderTab, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${activeTab === id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
    >
      <div className={`p-2 rounded-xl ${activeTab === id ? 'bg-white/20' : 'bg-gray-50 dark:bg-gray-800 group-hover:bg-white dark:group-hover:bg-gray-700'} transition-colors`}>
        <Icon size={18} />
      </div>
      <span className="text-xs font-black uppercase tracking-widest">{label}</span>
    </button>
  );

  const PreviewContent = ({ isMobileView = false }) => (
    <div className={`flex flex-col items-center w-full ${isMobileView ? '' : ''}`}>
      {!isMobileView && (
        <div className="mb-6 w-full flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('معاينة حية', 'Live Preview')}</span>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
             <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded-lg transition-all ${previewDevice === 'mobile' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Smartphone size={16}/></button>
             <button onClick={() => setPreviewDevice('tablet')} className={`p-2 rounded-lg transition-all ${previewDevice === 'tablet' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Tablet size={16}/></button>
             <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded-lg transition-all ${previewDevice === 'desktop' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}><Monitor size={16}/></button>
          </div>
        </div>
      )}
      
      <div className={`transition-all duration-500 ease-in-out origin-top border-[10px] border-gray-900 dark:border-gray-800 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden bg-white dark:bg-gray-950 ${isMobileView ? 'w-[280px]' : previewDevice === 'mobile' ? 'w-[320px]' : previewDevice === 'tablet' ? 'w-[440px]' : 'w-[360px]'}`}>
        <div className={`no-scrollbar overflow-x-hidden ${isMobileView ? 'h-[520px]' : 'h-[620px]'} overflow-y-auto`}>
           <CardPreview 
              data={{ 
                ...sampleCardData, 
                templateId: template.id,
                themeType: template.config.defaultThemeType || 'gradient',
                themeColor: template.config.defaultThemeColor || THEME_COLORS[0],
                themeGradient: template.config.defaultThemeGradient || THEME_GRADIENTS[0],
                backgroundImage: template.config.defaultBackgroundImage || '',
                profileImage: template.config.defaultProfileImage || '',
                isDark: template.config.defaultIsDark || false,
                nameColor: template.config.nameColor,
                titleColor: template.config.titleColor,
                bioTextColor: template.config.bioTextColor,
                bioBgColor: template.config.bioBgColor,
                linksColor: template.config.linksColor,
                qrColor: template.config.qrColor,
                showQrCode: template.config.showQrCodeByDefault,
                showBio: template.config.showBioByDefault
              }} 
              lang={lang} 
              customConfig={template.config} 
              hideSaveButton={true}
           />
        </div>
      </div>
    </div>
  );

  const inputClasses = "w-full px-5 py-3.5 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl text-[13px] font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all shadow-sm";
  const labelTextClasses = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 block mb-2";

  return (
    <div className="bg-white dark:bg-[#0a0a0c] rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[calc(100vh-100px)] min-h-[850px]">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-8 py-4 bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10 shrink-0">
        <div className="flex items-center gap-5">
          <button type="button" onClick={onCancel} className="p-2 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-xl border border-gray-100 dark:border-gray-700 transition-all shadow-sm">
            <ArrowLeft size={18} className={isRtl ? 'rotate-180' : ''} />
          </button>
          <div className="flex flex-col">
            <h2 className="text-base font-black dark:text-white tracking-tight leading-none mb-1">{t('تصميم القالب المخصص', 'Custom Template Design')}</h2>
            <div className="flex items-center gap-1.5">
               <Hash size={10} className="text-blue-500" />
               <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{template.id}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => onSave(template)} 
             disabled={loading}
             className="px-10 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
           >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {t('حفظ القالب', 'Save Template')}
           </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden bg-white dark:bg-[#0a0a0c]">
        <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-l dark:border-gray-800 p-6 flex flex-col gap-1 overflow-y-auto no-scrollbar shrink-0 bg-gray-50/30 dark:bg-transparent">
          <NavItem id="info" label={t('معلومات عامة', 'Basic Info')} icon={Info} />
          <NavItem id="visuals" label={t('المظهر العام', 'Visual Style')} icon={Palette} />
          <NavItem id="header" label={t('الترويسة', 'Header')} icon={Layout} />
          <NavItem id="avatar" label={t('الصورة الشخصية', 'Avatar')} icon={Circle} />
          <NavItem id="typography" label={t('النصوص والخطوط', 'Typography')} icon={TypographyIcon} />
          <NavItem id="layout" label={t('التموضع والخيارات', 'Layout & Options')} icon={Move} />
          <NavItem id="qrcode" label={t('رمز الـ QR', 'QR Code')} icon={QrCode} />
        </div>

        <div className="flex-1 p-8 overflow-y-auto no-scrollbar bg-gray-50/20 dark:bg-transparent">
          <div className="max-w-3xl mx-auto space-y-10 animate-fade-in pb-32">
            
            {activeTab === 'info' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1"><label className={labelTextClasses}>{t('الاسم (عربي)', 'Name (AR)')}</label><input type="text" value={template.nameAr} onChange={e => updateTemplate('nameAr', e.target.value)} className={inputClasses} /></div>
                    <div className="col-span-1"><label className={labelTextClasses}>{t('الاسم (English)', 'Name (EN)')}</label><input type="text" value={template.nameEn} onChange={e => updateTemplate('nameEn', e.target.value)} className={inputClasses} /></div>
                    <div className="md:col-span-2"><label className={labelTextClasses}>{t('الوصف (عربي)', 'Description (AR)')}</label><textarea value={template.descAr} onChange={e => updateTemplate('descAr', e.target.value)} rows={3} className={inputClasses + " resize-none"} /></div>
                    <div className="md:col-span-2"><label className={labelTextClasses}>{t('الوصف (English)', 'Description (EN)')}</label><textarea value={template.descEn} onChange={e => updateTemplate('descEn', e.target.value)} rows={3} className={inputClasses + " resize-none"} /></div>
                 </div>
              </div>
            )}

            {activeTab === 'visuals' && (
              <div className="space-y-10 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-10">
                    <div>
                      <label className={labelTextClasses + " mb-6"}>{t('نوع الخلفية الافتراضية', 'Default Background Type')}</label>
                      <div className="grid grid-cols-3 gap-4">
                         <button onClick={() => updateConfig('defaultThemeType', 'color')} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${template.config.defaultThemeType === 'color' ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}><Palette size={20}/> <span className="text-[10px] font-black uppercase">{t('color')}</span></button>
                         <button onClick={() => updateConfig('defaultThemeType', 'gradient')} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${template.config.defaultThemeType === 'gradient' ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}><Sparkles size={20}/> <span className="text-[10px] font-black uppercase">{t('gradient')}</span></button>
                         <button onClick={() => updateConfig('defaultThemeType', 'image')} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${template.config.defaultThemeType === 'image' ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}`}><ImageIcon size={20}/> <span className="text-[10px] font-black uppercase">{t('image')}</span></button>
                      </div>
                    </div>

                    <div className="pt-10 border-t border-gray-50 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             {template.config.defaultIsDark ? <Moon className="text-blue-600" size={24} /> : <Sun className="text-amber-500" size={24} />}
                             <h4 className="text-[11px] font-black uppercase tracking-widest dark:text-white">{t('الوضع الليلي افتراضياً', 'Default Dark Mode')}</h4>
                          </div>
                          <button 
                            onClick={() => updateConfig('defaultIsDark', !template.config.defaultIsDark)}
                            className={`w-14 h-7 rounded-full relative transition-all ${template.config.defaultIsDark ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                          >
                             <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${isRtl ? (template.config.defaultIsDark ? 'right-8' : 'right-1') : (template.config.defaultIsDark ? 'left-8' : 'left-1')}`} />
                          </button>
                       </div>

                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <GlassWater className="text-blue-600" size={24} />
                             <h4 className="text-[11px] font-black uppercase tracking-widest dark:text-white">{t('زجاجية محتوى البطاقة', 'Card Body Glassy')}</h4>
                          </div>
                          <button 
                            onClick={() => updateConfig('bodyGlassy', !template.config.bodyGlassy)}
                            className={`w-14 h-7 rounded-full relative transition-all ${template.config.bodyGlassy ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                          >
                             <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${isRtl ? (template.config.bodyGlassy ? 'right-8' : 'right-1') : (template.config.bodyGlassy ? 'left-8' : 'left-1')}`} />
                          </button>
                       </div>
                    </div>

                    {template.config.bodyGlassy && (
                      <div className="pt-6 animate-fade-in">
                          <RangeControl label={t('شفافية المحتوى الأبيض', 'Body White Opacity')} min={0} max={100} value={template.config.bodyOpacity ?? 100} onChange={(v: number) => updateConfig('bodyOpacity', v)} unit="%" icon={Sun} />
                      </div>
                    )}
                    
                    <div className="mt-8 pt-10 border-t border-gray-50 dark:border-gray-800 space-y-8">
                       {template.config.defaultThemeType === 'color' && (
                         <div className="space-y-6 animate-fade-in">
                            <div className="flex flex-wrap justify-center gap-4">
                               {THEME_COLORS.map(c => <button key={c} onClick={() => updateConfig('defaultThemeColor', c)} className="w-10 h-10 rounded-full shadow-lg relative transition-transform hover:scale-110" style={{ backgroundColor: c }}>{template.config.defaultThemeColor === c && <div className="absolute -inset-2 border-2 border-blue-600 rounded-full" />}</button>)}
                            </div>
                            <ColorPicker label={t('لون مخصص', 'Custom Color')} value={template.config.defaultThemeColor} onChange={(v: string) => updateConfig('defaultThemeColor', v)} />
                         </div>
                       )}
                       {template.config.defaultThemeType === 'gradient' && (
                         <div className="space-y-6 animate-fade-in">
                            <div className="flex flex-wrap justify-center gap-4">
                               {THEME_GRADIENTS.map((g, i) => <button key={i} onClick={() => updateConfig('defaultThemeGradient', g)} className="w-10 h-10 rounded-full shadow-lg relative transition-transform hover:scale-110" style={{ background: g }}>{template.config.defaultThemeGradient === g && <div className="absolute -inset-2 border-2 border-blue-600 rounded-full" />}</button>)}
                            </div>
                            <div className="space-y-2">
                               <label className={labelTextClasses}>{t('تدرج مخصص (CSS)', 'Custom CSS Gradient')}</label>
                               <textarea rows={2} value={template.config.defaultThemeGradient} onChange={(e) => updateConfig('defaultThemeGradient', e.target.value)} placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" className={inputClasses + " resize-none text-[11px] font-mono"} />
                            </div>
                         </div>
                       )}
                       {template.config.defaultThemeType === 'image' && (
                         <div className="space-y-8 animate-fade-in">
                            <div className="flex flex-col items-center gap-6">
                               <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-full">
                                  <button onClick={() => setActiveBgImgTab('presets')} className={`flex-1 px-6 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeBgImgTab === 'presets' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}>{isRtl ? 'المكتبة' : 'Gallery'}</button>
                                  <button onClick={() => setActiveBgImgTab('upload')} className={`flex-1 px-6 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${activeBgImgTab === 'upload' ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm' : 'text-gray-400'}`}>{isRtl ? 'رفع مخصص' : 'Upload'}</button>
                               </div>

                               {activeBgImgTab === 'presets' && (
                                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 w-full animate-fade-in">
                                     {BACKGROUND_PRESETS.map((url, i) => (
                                        <button 
                                          key={i} 
                                          onClick={() => updateConfig('defaultBackgroundImage', url)}
                                          className={`aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105 ${template.config.defaultBackgroundImage === url ? 'border-blue-600 shadow-lg' : 'border-transparent'}`}
                                        >
                                           <img src={url} className="w-full h-full object-cover" alt="preset" />
                                        </button>
                                     ))}
                                  </div>
                               )}

                               {activeBgImgTab === 'upload' && (
                                  <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-3xl border border-dashed border-gray-200 w-full flex flex-col items-center gap-4">
                                     <div className="w-full h-32 bg-white dark:bg-gray-950 rounded-2xl border shadow-inner flex items-center justify-center overflow-hidden">
                                        {template.config.defaultBackgroundImage && !BACKGROUND_PRESETS.includes(template.config.defaultBackgroundImage) ? <img src={template.config.defaultBackgroundImage} className="w-full h-full object-cover" /> : <ImageIcon size={40} className="text-gray-200" />}
                                     </div>
                                     <input type="file" ref={logoInputRef} onChange={(e) => handleFileUpload(e, 'defaultBackgroundImage')} className="hidden" accept="image/*" />
                                     <div className="flex gap-2 w-full">
                                        <button onClick={() => logoInputRef.current?.click()} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-lg flex items-center justify-center gap-2">
                                           {uploadingImg ? <Loader2 className="animate-spin" size={16}/> : <UploadCloud size={16}/>} {t('رفع ملف', 'Upload File')}
                                        </button>
                                        <button onClick={() => updateConfig('defaultBackgroundImage', '')} className="p-4 bg-white dark:bg-gray-800 border text-red-500 rounded-2xl"><X size={18}/></button>
                                     </div>
                                  </div>
                               )}
                            </div>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
            )}

            {activeTab === 'header' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div>
                      <label className={labelTextClasses + " mb-6"}>{t('نمط الترويسة', 'Header Style')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                         <button onClick={() => updateConfig('headerType', 'classic')} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.headerType === 'classic' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                           <LayoutTemplate size={20}/> <span className="text-[8px] font-black uppercase">{t('كلاسيك', 'Classic')}</span>
                         </button>
                         <button onClick={() => updateConfig('headerType', 'split')} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.headerType === 'split' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                           <Smartphone size={20}/> <span className="text-[8px] font-black uppercase">{t('منقسم', 'Split')}</span>
                         </button>
                         <button onClick={() => updateConfig('headerType', 'overlay')} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.headerType === 'overlay' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                           <Layers size={20}/> <span className="text-[8px] font-black uppercase">{t('متداخل', 'Overlay')}</span>
                         </button>
                         <button onClick={() => updateConfig('headerType', 'hero')} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.headerType === 'hero' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                           <UserCircle size={20}/> <span className="text-[8px] font-black uppercase">{t('البانورامي', 'Hero')}</span>
                         </button>
                         <button onClick={() => updateConfig('headerType', 'minimal')} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.headerType === 'minimal' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                           <Zap size={20}/> <span className="text-[8px] font-black uppercase">{t('بسيط', 'Minimal')}</span>
                         </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 dark:border-gray-800">
                       <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                             <Wind className="text-blue-600" size={20} />
                             <h4 className="text-[11px] font-black uppercase tracking-widest dark:text-white">{t('نمط زجاجي للترويسة', 'Header Glassy')}</h4>
                          </div>
                          <button 
                            onClick={() => updateConfig('headerGlassy', !template.config.headerGlassy)}
                            className={`w-14 h-7 rounded-full relative transition-all ${template.config.headerGlassy ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                          >
                             <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${isRtl ? (template.config.headerGlassy ? 'right-8' : 'right-1') : (template.config.headerGlassy ? 'left-8' : 'left-1')}`} />
                          </button>
                       </div>
                       
                       {template.config.headerGlassy && (
                          <div className="mt-4 animate-fade-in">
                             <RangeControl label={t('شفافية الترويسة', 'Opacity')} min={0} max={100} value={template.config.headerOpacity ?? 100} onChange={(v: number) => updateConfig('headerOpacity', v)} unit="%" />
                          </div>
                       )}
                    </div>
                  </div>
                  <RangeControl label={t('ارتفاع الترويسة', 'Header Height')} min={60} max={450} value={template.config.headerHeight} onChange={(v: number) => updateConfig('headerHeight', v)} />
               </div>
            )}

            {activeTab === 'avatar' && (
               <div className="space-y-8 animate-fade-in">
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                    <label className={labelTextClasses + " mb-6"}>{t('شكل الصورة', 'Avatar Shape')}</label>
                    <div className="grid grid-cols-3 gap-4">
                       <button onClick={() => updateConfig('avatarStyle', 'circle')} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.avatarStyle === 'circle' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}><Circle size={24}/> <span className="text-[9px] font-black uppercase">{t('circle')}</span></button>
                       <button onClick={() => updateConfig('avatarStyle', 'squircle')} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.avatarStyle === 'squircle' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}><Box size={24}/> <span className="text-[9px] font-black uppercase">{t('squircle')}</span></button>
                       <button onClick={() => updateConfig('avatarStyle', 'none')} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.avatarStyle === 'none' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/10' : 'bg-gray-50 dark:bg-gray-800 text-gray-400'}`}><X size={24}/> <span className="text-[9px] font-black uppercase">{t('hidden')}</span></button>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                    <label className={labelTextClasses}>{t('رفع وتنزيل صورة تجريبية للقالب', 'Avatar Upload & Download')}</label>
                    <div className="flex items-center gap-6">
                       <div className="w-24 h-24 rounded-full border-4 border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                          {template.config.defaultProfileImage ? <img src={template.config.defaultProfileImage} className="w-full h-full object-cover" /> : <Camera size={32} className="text-gray-300" />}
                       </div>
                       <div className="flex-1 space-y-3">
                          <input type="file" ref={avatarInputRef} onChange={(e) => handleFileUpload(e, 'defaultProfileImage')} className="hidden" accept="image/*" />
                          <div className="flex gap-2">
                             <button onClick={() => avatarInputRef.current?.click()} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 active:scale-95 transition-all">
                                <UploadCloud size={16}/> {t('رفع', 'Upload')}
                             </button>
                             <button onClick={() => downloadImage(template.config.defaultProfileImage, 'default-avatar')} className="p-4 bg-gray-100 dark:bg-gray-700 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all">
                                <Download size={18}/>
                             </button>
                          </div>
                          <button onClick={() => updateConfig('defaultProfileImage', '')} className="w-full py-2 text-red-500 text-[10px] font-black uppercase">{t('حذف الصورة', 'Remove')}</button>
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <RangeControl label={t('حجم الصورة', 'Avatar Size')} min={60} max={250} value={template.config.avatarSize} onChange={(v: number) => updateConfig('avatarSize', v)} />
                     <RangeControl label={t('إزاحة الصورة X', 'Avatar X')} min={-150} max={150} value={template.config.avatarOffsetX} onChange={(v: number) => updateConfig('avatarOffsetX', v)} icon={Move} />
                     <RangeControl label={t('إزاحة الصورة Y', 'Avatar Y')} min={-150} max={150} value={template.config.avatarOffsetY} onChange={(v: number) => updateConfig('avatarOffsetY', v)} icon={Move} />
                  </div>
               </div>
            )}

            {activeTab === 'typography' && (
              <div className="space-y-6 animate-fade-in">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker label={t('اسم المستخدم', 'Name')} value={template.config.nameColor} onChange={(v: string) => updateConfig('nameColor', v)} />
                    <ColorPicker label={t('المسمى الوظيفي', 'Title')} value={template.config.titleColor} onChange={(v: string) => updateConfig('titleColor', v)} />
                    <ColorPicker label={t('الروابط والبريد', 'Links')} value={template.config.linksColor} onChange={(v: string) => updateConfig('linksColor', v)} />
                    <ColorPicker label={t('نص النبذة', 'Bio Text')} value={template.config.bioTextColor} onChange={(v: string) => updateConfig('bioTextColor', v)} />
                    <ColorPicker label={t('خلفية النبذة', 'Bio Bg')} value={template.config.bioBgColor} onChange={(v: string) => updateConfig('bioBgColor', v)} />
                 </div>
                 <div className="pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RangeControl label={t('حجم الاسم', 'Name Size')} min={16} max={48} value={template.config.nameSize} onChange={(v: number) => updateConfig('nameSize', v)} icon={TypographyIcon} />
                    <RangeControl label={t('حجم النبذة', 'Bio Size')} min={10} max={24} value={template.config.bioSize} onChange={(v: number) => updateConfig('bioSize', v)} icon={TypographyIcon} />
                 </div>
              </div>
            )}

            {activeTab === 'layout' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div>
                       <label className={labelTextClasses + " mb-6"}>{t('محاذاة المحتوى', 'Content Alignment')}</label>
                       <div className="flex gap-4">
                          <button onClick={() => updateConfig('contentAlign', isRtl ? 'end' : 'start')} className={`flex-1 py-4 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${((isRtl && template.config.contentAlign === 'end') || (!isRtl && template.config.contentAlign === 'start')) ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                            <AlignLeft size={18}/> <span className="text-[10px] font-black uppercase">{t('يسار', 'Left')}</span>
                          </button>
                          <button onClick={() => updateConfig('contentAlign', 'center')} className={`flex-1 py-4 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${template.config.contentAlign === 'center' ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                            <AlignCenter size={18}/> <span className="text-[10px] font-black uppercase">{t('وسط', 'Center')}</span>
                          </button>
                          <button onClick={() => updateConfig('contentAlign', isRtl ? 'start' : 'end')} className={`flex-1 py-4 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${((isRtl && template.config.contentAlign === 'start') || (!isRtl && template.config.contentAlign === 'end')) ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}>
                            <AlignRight size={18}/> <span className="text-[10px] font-black uppercase">{t('يمين', 'Right')}</span>
                          </button>
                       </div>
                    </div>

                    <div className="pt-8 border-t border-gray-100 dark:border-gray-800">
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <FileText className="text-blue-600" size={20} />
                             <h4 className="text-[11px] font-black uppercase tracking-widest dark:text-white">{t('إظهار النبذة افتراضياً', 'Show Bio by Default')}</h4>
                          </div>
                          <button 
                            onClick={() => updateConfig('showBioByDefault', !template.config.showBioByDefault)}
                            className={`w-14 h-7 rounded-full relative transition-all ${template.config.showBioByDefault ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                          >
                             <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${isRtl ? (template.config.showBioByDefault ? 'right-8' : 'right-1') : (template.config.showBioByDefault ? 'left-8' : 'left-1')}`} />
                          </button>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RangeControl label={t('إزاحة الاسم', 'Name Y')} min={-100} max={100} value={template.config.nameOffsetY} onChange={(v: number) => updateConfig('nameOffsetY', v)} icon={Move} />
                    <RangeControl label={t('إزاحة النبذة', 'Bio Y')} min={-100} max={100} value={template.config.bioOffsetY} onChange={(v: number) => updateConfig('bioOffsetY', v)} icon={Move} />
                    <RangeControl label={t('إزاحة البريد', 'Email Y')} min={-100} max={100} value={template.config.emailOffsetY} onChange={(v: number) => updateConfig('emailOffsetY', v)} icon={Mail} />
                    <RangeControl label={t('إزاحة الموقع', 'Web Y')} min={-100} max={100} value={template.config.websiteOffsetY} onChange={(v: number) => updateConfig('websiteOffsetY', v)} icon={Globe} />
                    <RangeControl label={t('إزاحة الأزرار', 'Btns Y')} min={-100} max={100} value={template.config.contactButtonsOffsetY} onChange={(v: number) => updateConfig('contactButtonsOffsetY', v)} icon={Phone} />
                    <RangeControl label={t('إزاحة التواصل', 'Social Y')} min={-100} max={100} value={template.config.socialLinksOffsetY} onChange={(v: number) => updateConfig('socialLinksOffsetY', v)} icon={MessageCircle} />
                 </div>
              </div>
            )}

            {activeTab === 'qrcode' && (
              <div className="space-y-8 animate-fade-in">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <QrCode className="text-blue-600" size={24} />
                          <h3 className="font-black dark:text-white uppercase text-xs tracking-wider">{t('إعدادات رمز الـ QR', 'QR Code Settings')}</h3>
                       </div>
                       <button 
                         onClick={() => updateConfig('showQrCodeByDefault', !template.config.showQrCodeByDefault)}
                         className={`w-14 h-7 rounded-full relative transition-all ${template.config.showQrCodeByDefault ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                       >
                          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${isRtl ? (template.config.showQrCodeByDefault ? 'right-8' : 'right-1') : (template.config.showQrCodeByDefault ? 'left-8' : 'left-1')}`} />
                       </button>
                    </div>
                    <ColorPicker label={t('اللون الافتراضي للباركود', 'Default QR Color')} value={template.config.qrColor} onChange={(v: string) => updateConfig('qrColor', v)} compact />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <RangeControl label={t('حجم الرمز', 'QR Size')} min={40} max={150} value={template.config.qrSize || 90} onChange={(v: number) => updateConfig('qrSize', v)} icon={Maximize2} />
                    <RangeControl label={t('إزاحة الرمز Y', 'QR Offset Y')} min={-150} max={150} value={template.config.qrOffsetY || 0} onChange={(v: number) => updateConfig('qrOffsetY', v)} icon={Move} />
                 </div>
              </div>
            )}

          </div>
        </div>

        <div className="hidden lg:flex w-full lg:w-[480px] bg-gray-50/50 dark:bg-black/40 border-r lg:border-r-0 lg:border-l dark:border-gray-800 p-6 flex flex-col items-center relative overflow-y-auto no-scrollbar scroll-smooth">
           <PreviewContent />
        </div>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-[150] animate-fade-in-up">
        <div className="bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-t border-gray-100 dark:border-gray-800 px-8 py-5 pb-10 flex items-center justify-between shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.1)]">
          <button 
            onClick={onCancel} 
            className="flex flex-col items-center gap-1.5 p-2 text-gray-400 hover:text-red-500 transition-all"
          >
            <ArrowLeft size={22} className={isRtl ? 'rotate-0' : 'rotate-180'} />
            <span className="text-[9px] font-black uppercase tracking-wider">{isRtl ? 'رجوع' : 'Back'}</span>
          </button>
          
          <button 
            onClick={() => setShowMobilePreview(true)}
            className="flex flex-col items-center gap-1.5 px-10 py-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Eye size={22} />
            <span className="text-[9px] font-black uppercase tracking-wider">{isRtl ? 'معاينة' : 'Preview'}</span>
          </button>

          <button 
            onClick={() => onSave(template)}
            className="flex flex-col items-center gap-1.5 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
          >
            <Save size={22} />
            <span className="text-[9px] font-black uppercase tracking-wider">{isRtl ? 'حفظ' : 'Save'}</span>
          </button>
        </div>
      </nav>

      {showMobilePreview && (
        <div className="fixed inset-0 z-[250] bg-black/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in lg:hidden">
           <div className="absolute inset-0" onClick={() => setShowMobilePreview(false)}></div>
           <div className="relative w-full max-w-[320px] bg-white dark:bg-gray-900 rounded-[4rem] shadow-2xl flex flex-col overflow-hidden animate-bounce-in border-[4px] border-white dark:border-gray-800">
              <div className="flex items-center justify-between p-6 pb-2 border-b border-gray-100 dark:border-white/5">
                 <h3 className="text-gray-900 dark:text-white font-black uppercase text-[10px] tracking-[0.2em]">{isRtl ? 'معاينة القالب' : 'Template Preview'}</h3>
                 <button onClick={() => setShowMobilePreview(false)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><X size={20}/></button>
              </div>
              <div className="flex-1 no-scrollbar overflow-y-auto overflow-x-hidden py-4 px-2">
                 <PreviewContent isMobileView={true} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TemplateBuilder;
