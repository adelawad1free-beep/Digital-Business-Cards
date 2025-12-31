
import React, { useState, useRef } from 'react';
import { CustomTemplate, TemplateConfig, Language, CardData } from '../types';
import { TRANSLATIONS, SAMPLE_DATA, THEME_COLORS, THEME_GRADIENTS } from '../constants';
import { uploadImageToCloud } from '../services/uploadService';
import CardPreview from './CardPreview';
import { 
  Save, Layout, Smartphone, 
  Layers, Move, Check, X, 
  Zap, AlignCenter, 
  Circle, Box, Loader2,
  Type as TypographyIcon, Ruler,
  Star, Hash, ArrowLeft, Palette, Sparkles, Image as ImageIcon, UploadCloud, Sun, Moon, Pipette
} from 'lucide-react';

interface TemplateBuilderProps {
  lang: Language;
  onSave: (template: CustomTemplate) => void;
  onCancel?: () => void;
  initialTemplate?: CustomTemplate;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ lang, onSave, onCancel, initialTemplate }) => {
  const isRtl = lang === 'ar';
  // Fix: Modified t function to support optional second argument for manual translations (ar/en)
  const t = (key: string, enVal?: string) => {
    if (enVal) return isRtl ? key : enVal;
    return TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;
  };
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  
  const [template, setTemplate] = useState<CustomTemplate>(initialTemplate || {
    id: `custom_${Date.now()}`,
    nameAr: 'قالب جديد مخصص',
    nameEn: 'New Custom Template',
    descAr: 'وصف القالب الجديد',
    descEn: 'Description of the new template',
    isActive: true,
    isFeatured: false,
    order: 0,
    createdAt: new Date().toISOString(),
    config: {
      headerType: 'classic',
      headerHeight: 160,
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
      nameSize: 24,
      bioSize: 12,
      // القيم الافتراضية للمظهر
      defaultThemeType: 'gradient',
      defaultThemeColor: THEME_COLORS[0],
      defaultThemeGradient: THEME_GRADIENTS[0],
      defaultIsDark: false
    }
  });

  const updateConfig = (key: keyof TemplateConfig, value: any) => {
    setTemplate(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const base64Image = await uploadImageToCloud(file);
      if (base64Image) updateConfig('defaultBackgroundImage', base64Image);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(template);
    } finally {
      setLoading(false);
    }
  };

  const sampleCardData = (SAMPLE_DATA[lang] || SAMPLE_DATA['en']) as CardData;

  const ControlGroup = ({ title, children, icon: Icon }: any) => (
    <div className="bg-white dark:bg-[#15151a] p-5 md:p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
      <div className="flex items-center gap-3 pb-3 border-b border-gray-50 dark:border-gray-800/50">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
          <Icon size={18} />
        </div>
        <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">{title}</h4>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );

  const RangeControl = ({ label, value, min, max, onChange, unit = "px" }: any) => (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">{value}{unit}</span>
      </div>
      <input 
        type="range" min={min} max={max} value={value} 
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </div>
  );

  const OptionBtn = ({ active, onClick, children, icon: Icon }: any) => (
    <button 
      type="button"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-2 group flex-1 ${active ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/10' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400 hover:border-blue-200 dark:hover:border-blue-900/30'}`}
    >
      <Icon size={20} className={active ? 'text-white' : 'group-hover:text-blue-500'} />
      <span className="text-[9px] font-black uppercase tracking-widest">{children}</span>
    </button>
  );

  return (
    <div className="animate-fade-in-up max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50/50 dark:bg-white/5 p-4 rounded-[2.5rem] border border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-4">
          <button type="button" onClick={onCancel} className="p-3 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-xl border border-gray-100 dark:border-gray-700 transition-all">
            <ArrowLeft size={18} className={isRtl ? 'rotate-180' : ''} />
          </button>
          <div>
            <h2 className="text-xl font-black dark:text-white tracking-tight">{t('editTemplate')}</h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{template.id}</p>
          </div>
        </div>
        <button type="button" onClick={handleSave} disabled={loading} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-xl flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} {t('saveTemplate')}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        <div className="flex-1 space-y-6 w-full lg:max-w-[700px]">
          
          <ControlGroup title={t('appearance')} icon={Palette}>
             <div className="flex gap-2 mb-4">
                <button onClick={() => updateConfig('defaultThemeType', 'color')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 border-2 transition-all ${template.config.defaultThemeType === 'color' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'}`}><Palette size={14}/> {t('color')}</button>
                <button onClick={() => updateConfig('defaultThemeType', 'gradient')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 border-2 transition-all ${template.config.defaultThemeType === 'gradient' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'}`}><Sparkles size={14}/> {t('gradient')}</button>
                <button onClick={() => updateConfig('defaultThemeType', 'image')} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2 border-2 transition-all ${template.config.defaultThemeType === 'image' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'}`}><ImageIcon size={14}/> {t('image')}</button>
             </div>

             {template.config.defaultThemeType === 'color' && (
                <div className="flex flex-wrap gap-2 justify-center">
                   {THEME_COLORS.map(c => (
                     <button key={c} onClick={() => updateConfig('defaultThemeColor', c)} className={`w-8 h-8 rounded-full border-2 ${template.config.defaultThemeColor === c ? 'border-blue-500 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                   ))}
                </div>
             )}
             
             {template.config.defaultThemeType === 'gradient' && (
                <div className="flex flex-wrap gap-2 justify-center">
                   {THEME_GRADIENTS.map((g, i) => (
                     <button key={i} onClick={() => updateConfig('defaultThemeGradient', g)} className={`w-10 h-10 rounded-xl border-2 ${template.config.defaultThemeGradient === g ? 'border-blue-500 scale-110' : 'border-transparent'}`} style={{ background: g }} />
                   ))}
                </div>
             )}

             {template.config.defaultThemeType === 'image' && (
                <div className="space-y-4">
                   <div className="flex gap-2">
                      <input type="file" ref={bgFileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                      <button onClick={() => bgFileInputRef.current?.click()} className="flex-1 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 text-[10px] font-black text-blue-600 flex items-center justify-center gap-2 uppercase">
                        {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} {t('upload')}
                      </button>
                      <input type="text" value={template.config.defaultBackgroundImage || ''} onChange={e => updateConfig('defaultBackgroundImage', e.target.value)} placeholder="URL..." className="flex-[2] bg-gray-50 dark:bg-gray-900 px-4 py-3 rounded-xl text-[10px] font-bold border border-gray-100 dark:border-gray-800 outline-none" />
                   </div>
                </div>
             )}

             <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-center">
                <button onClick={() => updateConfig('defaultIsDark', !template.config.defaultIsDark)} className={`px-6 py-2.5 rounded-xl border-2 transition-all flex items-center gap-2 font-black text-[9px] uppercase ${template.config.defaultIsDark ? 'bg-gray-900 border-gray-900 text-yellow-400' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                   {template.config.defaultIsDark ? <Moon size={14}/> : <Sun size={14}/>}
                   {/* Fix: Usage of t with two arguments now supported by redefined t function */}
                   {template.config.defaultIsDark ? t('ليلي', 'Dark') : t('نهاري', 'Light')}
                </button>
             </div>
          </ControlGroup>

          <ControlGroup title={t('header')} icon={Layout}>
            <div className="flex gap-3">
              <OptionBtn active={template.config.headerType === 'classic'} onClick={() => updateConfig('headerType', 'classic')} icon={Layout}>{t('classic')}</OptionBtn>
              <OptionBtn active={template.config.headerType === 'split'} onClick={() => updateConfig('headerType', 'split')} icon={Smartphone}>{t('split')}</OptionBtn>
              <OptionBtn active={template.config.headerType === 'overlay'} onClick={() => updateConfig('headerType', 'overlay')} icon={Layers}>{t('overlay')}</OptionBtn>
              <OptionBtn active={template.config.headerType === 'minimal'} onClick={() => updateConfig('headerType', 'minimal')} icon={Zap}>{t('minimal')}</OptionBtn>
            </div>
            <RangeControl label={t('height')} min={80} max={400} value={template.config.headerHeight} onChange={(v: number) => updateConfig('headerHeight', v)} />
          </ControlGroup>

          <ControlGroup title={t('avatar')} icon={Circle}>
            <div className="flex gap-3">
              <OptionBtn active={template.config.avatarStyle === 'circle'} onClick={() => updateConfig('avatarStyle', 'circle')} icon={Circle}>{t('circle')}</OptionBtn>
              <OptionBtn active={template.config.avatarStyle === 'squircle'} onClick={() => updateConfig('avatarStyle', 'squircle')} icon={Box}>{t('squircle')}</OptionBtn>
              <OptionBtn active={template.config.avatarStyle === 'none'} onClick={() => updateConfig('avatarStyle', 'none')} icon={X}>{t('hidden')}</OptionBtn>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RangeControl label={t('size')} min={60} max={250} value={template.config.avatarSize} onChange={(v: number) => updateConfig('avatarSize', v)} />
              <RangeControl label={t('yOffset')} min={-150} max={150} value={template.config.avatarOffsetY} onChange={(v: number) => updateConfig('avatarOffsetY', v)} />
            </div>
          </ControlGroup>

          <ControlGroup title={t('positioning')} icon={Move}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
               <RangeControl label={t('name')} min={-150} max={150} value={template.config.nameOffsetY} onChange={(v: number) => updateConfig('nameOffsetY', v)} />
               <RangeControl label={t('bio')} min={-150} max={150} value={template.config.bioOffsetY} onChange={(v: number) => updateConfig('bioOffsetY', v)} />
               <RangeControl label={t('email')} min={-150} max={150} value={template.config.emailOffsetY} onChange={(v: number) => updateConfig('emailOffsetY', v)} />
               <RangeControl label={t('website')} min={-150} max={150} value={template.config.websiteOffsetY} onChange={(v: number) => updateConfig('websiteOffsetY', v)} />
               <RangeControl label={t('buttons')} min={-150} max={150} value={template.config.contactButtonsOffsetY} onChange={(v: number) => updateConfig('contactButtonsOffsetY', v)} />
               <RangeControl label={t('socialLinks')} min={-150} max={150} value={template.config.socialLinksOffsetY} onChange={(v: number) => updateConfig('socialLinksOffsetY', v)} />
            </div>
          </ControlGroup>
        </div>

        <div className="w-full lg:w-[380px] shrink-0">
           <div className="sticky top-24 space-y-6">
              <div className="relative w-full max-w-[320px] mx-auto transform scale-[0.9] origin-top">
                <div className="relative bg-[#0a0a0c] rounded-[4rem] p-3 border-[10px] border-[#0a0a0c] shadow-2xl">
                  <div className="bg-white dark:bg-gray-950 rounded-[3rem] overflow-hidden min-h-[580px] max-h-[680px] overflow-y-auto no-scrollbar">
                    <CardPreview 
                       data={{ ...sampleCardData, templateId: template.id }} 
                       lang={lang} 
                       customConfig={template.config} 
                    />
                  </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBuilder;
