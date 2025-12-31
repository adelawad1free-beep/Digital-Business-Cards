
import React, { useState } from 'react';
import { CustomTemplate, TemplateConfig, Language, CardData } from '../types';
import { TRANSLATIONS, SAMPLE_DATA } from '../constants';
import CardPreview from './CardPreview';
import { 
  Save, Layout, Smartphone, 
  Layers, Move, Check, X, 
  Zap, AlignCenter, 
  Circle, Box, Loader2,
  Type as TypographyIcon, Ruler,
  Star, Hash, ArrowLeft, Globe
} from 'lucide-react';

interface TemplateBuilderProps {
  lang: Language;
  onSave: (template: CustomTemplate) => void;
  onCancel?: () => void;
  initialTemplate?: CustomTemplate;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({ lang, onSave, onCancel, initialTemplate }) => {
  const isRtl = lang === 'ar';
  const [loading, setLoading] = useState(false);
  
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
      bioSize: 12
    }
  });

  const updateConfig = (key: keyof TemplateConfig, value: any) => {
    setTemplate(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
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
      {/* Header Actions - More Compact */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50/50 dark:bg-white/5 p-4 rounded-[2.5rem] border border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-4">
          <button 
            type="button"
            onClick={onCancel} 
            className="p-3 bg-white dark:bg-gray-800 text-gray-400 hover:text-red-500 rounded-xl border border-gray-100 dark:border-gray-700 transition-all"
          >
            <ArrowLeft size={18} className={isRtl ? 'rotate-180' : ''} />
          </button>
          <div>
            <h2 className="text-xl font-black dark:text-white tracking-tight">{isRtl ? 'تعديل القالب' : 'Template Editor'}</h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{template.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleSave} 
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {isRtl ? 'حفظ القالب' : 'Save Template'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* Main Controls */}
        <div className="flex-1 space-y-6 w-full lg:max-w-[700px]">
          
          {/* Section: General Info */}
          <div className="bg-white dark:bg-[#15151a] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Card Name (AR)</label>
                <input type="text" value={template.nameAr} onChange={e => setTemplate({...template, nameAr: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">Card Name (EN)</label>
                <input type="text" value={template.nameEn} onChange={e => setTemplate({...template, nameEn: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500/20" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-50 dark:border-gray-800">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2">{isRtl ? 'الترتيب' : 'Order'}</label>
                 <div className="relative">
                    <Hash className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-300`} size={16} />
                    <input 
                      type="number" value={template.order} 
                      onChange={e => setTemplate({...template, order: parseInt(e.target.value) || 0})} 
                      className={`w-full ${isRtl ? 'pr-10' : 'pl-10'} py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 font-black text-sm outline-none`}
                    />
                 </div>
              </div>
              <div className="flex items-center gap-2 pt-5">
                 <button 
                   type="button"
                   onClick={() => setTemplate({...template, isFeatured: !template.isFeatured})}
                   className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-black text-[9px] uppercase ${template.isFeatured ? 'bg-amber-500 border-amber-500 text-white' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'}`}
                 >
                    <Star size={14} fill={template.isFeatured ? "currentColor" : "none"} />
                    {isRtl ? 'مميز' : 'Featured'}
                 </button>
                 <button 
                   type="button"
                   onClick={() => setTemplate({...template, isActive: !template.isActive})}
                   className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-black text-[9px] uppercase ${template.isActive ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-400'}`}
                 >
                    <Check size={14} />
                    {isRtl ? 'نشط' : 'Active'}
                 </button>
              </div>
            </div>
          </div>

          <ControlGroup title={isRtl ? 'الترويسة' : 'Header'} icon={Layout}>
            <div className="flex gap-3">
              <OptionBtn active={template.config.headerType === 'classic'} onClick={() => updateConfig('headerType', 'classic')} icon={Layout}>{isRtl ? 'كلاسيك' : 'Classic'}</OptionBtn>
              <OptionBtn active={template.config.headerType === 'split'} onClick={() => updateConfig('headerType', 'split')} icon={Smartphone}>{isRtl ? 'منقسم' : 'Split'}</OptionBtn>
              <OptionBtn active={template.config.headerType === 'overlay'} onClick={() => updateConfig('headerType', 'overlay')} icon={Layers}>{isRtl ? 'متداخل' : 'Overlay'}</OptionBtn>
              <OptionBtn active={template.config.headerType === 'minimal'} onClick={() => updateConfig('headerType', 'minimal')} icon={Zap}>{isRtl ? 'بسيط' : 'Minimal'}</OptionBtn>
            </div>
            <RangeControl 
              label={isRtl ? 'الارتفاع' : 'Height'} 
              min={80} max={400} value={template.config.headerHeight} 
              onChange={(v: number) => updateConfig('headerHeight', v)} 
            />
          </ControlGroup>

          <ControlGroup title={isRtl ? 'الصورة' : 'Avatar'} icon={Circle}>
            <div className="flex gap-3">
              <OptionBtn active={template.config.avatarStyle === 'circle'} onClick={() => updateConfig('avatarStyle', 'circle')} icon={Circle}>{isRtl ? 'دائري' : 'Circle'}</OptionBtn>
              <OptionBtn active={template.config.avatarStyle === 'squircle'} onClick={() => updateConfig('avatarStyle', 'squircle')} icon={Box}>{isRtl ? 'منحنٍ' : 'Squircle'}</OptionBtn>
              <OptionBtn active={template.config.avatarStyle === 'none'} onClick={() => updateConfig('avatarStyle', 'none')} icon={X}>{isRtl ? 'إخفاء' : 'Hidden'}</OptionBtn>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RangeControl label={isRtl ? 'الحجم' : 'Size'} min={60} max={250} value={template.config.avatarSize} onChange={(v: number) => updateConfig('avatarSize', v)} />
              <RangeControl label={isRtl ? 'إزاحة (رأسي)' : 'Y Offset'} min={-150} max={150} value={template.config.avatarOffsetY} onChange={(v: number) => updateConfig('avatarOffsetY', v)} />
            </div>
          </ControlGroup>

          <ControlGroup title={isRtl ? 'التموضع' : 'Positioning'} icon={Move}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
               <RangeControl label={isRtl ? 'الاسم' : 'Name'} min={-150} max={150} value={template.config.nameOffsetY} onChange={(v: number) => updateConfig('nameOffsetY', v)} />
               <RangeControl label={isRtl ? 'النبذة' : 'Bio'} min={-150} max={150} value={template.config.bioOffsetY} onChange={(v: number) => updateConfig('bioOffsetY', v)} />
               <RangeControl label={isRtl ? 'البريد' : 'Email'} min={-150} max={150} value={template.config.emailOffsetY} onChange={(v: number) => updateConfig('emailOffsetY', v)} />
               <RangeControl label={isRtl ? 'الموقع' : 'Website'} min={-150} max={150} value={template.config.websiteOffsetY} onChange={(v: number) => updateConfig('websiteOffsetY', v)} />
               <RangeControl label={isRtl ? 'الأزرار' : 'Buttons'} min={-150} max={150} value={template.config.contactButtonsOffsetY} onChange={(v: number) => updateConfig('contactButtonsOffsetY', v)} />
               <RangeControl label={isRtl ? 'التواصل' : 'Socials'} min={-150} max={150} value={template.config.socialLinksOffsetY} onChange={(v: number) => updateConfig('socialLinksOffsetY', v)} />
            </div>
          </ControlGroup>

          <ControlGroup title={isRtl ? 'النصوص' : 'Typography'} icon={TypographyIcon}>
            <div className="grid grid-cols-2 gap-4">
              <RangeControl label={isRtl ? 'حجم الاسم' : 'Name Size'} min={16} max={48} value={template.config.nameSize} onChange={(v: number) => updateConfig('nameSize', v)} />
              <RangeControl label={isRtl ? 'حجم النبذة' : 'Bio Size'} min={8} max={20} value={template.config.bioSize} onChange={(v: number) => updateConfig('bioSize', v)} />
            </div>
            <div className="flex gap-2">
               <OptionBtn active={template.config.contentAlign === 'start'} onClick={() => updateConfig('contentAlign', 'start')} icon={AlignCenter}>{isRtl ? 'بداية' : 'Start'}</OptionBtn>
               <OptionBtn active={template.config.contentAlign === 'center'} onClick={() => updateConfig('contentAlign', 'center')} icon={AlignCenter}>{isRtl ? 'وسط' : 'Center'}</OptionBtn>
               <OptionBtn active={template.config.contentAlign === 'end'} onClick={() => updateConfig('contentAlign', 'end')} icon={AlignCenter}>{isRtl ? 'نهاية' : 'End'}</OptionBtn>
            </div>
          </ControlGroup>
        </div>

        {/* Live Preview Sidebar - Sticky with padding */}
        <div className="w-full lg:w-[380px] shrink-0">
           <div className="sticky top-24 space-y-6">
              <div className="flex items-center justify-center gap-3 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-full font-black text-[10px] uppercase border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                {isRtl ? 'معاينة مباشرة' : 'Live Engineering'}
              </div>

              <div className="relative w-full max-w-[320px] mx-auto transform scale-[0.9] origin-top">
                <div className="relative bg-[#0a0a0c] rounded-[4rem] p-3 border-[10px] border-[#0a0a0c] shadow-2xl">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#0a0a0c] rounded-b-[1.5rem] z-[100]" />
                  <div className="bg-white dark:bg-gray-950 rounded-[3rem] overflow-hidden min-h-[580px] max-h-[680px] overflow-y-auto no-scrollbar">
                    <div className="animate-fade-in" key={JSON.stringify(template.config)}>
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
    </div>
  );
};

export default TemplateBuilder;
