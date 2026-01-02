
import React, { useEffect, useState } from 'react';
import { Language, CardData, CustomTemplate, TemplateCategory } from '../types';
import { TRANSLATIONS, SAMPLE_DATA } from '../constants';
import { getAllTemplates, getAllCategories } from '../services/firebase';
import CardPreview from '../components/CardPreview';
import { Layout, Palette, Loader2, Sparkles, Plus, Star, FolderOpen, Briefcase, PartyPopper, LayoutGrid } from 'lucide-react';

interface TemplatesGalleryProps {
  lang: Language;
  onSelect: (templateId: string) => void;
}

const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({ lang, onSelect }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const sampleCardData = (SAMPLE_DATA[lang] || SAMPLE_DATA['en']) as CardData;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tData, cData] = await Promise.all([
          getAllTemplates(),
          getAllCategories()
        ]);
        const activeCats = (cData as TemplateCategory[]).filter(c => c.isActive);
        setCustomTemplates(tData as CustomTemplate[]);
        setCategories(activeCats);
        
        // ضبط القسم الأول كافتراضي بدلاً من "الكل"
        if (activeCats.length > 0) {
          setActiveCategoryId(activeCats[0].id);
        }
      } catch (err) {
        console.error("Error fetching gallery data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeTemplates = customTemplates.filter(t => t.isActive);
  
  // تصفية القوالب بناءً على القسم المختار
  const filteredTemplates = activeTemplates.filter(tmpl => tmpl.categoryId === activeCategoryId);

  // دالة للحصول على الأيقونة واللون بناءً على مسمى القسم
  const getCategoryTheme = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('عمل') || n.includes('business')) return { icon: Briefcase, color: 'bg-blue-600' };
    if (n.includes('مناسبات') || n.includes('occasion')) return { icon: PartyPopper, color: 'bg-indigo-600' };
    return { icon: LayoutGrid, color: 'bg-slate-700' };
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{isRtl ? 'جاري تحميل التصاميم...' : 'Loading Designs...'}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 animate-fade-in-up space-y-16">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/20">
          <Palette size={12} />
          {t('templates')}
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
          {isRtl ? 'اختر نمط هويتك' : 'Select Your Identity Style'}
        </h1>
        <p className="text-sm md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-bold opacity-80">
          {isRtl ? 'مجموعة من القوالب الاحترافية المصممة بعناية لتناسب كافة احتياجاتك.' : 'A collection of professional templates carefully designed for all your needs.'}
        </p>
      </div>

      {/* شريط الأقسام المطور (Segmented Control Style) */}
      <div className="flex justify-center">
        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl">
          {categories.map(cat => {
            const theme = getCategoryTheme(isRtl ? cat.nameAr : cat.nameEn);
            const Icon = theme.icon;
            const isActive = activeCategoryId === cat.id;

            return (
              <button 
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`flex items-center gap-4 px-10 py-5 rounded-[2.5rem] transition-all duration-500 group ${isActive ? theme.color + ' text-white shadow-2xl scale-105' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-white'}`}>
                  <Icon size={24} className={isActive ? 'text-white' : 'text-gray-400'} />
                </div>
                <span className={`text-lg md:text-xl font-black uppercase tracking-tight ${isRtl ? 'font-cairo' : ''}`}>
                  {isRtl ? cat.nameAr : cat.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* عرض القوالب بشبكة عرض متطورة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 pt-8">
        {filteredTemplates.map(tmpl => (
          <TemplateCard key={tmpl.id} tmpl={tmpl} lang={lang} onSelect={onSelect} sampleData={sampleCardData} />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-32 bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800 animate-fade-in">
           <FolderOpen className="mx-auto text-gray-200 dark:text-gray-800 mb-6 opacity-30" size={84} />
           <h3 className="text-2xl font-black dark:text-white mb-2">{isRtl ? 'قريباً.. تصاميم جديدة' : 'New designs coming soon'}</h3>
           <p className="text-gray-400 font-bold">{isRtl ? 'نعمل حالياً على إضافة المزيد من القوالب لهذا القسم.' : 'We are working on adding more templates to this section.'}</p>
        </div>
      )}
    </div>
  );
};

const TemplateCard = ({ tmpl, lang, onSelect, sampleData }: any) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];

  return (
    <div className="group flex flex-col transition-all duration-500">
      <div className={`relative aspect-[9/16] w-full bg-gray-50 dark:bg-[#0f0f12] rounded-[3.5rem] border-2 shadow-sm overflow-hidden mb-8 group-hover:shadow-[0_40px_100px_-20px_rgba(59,130,246,0.3)] group-hover:-translate-y-3 transition-all duration-700 ${tmpl.isFeatured ? 'border-amber-400/50' : 'border-gray-100 dark:border-gray-800'}`}>
        {tmpl.isFeatured && (
          <div className="absolute top-8 left-8 z-50 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase shadow-xl">
            <Star size={14} fill="currentColor" />
            {isRtl ? 'تصميم مميز' : 'Premium Design'}
          </div>
        )}
        <div className="absolute inset-0 p-4 flex items-center justify-center overflow-hidden">
           <div className="w-full h-full scale-[0.82] origin-top pointer-events-none transition-transform duration-700 group-hover:scale-[0.85]">
              <CardPreview 
                data={{ 
                  ...sampleData, 
                  templateId: tmpl.id,
                  themeType: tmpl.config.defaultThemeType || sampleData.themeType,
                  themeColor: tmpl.config.defaultThemeColor || sampleData.themeColor,
                  themeGradient: tmpl.config.defaultThemeGradient || sampleData.themeGradient,
                  backgroundImage: tmpl.config.defaultBackgroundImage || sampleData.backgroundImage,
                  profileImage: tmpl.config.defaultProfileImage || sampleData.profileImage || '',
                  isDark: tmpl.config.defaultIsDark ?? sampleData.isDark,
                  nameColor: tmpl.config.nameColor,
                  titleColor: tmpl.config.titleColor,
                  bioTextColor: tmpl.config.bioTextColor,
                  bioBgColor: tmpl.config.bioBgColor,
                  linksColor: tmpl.config.linksColor,
                  showName: tmpl.config.showNameByDefault ?? true,
                  showTitle: tmpl.config.showTitleByDefault ?? true,
                  showCompany: tmpl.config.showCompanyByDefault ?? true,
                  showBio: tmpl.config.showBioByDefault ?? true,
                  showEmail: tmpl.config.showEmailByDefault ?? true,
                  showWebsite: tmpl.config.showWebsiteByDefault ?? true,
                  showSocialLinks: tmpl.config.showSocialLinksByDefault ?? true,
                  showButtons: tmpl.config.showButtonsByDefault ?? true,
                  showQrCode: tmpl.config.showQrCodeByDefault ?? true,
                  showOccasion: tmpl.config.showOccasionByDefault ?? false,
                  occasionTitle: tmpl.config.occasionTitle,
                  occasionDate: tmpl.config.occasionDate,
                  occasionMapUrl: tmpl.config.occasionMapUrl,
                  occasionPrimaryColor: tmpl.config.occasionPrimaryColor,
                  occasionBgColor: tmpl.config.occasionBgColor,
                  occasionTitleColor: tmpl.config.occasionTitleColor,
                  occasionOffsetY: tmpl.config.occasionOffsetY,
                  occasionFloating: tmpl.config.occasionFloating
                }} 
                lang={lang} 
                customConfig={tmpl.config}
                hideSaveButton={true} 
              />
           </div>
        </div>
        <div className="absolute inset-0 bg-blue-600/10 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center z-[60] p-8 text-center">
           <button 
             onClick={() => onSelect(tmpl.id)}
             className="bg-blue-600 text-white px-12 py-6 rounded-[2.5rem] font-black text-sm uppercase shadow-2xl flex items-center gap-4 transform translate-y-10 group-hover:translate-y-0 transition-all duration-700 hover:scale-110 active:scale-95"
           >
             {t('useTemplate')}
             <Plus size={22} />
           </button>
        </div>
      </div>
      <div className="px-8 text-center sm:text-start flex flex-col gap-2">
         <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className={`w-3 h-3 rounded-full ${tmpl.isFeatured ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-blue-600'}`}></div>
            <h3 className="text-xl font-black dark:text-white uppercase tracking-wider">
              {isRtl ? tmpl.nameAr : tmpl.nameEn}
            </h3>
         </div>
         <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 leading-relaxed uppercase tracking-[0.2em] px-1">
           {isRtl ? tmpl.descAr : tmpl.descEn}
         </p>
      </div>
    </div>
  );
};

export default TemplatesGallery;
