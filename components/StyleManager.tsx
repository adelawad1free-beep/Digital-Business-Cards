
import React, { useState, useEffect, useRef } from 'react';
import { VisualStyle, Language, TemplateConfig, ThemeType } from '../types';
import { getAllVisualStyles, saveVisualStyle, deleteVisualStyle, auth, ADMIN_EMAIL } from '../services/firebase';
import { THEME_GRADIENTS, THEME_COLORS, BACKGROUND_PRESETS, PATTERN_PRESETS, SVG_PRESETS } from '../constants';
import { uploadImageToCloud } from '../services/uploadService';
import CardPreview from './CardPreview';
import { 
  Palette, Plus, Save, Trash2, Edit3, X, Loader2, Sparkles, 
  Sun, Moon, Pipette, ImageIcon, UploadCloud, CheckCircle2, 
  LayoutGrid, ToggleLeft, ToggleRight, Search, SlidersHorizontal, 
  GlassWater, Box, Type, LayoutTemplate, Layers, ChevronLeft, 
  ChevronRight, Monitor, Zap, Wind, Waves, Square, AlignLeft, 
  AlignRight, Columns, Minus, Maximize2, Move, FileCode, HardDrive, Code2, Wand2, Grid, Shapes,
  Check, RefreshCcw, Info, AlignCenter, Tag, Ruler
} from 'lucide-react';

interface StyleManagerProps {
  lang: Language;
}

const StyleManager: React.FC<StyleManagerProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const bgInputRef = useRef<HTMLInputElement>(null);
  const headerAssetInputRef = useRef<HTMLInputElement>(null);
  
  const [styles, setStyles] = useState<VisualStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStyle, setEditingStyle] = useState<Partial<VisualStyle> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [searchTerm, setSearching] = useState('');
  const [styleToDelete, setStyleToDelete] = useState<string | null>(null);

  const t = (ar: string, en: string) => isRtl ? ar : en;

  useEffect(() => {
    if (auth.currentUser && auth.currentUser.email === ADMIN_EMAIL) {
      fetchStyles();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchStyles = async () => {
    setLoading(true);
    try {
      const data = await getAllVisualStyles();
      setStyles(data);
    } catch (e) {
      console.error("Style fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStyle({
      nameAr: t('نمط مبتكر جديد', 'New Innovative Style'),
      nameEn: 'New Innovative Style',
      isActive: true,
      config: {
        headerType: 'classic',
        headerHeight: 180,
        defaultThemeType: 'gradient',
        defaultThemeColor: '#2563eb',
        defaultThemeGradient: THEME_GRADIENTS[0],
        nameColor: '#111827',
        titleColor: '#2563eb',
        linksColor: '#3b82f6',
        socialIconsColor: '#3b82f6',
        bioTextColor: 'rgba(0,0,0,0.6)',
        bioBgColor: 'rgba(0,0,0,0.03)',
        defaultIsDark: false,
        headerGlassy: false,
        bodyGlassy: false,
        headerOpacity: 100,
        bodyOpacity: 100,
        contentAlign: 'center',
        avatarStyle: 'circle',
        avatarSize: 120,
        headerPatternId: 'none',
        headerPatternOpacity: 20,
        headerPatternScale: 100,
        bodyBorderRadius: 48,
        bodyOffsetY: 0
      }
    });
  };

  const handleSave = async () => {
    if (!editingStyle?.nameAr || !editingStyle?.nameEn) {
      alert(isRtl ? "يرجى إدخال اسم النمط" : "Please enter style name");
      return;
    }
    setIsSaving(true);
    try {
      await saveVisualStyle(editingStyle);
      setEditingStyle(null);
      await fetchStyles();
    } catch (e) {
      alert("Error saving style");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!styleToDelete) return;
    setLoading(true);
    try {
      await deleteVisualStyle(styleToDelete);
      setStyleToDelete(null);
      await fetchStyles();
    } catch (e) {
      alert("Error deleting style");
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (key: keyof TemplateConfig, value: any) => {
    setEditingStyle(prev => ({
      ...prev,
      config: { ...prev?.config, [key]: value }
    }));
  };

  const handleAssetUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAsset(true);
    try {
      const b = await uploadImageToCloud(file);
      if (b) {
        updateConfig('headerCustomAsset', b);
        updateConfig('headerType', 'custom-asset');
      }
    } finally {
      setUploadingAsset(false);
    }
  };

  const RangeControl = ({ label, value, min, max, onChange, icon: Icon, unit = "px" }: any) => (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
           {Icon && <Icon size={14} className="text-indigo-600" />}
           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        </div>
        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
    </div>
  );

  const ColorInput = ({ label, value, onChange }: any) => (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden border shadow-sm">
          <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
          <div className="w-full h-full" style={{ backgroundColor: value }} />
        </div>
        <input type="text" value={value} onChange={e => onChange(e.target.value)} className="bg-transparent border-none outline-none font-mono text-[10px] font-black w-20 text-center dark:text-gray-400" />
      </div>
    </div>
  );

  const ToggleSwitch = ({ label, value, onChange, icon: Icon }: any) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={16} className={value ? "text-indigo-600" : "text-gray-300"} />}
        <span className={`text-[10px] font-black uppercase tracking-widest ${value ? 'dark:text-white' : 'text-gray-400'}`}>{label}</span>
      </div>
      <button onClick={() => onChange(!value)} className={`w-12 h-6 rounded-full relative transition-all ${value ? 'bg-indigo-600 shadow-md' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (value ? 'right-7' : 'right-1') : (value ? 'left-7' : 'left-1')}`} />
      </button>
    </div>
  );

  const labelTextClasses = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 block mb-1.5";
  const inputClasses = "w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/20 transition-all shadow-inner";

  if (loading && !editingStyle && !styleToDelete) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-indigo-600 mb-4" size={40} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('جاري تحميل الأنماط...', 'Loading Styles...')}</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-32">
      {!editingStyle ? (
        <>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-600/20">
                <LayoutTemplate size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black dark:text-white leading-none mb-1">{t('مختبر الترويسات والأنماط', 'Header & Style Lab')}</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('ابتكر أشكال ترويسات هندسية فريدة للمنصة', 'Create unique geometric header shapes')}</p>
              </div>
            </div>
            <button 
              onClick={handleCreate}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={18} /> {t('ابتكار نمط جديد', 'Design New Style')}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
            <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <Search className="text-indigo-600" size={20} />
                <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('مكتبة الأنماط المبتكرة', 'Innovative Styles Library')}</h4>
              </div>
              <div className="relative w-full md:w-80">
                <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearching(e.target.value)} 
                  placeholder={t('ابحث في الأنماط...', 'Search lab...')} 
                  className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all`} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
              {styles.filter(s => (isRtl ? s.nameAr : s.nameEn).toLowerCase().includes(searchTerm.toLowerCase())).map(style => (
                <div key={style.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 p-6 group hover:shadow-xl transition-all">
                  <div className="relative h-44 w-full rounded-3xl mb-6 shadow-inner border-4 border-white dark:border-gray-700 overflow-hidden bg-white dark:bg-black">
                     <div className="absolute inset-0 scale-[0.6] origin-top">
                        <CardPreview 
                          data={{ 
                            name: '', title: '', company: '', bio: '', email: '', phone: '', whatsapp: '', website: '', location: '', locationUrl: '', profileImage: '', isDark: style.config.defaultIsDark || false, socialLinks: [],
                            themeType: style.config.defaultThemeType || 'gradient',
                            themeColor: style.config.defaultThemeColor || '#2563eb',
                            themeGradient: style.config.defaultThemeGradient || THEME_GRADIENTS[0],
                            backgroundImage: style.config.defaultBackgroundImage || '',
                            templateId: 'preview'
                          } as any} 
                          lang={lang} 
                          customConfig={style.config as TemplateConfig} 
                          hideSaveButton={true} 
                        />
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-start mb-6 px-2">
                    <div>
                      <h3 className="text-lg font-black dark:text-white leading-none mb-1">{isRtl ? style.nameAr : style.nameEn}</h3>
                      <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{style.config.headerType}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${style.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>
                      {style.isActive ? t('نشط', 'Active') : t('معطل', 'Inactive')}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingStyle(style)}
                      className="flex-1 py-3 bg-white dark:bg-gray-900 text-blue-600 rounded-2xl font-black text-[10px] uppercase border shadow-sm hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 size={14} /> {t('تعديل النمط', 'Edit Design')}
                    </button>
                    <button 
                      onClick={() => setStyleToDelete(style.id)}
                      className="p-3 bg-white dark:bg-gray-900 text-red-500 rounded-2xl border shadow-sm hover:bg-red-50 hover:text-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <button onClick={() => setEditingStyle(null)} className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border hover:bg-red-50 hover:text-red-500 transition-colors"><X size={20}/></button>
                 <div>
                    <h2 className="text-2xl font-black dark:text-white leading-none mb-1">{t('مختبر هندسة الأنماط المتقدم', 'Advanced Style Geometry Lab')}</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{editingStyle.id || 'Draft'}</p>
                 </div>
              </div>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="px-12 py-4 bg-indigo-600 text-white rounded-[1.8rem] font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={18} />} {t('اعتماد النمط في المختبر', 'Authorize Style')}
              </button>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-8">
                 {/* 0. هوية النمط (Style Identity) */}
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4"><Tag className="text-indigo-600" size={24}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('تعريف النمط المبتكر', 'Style Identity & Naming')}</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className={labelTextClasses}>{t('اسم النمط (عربي)', 'Style Name (AR)')}</label>
                          <input 
                            type="text" 
                            required 
                            value={editingStyle.nameAr || ''} 
                            onChange={e => setEditingStyle({...editingStyle, nameAr: e.target.value})} 
                            className={inputClasses} 
                            placeholder="مثلاً: الترويسة الزجاجية المتموجة"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className={labelTextClasses}>{t('اسم النمط (EN)', 'Style Name (EN)')}</label>
                          <input 
                            type="text" 
                            required 
                            value={editingStyle.nameEn || ''} 
                            onChange={e => setEditingStyle({...editingStyle, nameEn: e.target.value})} 
                            className={inputClasses} 
                            placeholder="Ex: Glassy Wave Header"
                          />
                       </div>
                    </div>
                 </div>

                 {/* 1. قص الترويسة الهندسي (Shape Engine) */}
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4"><Shapes className="text-indigo-600" size={24}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('محرك هندسة الترويسات', 'Structural Shape Engine')}</h3></div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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
                            className={`py-4 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${editingStyle.config?.headerType === item.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg scale-105' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                           >
                             <item.icon size={20} /> 
                             <span className="text-[7px] font-black uppercase text-center leading-tight">{t(item.label, item.id)}</span>
                           </button>
                         ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <RangeControl label={t('ارتفاع الترويسة', 'Header Depth')} min={40} max={1000} value={editingStyle.config?.headerHeight || 180} onChange={(v: number) => updateConfig('headerHeight', v)} icon={Maximize2} />
                      <ToggleSwitch label={t('ترويسة زجاجية', 'Glassy Header')} value={editingStyle.config?.headerGlassy} onChange={(v: boolean) => updateConfig('headerGlassy', v)} icon={GlassWater} />
                    </div>
                 </div>

                 {/* 2. هندسة جسم البطاقة (Body Geometry) */}
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4"><Box className="text-indigo-600" size={24}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('هندسة إطار البيانات', 'Body Geometry & Effects')}</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <ToggleSwitch label={t('تأثير زجاجي فاخر للجسم', 'Glassmorphism Body')} value={editingStyle.config?.bodyGlassy} onChange={(v: boolean) => updateConfig('bodyGlassy', v)} icon={GlassWater} />
                       <RangeControl label={t('درجة شفافية الجسم', 'Body Transparency')} min={0} max={100} unit="%" value={editingStyle.config?.bodyOpacity ?? 100} onChange={(v: number) => updateConfig('bodyOpacity', v)} icon={Sun} />
                       <RangeControl label={t('إزاحة منطقة البيانات', 'Overlap Y Offset')} min={-1000} max={500} value={editingStyle.config?.bodyOffsetY || 0} onChange={(v: number) => updateConfig('bodyOffsetY', v)} icon={Move} />
                       <RangeControl label={t('انحناء زوايا الجسم', 'Border Radius')} min={0} max={120} value={editingStyle.config?.bodyBorderRadius ?? 48} onChange={(v: number) => updateConfig('bodyBorderRadius', v)} icon={Ruler} />
                    </div>
                 </div>

                 {/* 3. الأنماط الهندسية (The Patterns) */}
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-4"><Grid className="text-indigo-600" size={24}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('معرض الأنماط التكرارية', 'Pattern Overlay Gallery')}</h3></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                       {PATTERN_PRESETS.map(pattern => (
                         <button 
                           key={pattern.id}
                           onClick={() => updateConfig('headerPatternId', pattern.id)}
                           className={`group relative aspect-square rounded-2xl border-2 transition-all overflow-hidden bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center gap-2 ${editingStyle.config?.headerPatternId === pattern.id ? 'border-indigo-600 ring-4 ring-indigo-500/10 scale-105' : 'border-gray-100 dark:border-gray-700 hover:border-indigo-200'}`}
                         >
                            {pattern.id !== 'none' ? (
                              <div 
                                className="w-full h-full opacity-60 group-hover:opacity-100 transition-opacity" 
                                style={{ 
                                  backgroundImage: `url("data:image/svg+xml;base64,${window.btoa(pattern.svg.replace('currentColor', '#3b82f6'))}")`,
                                  backgroundSize: '20px 20px'
                                }}
                              />
                            ) : (
                              <RefreshCcw size={20} className="text-gray-300" />
                            )}
                            <span className="absolute bottom-1 text-[7px] font-black uppercase dark:text-gray-400">{pattern.name}</span>
                         </button>
                       ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <RangeControl label={t('شفافية النمط', 'Pattern Opacity')} min={0} max={100} unit="%" value={editingStyle.config?.headerPatternOpacity ?? 20} onChange={(v: number) => updateConfig('headerPatternOpacity', v)} icon={Sun} />
                       <RangeControl label={t('حجم النمط', 'Pattern Scale')} min={20} max={300} unit="%" value={editingStyle.config?.headerPatternScale ?? 100} onChange={(v: number) => updateConfig('headerPatternScale', v)} icon={Maximize2} />
                    </div>
                 </div>

                 {/* 4. الألوان والسمة */}
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-8">
                    <div className="flex items-center gap-4"><Sparkles className="text-indigo-600" size={24}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('البصمة الوراثية للسمة', 'Visual DNA')}</h3></div>
                    <div className="grid grid-cols-3 gap-3 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl">
                       {(['color', 'gradient', 'image'] as ThemeType[]).map(type => (
                         <button key={type} onClick={() => updateConfig('defaultThemeType', type)} className={`py-3 rounded-xl transition-all flex flex-col items-center gap-1 ${editingStyle.config?.defaultThemeType === type ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                           {type === 'color' ? <Palette size={18}/> : type === 'gradient' ? <Sparkles size={18}/> : <ImageIcon size={18}/>}
                           <span className="text-[9px] font-black uppercase tracking-widest">{t(type, type.toUpperCase())}</span>
                         </button>
                       ))}
                    </div>
                 </div>
              </div>

              {/* 5. المعاينة الحية */}
              <div className="lg:col-span-4 sticky top-[100px] self-start space-y-6">
                 <div className="bg-white dark:bg-[#050507] p-5 rounded-[4rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden relative">
                    <div className="mb-6 flex items-center justify-between px-4">
                       <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('معاينة حية', 'Live Preview')}</span>
                       </div>
                       <Zap size={14} className="text-indigo-600" />
                    </div>
                    <div className="transition-all duration-500 border-[10px] border-gray-900 dark:border-gray-800 rounded-[3.5rem] shadow-2xl overflow-hidden mx-auto bg-white dark:bg-black w-full">
                       <div className="h-[550px] themed-scrollbar scroll-smooth relative">
                          <CardPreview 
                            data={{ 
                               name: isRtl ? 'معاينة النمط الزجاجي' : 'Glassy DNA Preview',
                               title: t('تأثير شفاف مذهل', 'Stunning Transparency'),
                               company: 'NEXT-ID PREMIUM',
                               bio: t('تم تفعيل التأثير الزجاجي الفاخر. يمنح هذا التصميم البطاقة عمقاً استثنائياً وشفافية تجذب الأنظار.', 'Premium Glassmorphism activated. This design gives the card exceptional depth and eye-catching transparency.'),
                               themeType: 'image',
                               themeColor: editingStyle.config?.defaultThemeColor || '#2563eb',
                               themeGradient: editingStyle.config?.defaultThemeGradient || THEME_GRADIENTS[0],
                               backgroundImage: BACKGROUND_PRESETS[1],
                               isDark: editingStyle.config?.defaultIsDark || false,
                               socialLinks: [
                                  { platformId: 'linkedin', platform: 'LinkedIn', url: '#' }
                               ],
                               templateId: 'lab-preview'
                            } as any} 
                            lang={lang} 
                            customConfig={editingStyle.config as TemplateConfig} 
                            hideSaveButton={true} 
                          />
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {styleToDelete && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[360px] rounded-[3.5rem] p-10 text-center shadow-2xl border border-gray-100 dark:border-gray-800 animate-fade-in">
             <Trash2 size={48} className="mx-auto text-red-500 mb-6" />
             <h3 className="text-2xl font-black mb-4 dark:text-white">{t('تدمير النمط', 'Destroy DNA')}</h3>
             <p className="text-sm font-bold text-gray-400 mb-10 leading-relaxed">{t('هل أنت متأكد من تدمير هذا النمط المبتكر؟', 'Are you sure you want to destroy this DNA?')}</p>
             <div className="flex flex-col gap-3">
               <button onClick={handleDelete} className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase shadow-xl shadow-red-500/20 active:scale-95 transition-all">تأكيد الحذف</button>
               <button onClick={() => setStyleToDelete(null)} className="py-5 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-3xl font-black text-sm uppercase">تراجع</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StyleManager;
