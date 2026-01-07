
import { Language, CardData, CustomTemplate, TemplateCategory } from '../types';
import { TRANSLATIONS, SAMPLE_DATA } from '../constants';
import { getAllTemplates, getAllCategories, auth } from '../services/firebase';
import CardPreview from '../components/CardPreview';
import { Layout, Palette, Loader2, Plus, FolderOpen, Briefcase, PartyPopper, LayoutGrid, Star, ShieldCheck, Crown } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface TemplatesGalleryProps {
  lang: Language;
  onSelect: (templateId: string) => void;
}

const TemplatesGallery: React.FC<TemplatesGalleryProps> = ({ lang, onSelect }) => {
  const isRtl = lang === 'ar';
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isPrivateMode = searchParams.get('mode') === 'private';

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
        
        let filteredTemplates = (tData as CustomTemplate[]).filter(t => t.isActive);
        
        const currentUid = auth.currentUser?.uid;

        if (isPrivateMode) {
           // في الوضع الخاص، نظهر فقط القوالب المخصصة لهذا المستخدم
           filteredTemplates = filteredTemplates.filter(t => t.restrictedUserId === currentUid);
        } else {
           // في الوضع العام، نظهر فقط القوالب التي ليس لها تقييد لمستخدم معين
           filteredTemplates = filteredTemplates.filter(t => !t.restrictedUserId);
        }

        const activeCats = (cData as TemplateCategory[]).filter(c => c.isActive);
        setCustomTemplates(filteredTemplates);
        setCategories(activeCats);
        
        if (activeCats.length > 0) {
          // في الوضع الخاص، نحتاج لتفعيل أول قسم يحتوي على قوالب مخصصة
          const firstUsedCatId = activeCats.find(c => filteredTemplates.some(t => t.categoryId === c.id))?.id;
          setActiveCategoryId(firstUsedCatId || activeCats[0].id);
        }
      } catch (err) {
        console.error("Error fetching gallery data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isPrivateMode]);

  const filteredTemplates = customTemplates.filter(tmpl => tmpl.categoryId === activeCategoryId);

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
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12 animate-fade-in-up space-y-10 md:space-y-16">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/10 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-900/20">
          {isPrivateMode ? <Crown size={12} className="text-amber-500" /> : <Palette size={12} />}
          {isPrivateMode ? (isRtl ? 'معرض التصاميم الخاصة بك' : 'Your Private Designs') : t('templates')}
        </div>
        <h1 className="text-3xl md:text-6xl font-black text-gray-900 dark:text-white tracking-tight">
          {isPrivateMode ? (isRtl ? 'تصاميم صممت لك خصيصاً' : 'Designs Crafted For You') : (isRtl ? 'اختر نمط هويتك' : 'Select Your Identity Style')}
        </h1>
        <p className="text-xs md:text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-bold opacity-80">
          {isPrivateMode 
            ? (isRtl ? 'هنا تجد القوالب الحصرية المخصصة لحسابك فقط من قبل فريق هويتي.' : 'Here you find exclusive templates assigned to your account by the NextID team.')
            : (isRtl ? 'مجموعة من القوالب الاحترافية المصممة بعناية لتناسب كافة احتياجاتك.' : 'A collection of professional templates carefully designed for all your needs.')}
        </p>
      </div>

      <div className="flex justify-start md:justify-center overflow-x-auto no-scrollbar -mx-4 px-4 pb-4">
        <div className="flex items-center gap-2 md:gap-3 p-2 bg-white dark:bg-gray-900/50 rounded-2xl md:rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-sm backdrop-blur-xl">
          {categories.map(cat => {
            const theme = getCategoryTheme(isRtl ? cat.nameAr : cat.nameEn);
            const Icon = theme.icon;
            const isActive = activeCategoryId === cat.id;

            return (
              <button 
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                className={`flex items-center gap-2 md:gap-4 px-5 md:px-10 py-3 md:py-5 rounded-xl md:rounded-[2.5rem] transition-all duration-500 whitespace-nowrap group ${isActive ? theme.color + ' text-white shadow-xl scale-[1.02]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                <div className={`p-1.5 md:p-2 rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-white'}`}>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                </div>
                <span className={`text-sm md:text-xl font-black uppercase tracking-tight ${isRtl ? 'font-cairo' : ''}`}>
                  {isRtl ? cat.nameAr : cat.nameEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10 md:gap-14 pt-4 max-w-6xl mx-auto">
        {filteredTemplates.map(tmpl => (
          <TemplateCard key={tmpl.id} tmpl={tmpl} lang={lang} onSelect={onSelect} sampleData={sampleCardData} isPrivate={isPrivateMode} />
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-24 bg-white dark:bg-gray-900 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800 animate-fade-in mx-4">
           <FolderOpen className="mx-auto text-gray-200 dark:text-gray-800 mb-6 opacity-30" size={64} />
           <h3 className="text-xl font-black dark:text-white mb-2">{isRtl ? 'لا توجد تصاميم هنا حالياً' : 'No designs here yet'}</h3>
           <p className="text-xs text-gray-400 font-bold">{isPrivateMode ? (isRtl ? 'لم يتم تخصيص أي قوالب حصرية لحسابك بعد.' : 'No exclusive templates assigned to your account yet.') : (isRtl ? 'نعمل حالياً على إضافة المزيد من القوالب لهذا القسم.' : 'We are working on adding more templates to this section.')}</p>
        </div>
      )}
    </div>
  );
};

const TemplateCard = ({ tmpl, lang, onSelect, sampleData, isPrivate }: any) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];
  const [mouseYPercentage, setMouseYPercentage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));
    setMouseYPercentage(percentage);
  };

  const handleMouseLeave = () => {
    setMouseYPercentage(0);
  };

  return (
    <div className="group flex flex-col transition-all duration-500">
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`relative aspect-[10/18] w-full bg-white dark:bg-black rounded-[3.5rem] shadow-xl overflow-hidden mb-8 group-hover:shadow-[0_50px_120px_-20px_rgba(0,0,0,0.4)] transition-all duration-700 border border-gray-100 dark:border-gray-800 cursor-ns-resize`}
        style={{ isolation: 'isolate' }}
      >
        
        {/* Bezel is top layer */}
        <div className="absolute inset-0 border-[12px] border-gray-900 dark:border-gray-800 rounded-[3.5rem] pointer-events-none z-50"></div>
        
        {isPrivate ? (
           <div className="absolute top-8 left-8 z-[60] flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-full font-black text-[8px] uppercase shadow-xl">
             <ShieldCheck size={10} fill="currentColor" />
             {isRtl ? 'حصري لك' : 'Exclusive'}
           </div>
        ) : tmpl.isFeatured && (
          <div className="absolute top-8 left-8 z-[60] flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 rounded-full font-black text-[8px] uppercase shadow-xl">
            <Star size={10} fill="currentColor" />
            {isRtl ? 'مميز' : 'Pro'}
          </div>
        )}
        
        {/* Container for the preview */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" 
             style={{ 
               borderRadius: '2.6rem', 
               clipPath: 'inset(0 round 2.6rem)', 
               zIndex: 10,
               transform: 'translateZ(0)'
             }}>
           <div 
             className="h-full w-full transition-transform duration-[500ms] ease-out origin-top"
             style={{ 
               transform: `translateY(-${mouseYPercentage * 0.45}%)`,
               willChange: 'transform'
             }}
           >
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
                  showOccasion: tmpl.config.showOccasionByDefault ?? false,
                  showName: true, showTitle: true, showBio: true, showQrCode: true, showButtons: true, showSocialLinks: true
                }} 
                lang={lang} 
                customConfig={tmpl.config}
                hideSaveButton={true} 
                isFullFrame={true}
                bodyOffsetYOverride={tmpl.config.mobileBodyOffsetY ?? 0}
              />
           </div>
        </div>

        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-[60]">
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onSelect(tmpl.id);
             }}
             className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-[11px] md:text-xs uppercase shadow-2xl flex items-center gap-3 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 hover:scale-110 active:scale-95 pointer-events-auto cursor-pointer"
           >
             {isPrivate ? (isRtl ? 'تحرير بطاقتي الخاصة' : 'Edit My Private Card') : t('useTemplate')}
             <Plus size={16} />
           </button>
        </div>
      </div>

      <div className="px-6 text-center sm:text-start flex flex-col gap-2">
         <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className={`w-3 h-3 rounded-full ${isPrivate ? 'bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]' : tmpl.isFeatured ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-blue-600'}`}></div>
            <h3 className="text-lg md:text-2xl font-black dark:text-white uppercase tracking-tight truncate">
              {isRtl ? tmpl.nameAr : tmpl.nameEn}
            </h3>
         </div>
         <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 leading-relaxed uppercase tracking-widest px-1">
           {isRtl ? tmpl.descAr : tmpl.descEn}
         </p>
      </div>
    </div>
  );
};

export default TemplatesGallery;
