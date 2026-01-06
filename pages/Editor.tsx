import { 
  Save, Plus, X, Loader2, Sparkles, Moon, Sun, 
  Mail, Phone, Globe, MessageCircle, Link as LinkIcon, 
  CheckCircle2, AlertCircle, UploadCloud, ImageIcon, 
  Palette, Layout, User as UserIcon, Camera, 
  Pipette, Type as TypographyIcon, Smartphone, Tablet, Monitor, Eye, 
  RefreshCcw, FileText, Calendar, MapPin, PartyPopper, Move, Wind, 
  GlassWater, Link2, Sparkle, LayoutGrid, EyeOff, Ruler, Wand2, Building2, Timer,
  QrCode, Share2, Trash2, LogIn, Shapes, Navigation2, ImagePlus, Check, Search, AlertTriangle, Zap
} from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import CardPreview from '../components/CardPreview';
import SocialIcon from '../components/SocialIcon';
import AuthModal from '../components/AuthModal';
import { BACKGROUND_PRESETS, AVATAR_PRESETS, SAMPLE_DATA, SOCIAL_PLATFORMS, THEME_COLORS, THEME_GRADIENTS, TRANSLATIONS } from '../constants';
import { isSlugAvailable, auth, getSiteSettings } from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import { CardData, CustomTemplate, Language, SpecialLinkItem } from '../types';
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

type EditorTab = 'identity' | 'social' | 'links' | 'design';

const Editor: React.FC<EditorProps> = ({ lang, onSave, onCancel, initialData, isAdminEdit, templates, forcedTemplateId }) => {
  const isRtl = lang === 'ar';
  const t = (key: string, fallback?: string) => {
    if (fallback && !TRANSLATIONS[key]) return isRtl ? key : fallback;
    return TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgFileInputRef = useRef<HTMLInputElement>(null);
  const specialLinkInputRef = useRef<HTMLInputElement>(null);
  const originalIdRef = useRef<string | null>(initialData?.id || null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const editorTopRef = useRef<HTMLDivElement>(null); 

  const [activeTab, setActiveTab] = useState<EditorTab>('identity');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [previewMouseY, setPreviewMouseY] = useState(0);
  
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showDirectAuth, setShowDirectAuth] = useState(false);

  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugStatus, setSlugStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
  const [isSlugVerified, setIsSlugVerified] = useState(true);
  const [showValidationError, setShowValidationError] = useState<string | null>(null);
  
  const [isUploadingLinkImg, setIsUploadingLinkImg] = useState(false);
  const [uploadConfig, setUploadConfig] = useState({ storageType: 'database', uploadUrl: '' });

  useEffect(() => {
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
    
    if (initialData) return {
      ...initialData,
      emails: initialData.emails || (initialData.email ? [initialData.email] : []),
      websites: initialData.websites || (initialData.website ? [initialData.website] : []),
      specialLinks: initialData.specialLinks || []
    };

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
         pageBgColor: selectedTmpl.config.pageBgColor || '',
         showOccasion: false,
         showName: selectedTmpl.config.showNameByDefault ?? true,
         showTitle: selectedTmpl.config.showTitleByDefault ?? true,
         showCompany: selectedTmpl.config.showCompanyByDefault ?? true,
         showBio: selectedTmpl.config.showBioByDefault ?? true,
         showEmail: selectedTmpl.config.showEmailByDefault ?? true,
         showPhone: selectedTmpl.config.showPhoneByDefault ?? true,
         showWebsite: selectedTmpl.config.showWebsiteByDefault ?? true,
         showWhatsapp: selectedTmpl.config.showWhatsappByDefault ?? true,
         showSocialLinks: selectedTmpl.config.showSocialLinksByDefault ?? true,
         showButtons: selectedTmpl.config.showButtonsByDefault ?? true,
         showQrCode: selectedTmpl.config.showQrCodeByDefault ?? true,
         showLocation: selectedTmpl.config.showLocationByDefault ?? true,
         linksShowText: selectedTmpl.config.linksShowText ?? true,
         linksShowBg: selectedTmpl.config.linksShowBg ?? true,
         useSocialBrandColors: selectedTmpl.config.useSocialBrandColors ?? false,
         specialLinksCols: selectedTmpl.config.specialLinksCols ?? 2,
         emails: baseData.emails || (baseData.email ? [baseData.email] : []),
         websites: baseData.websites || (baseData.website ? [baseData.website] : []),
         specialLinks: baseData.specialLinks || []
       } as CardData;
    }
    return baseData;
  });

  const scrollToError = () => {
    if (editorTopRef.current) {
      editorTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCheckSlug = async () => {
    setShowValidationError(null);
    if (!formData.id) {
      setSlugStatus('invalid');
      setIsSlugVerified(false);
      return;
    }
    if (formData.id.length < 3) {
      setSlugStatus('invalid');
      setIsSlugVerified(false);
      return;
    }
    setIsCheckingSlug(true);
    try {
      const available = await isSlugAvailable(formData.id, auth.currentUser?.uid);
      if (available) {
        setSlugStatus('available');
        setIsSlugVerified(true);
      } else {
        setSlugStatus('taken');
        setIsSlugVerified(false);
      }
    } catch (e) {
      setSlugStatus('idle');
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const handlePreviewMouseMove = (e: React.MouseEvent) => {
    if (!previewContainerRef.current) return;
    const rect = previewContainerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentage = Math.max(0, Math.min(100, (relativeY / rect.height) * 100));
    setPreviewMouseY(percentage);
  };

  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [socialInput, setSocialInput] = useState({ platformId: SOCIAL_PLATFORMS[0].id, url: '' });

  const currentTemplate = templates.find(t => t.id === formData.templateId);
  
  const handleChange = (field: keyof CardData, value: any) => {
    if (field === 'id') { 
      value = (value || '').toLowerCase().replace(/[^a-z0-9-]/g, ''); 
      setIsSlugVerified(value === originalIdRef.current);
      setSlugStatus('idle');
      setShowValidationError(null);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const VisibilityToggle = ({ field, label }: { field: keyof CardData, label: string }) => {
    const isVisible = formData[field] !== false;
    return (
      <button 
        type="button"
        onClick={() => handleChange(field, !isVisible)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${isVisible ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-400 bg-gray-100 dark:bg-gray-800'}`}
      >
        {isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
        <span className="text-[9px] font-black uppercase">{isVisible ? t('إظهار', 'Show') : t('إخفاء', 'Hide')}</span>
      </button>
    );
  };

  const checkAuthAndClick = (ref: React.RefObject<HTMLInputElement>) => {
    if (!auth.currentUser) {
      setShowAuthWarning(true);
      return;
    }
    ref.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploading(true);
    try { 
      const b = await uploadImageToCloud(file, 'avatar', uploadConfig as any); 
      if (b) {
        handleChange('profileImage', b); 
      }
    } finally { setIsUploading(false); }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsUploadingBg(true);
    try { 
      const b = await uploadImageToCloud(file, 'background', uploadConfig as any); 
      if (b) {
        setFormData(prev => ({ ...prev, backgroundImage: b, themeType: 'image' }));
      }
    } finally { setIsUploadingBg(false); }
  };

  const handleSpecialLinkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!auth.currentUser) { setShowAuthWarning(true); return; }
    setIsUploadingLinkImg(true);
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
        setFormData(prev => ({ ...prev, specialLinks: [...(prev.specialLinks || []), newItem] }));
      }
    } finally { setIsUploadingLinkImg(false); }
  };

  const updateSpecialLink = (id: string, field: keyof SpecialLinkItem, value: string) => {
    setFormData(prev => ({
      ...prev,
      specialLinks: (prev.specialLinks || []).map(l => l.id === id ? { ...l, [field]: value } : l)
    }));
  };

  const removeSpecialLink = (id: string) => {
    setFormData(prev => ({
      ...prev,
      specialLinks: (prev.specialLinks || []).filter(l => l.id !== id)
    }));
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

  const removeSocialLinkUI = (index: number) => {
    const updated = [...formData.socialLinks];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, socialLinks: updated }));
  };

  const handleAddMultiLink = (field: 'emails' | 'websites') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }));
  };

  const handleUpdateMultiLink = (field: 'emails' | 'websites', index: number, value: string) => {
    const list = [...(formData[field] || [])];
    list[index] = value;
    setFormData(prev => ({ ...prev, [field]: list }));
  };

  const handleRemoveMultiLink = (field: 'emails' | 'websites', index: number) => {
    const list = [...(formData[field] || [])];
    list.splice(index, 1);
    setFormData(prev => ({ ...prev, [field]: list }));
  };

  const TabButton = ({ id, label, icon: Icon }: { id: EditorTab, label: string, icon: any }) => {
    const isActive = activeTab === id;
    let activeColor = 'bg-blue-600';
    if (id === 'social') activeColor = 'bg-emerald-600';
    if (id === 'links') activeColor = 'bg-purple-600';
    if (id === 'design') activeColor = 'bg-indigo-600';

    return (
      <button 
        type="button"
        onClick={() => setActiveTab(id)}
        className={`flex-1 flex flex-col items-center justify-center gap-1.5 px-3 py-4 font-black text-[10px] uppercase tracking-tighter transition-all duration-300 min-w-[70px] ${isActive ? `${activeColor} text-white shadow-lg scale-105 rounded-2xl` : 'text-gray-400 opacity-60'}`}
      >
        <Icon size={18} className="shrink-0" /> 
        <span className="truncate">{label}</span>
      </button>
    );
  };

  const inputClasses = "w-full px-5 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/10 transition-all font-bold text-sm shadow-none";
  const labelClasses = "block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest px-1";

  const handleFinalSaveInternal = () => {
    setShowValidationError(null);
    if (!auth.currentUser) {
      setShowAuthWarning(true);
      return;
    }
    if (isUploading || isUploadingBg || isUploadingLinkImg) {
      setShowValidationError(isRtl ? "يرجى الانتظار حتى اكتمال رفع الصور" : "Please wait for images to finish uploading");
      scrollToError();
      return;
    }
    
    if (!isSlugVerified) {
       setShowValidationError(isRtl ? "يجب التحقق من توفر الرابط أولاً بالضغط على زر (تحقق)" : "Please verify the link availability first by clicking (Verify)");
       setActiveTab('identity');
       setTimeout(scrollToError, 100);
       return;
    }
    if (slugStatus === 'taken' || slugStatus === 'invalid') {
       setShowValidationError(isRtl ? "الرابط المختار غير صالح أو محجوز، يرجى اختيار اسم آخر" : "The selected link is invalid or taken, please choose another");
       setActiveTab('identity');
       setTimeout(scrollToError, 100);
       return;
    }

    if (!formData.name || formData.name.trim() === '') {
       setShowValidationError(isRtl ? "الاسم مطلوب لحفظ البطاقة" : "Name is required to save the card");
       setActiveTab('identity');
       setTimeout(scrollToError, 100);
       return;
    }

    const finalData = {
      ...formData,
      email: formData.emails && formData.emails.length > 0 ? formData.emails[0] : formData.email,
      website: formData.websites && formData.websites.length > 0 ? formData.websites[0] : formData.website
    };
    onSave(finalData, originalIdRef.current || undefined);
  };

  return (
    <div className="max-w-[1440px] mx-auto">
      {showAuthWarning && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-[#121215] w-full max-w-4xl rounded-[4rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-12 md:p-16 text-center space-y-8 animate-zoom-in">
              <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <UserIcon size={48} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl md:text-3xl font-black dark:text-white leading-tight">
                   {isRtl ? "لحفظ بطاقتك وتعديلها الرجاء تسجيل الدخول أو إنشاء حساب" : "To save and customize your card, please login or register"}
                </h3>
                <p className="text-sm font-bold text-gray-400 leading-relaxed max-w-2xl mx-auto">
                   {isRtl ? "سجل حسابك الآن لتتمكن من حفظ هويتك الرقمية ومشاركتها مع العالم وتعديلها في أي وقت." : "Register now to save your digital identity, share it with the world, and edit it anytime."}
                </p>
              </div>
              <div className="flex flex-col gap-4 pt-6 max-w-2xl mx-auto">
                 <button 
                   onClick={() => { setShowAuthWarning(false); setShowDirectAuth(true); }}
                   className="w-full py-6 bg-blue-600 text-white rounded-3xl font-black text-sm uppercase shadow-2xl shadow-blue-600/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                 >
                    <LogIn size={20} />
                    {isRtl ? "تسجيل دخول / إنشاء حساب" : "Login / Register"}
                 </button>
                 <button 
                   onClick={() => setShowAuthWarning(false)}
                   className="w-full py-4 text-gray-400 font-black text-xs uppercase hover:text-blue-600 transition-colors"
                 >
                    {isRtl ? "لاحقاً" : "Maybe Later"}
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

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full space-y-0 pb-32">
          
          <div className={`w-full sticky top-[75px] z-50 transition-all duration-300 ease-in-out pt-0 pb-6 md:pb-10 ${isNavVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
             <div className="flex w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl overflow-x-auto no-scrollbar shadow-sm p-1.5 gap-1.5">
                <TabButton id="identity" label={t('الهوية', 'Identity')} icon={UserIcon} />
                <TabButton id="social" label={t('التواصل', 'Contact')} icon={MessageCircle} />
                <TabButton id="links" label={t('روابط الصور', 'Links')} icon={ImagePlus} />
                <TabButton id="design" label={t('التصميم', 'Design')} icon={Palette} />
             </div>
          </div>

          <div ref={editorTopRef} className="h-0 w-0 pointer-events-none invisible" />

          <div className="bg-white dark:bg-[#121215] p-5 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-gray-100 dark:border-gray-800 animate-fade-in relative overflow-hidden">
            
            {showValidationError && (
               <div className="mb-6 p-5 bg-red-500 text-white rounded-[1.8rem] shadow-xl shadow-red-500/20 flex items-center gap-4 animate-shake relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent pointer-events-none"></div>
                  <div className="shrink-0 p-2 bg-white/20 rounded-xl">
                    <AlertTriangle size={24} />
                  </div>
                  <p className="flex-1 text-sm font-black uppercase tracking-tight leading-snug">{showValidationError}</p>
                  <button onClick={() => setShowValidationError(null)} className="p-2 hover:bg-white/20 rounded-xl transition-all"><X size={20}/></button>
               </div>
            )}

            <div className="space-y-8 mt-4 animate-fade-in">
              {activeTab === 'identity' && (
                <div className="space-y-6 animate-fade-in relative z-10">
                  {/* قسم حجز الرابط المطور */}
                  <div className="p-8 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/10 dark:to-[#121215] rounded-[3.5rem] border-2 border-emerald-100 dark:border-emerald-900/20 shadow-xl shadow-emerald-500/5 space-y-6 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                        <Zap size={140} className="text-emerald-600" />
                     </div>
                     
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-600/20">
                             <Link2 size={24} />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-tighter leading-none mb-1">
                               {isRtl ? 'احجز رابطك الخاص الآن' : 'Reserve Your Custom Link'}
                            </h4>
                            <p className="text-[10px] font-bold text-emerald-600/60 dark:text-emerald-400/40 uppercase tracking-widest">
                               {isRtl ? 'اختر اسماً مميزاً يعبر عن هويتك' : 'Choose a unique name for your identity'}
                            </p>
                          </div>
                        </div>
                     </div>

                     <div className="relative z-10">
                        <div className={`absolute ${isRtl ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 text-[11px] font-black text-emerald-300 dark:text-emerald-900 uppercase tracking-widest pointer-events-none opacity-60`}>.nextid.my</div>
                        <input 
                          type="text" 
                          value={formData.id} 
                          onChange={e => handleChange('id', e.target.value)} 
                          className={`w-full px-8 py-5 rounded-3xl border-2 bg-white/90 dark:bg-gray-950/80 text-xl font-black outline-none transition-all ${isRtl ? 'pl-24 pr-8' : 'pr-24 pl-8'} ${slugStatus === 'available' ? 'border-emerald-500 ring-8 ring-emerald-500/10 bg-emerald-50/20' : slugStatus === 'taken' || slugStatus === 'invalid' ? 'border-red-500 ring-8 ring-red-500/10 bg-red-50/20' : 'border-emerald-100 focus:border-emerald-300'}`} 
                          placeholder={isRtl ? 'اكتب اسمك هنا...' : 'Type your link...'}
                        />
                        
                        <button 
                          type="button" 
                          onClick={handleCheckSlug}
                          disabled={isCheckingSlug}
                          className={`absolute ${isRtl ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 px-8 py-3.5 bg-emerald-600 text-white rounded-2xl font-black text-[11px] uppercase shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border-2 border-emerald-500`}
                        >
                           {isCheckingSlug ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                           {t('تحقق', 'Verify')}
                        </button>
                     </div>

                     {slugStatus !== 'idle' && (
                       <div className={`flex items-center gap-3 px-6 py-4 rounded-3xl animate-zoom-in border relative z-10 ${slugStatus === 'available' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/50' : 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-200/50'}`}>
                          <div className={`p-2 rounded-xl shadow-sm ${slugStatus === 'available' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                             {slugStatus === 'available' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                          </div>
                          <span className="text-xs font-black uppercase tracking-tight">
                             {slugStatus === 'available' ? t('هذا الرابط متاح للاستخدام الآن ✓', 'This link is available for use now ✓') : 
                              slugStatus === 'taken' ? t('للأسف، هذا الرابط محجوز مسبقاً ✗', 'Sorry, this link is already taken ✗') : 
                              t('الرابط غير صالح أو قصير جداً ⚠', 'Link is invalid or too short ⚠')}
                          </span>
                       </div>
                     )}
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center">
                     <div className="relative shrink-0 group">
                        <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-2 border-white dark:border-gray-800 shadow-md bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative">
                          {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" alt="Profile" /> : <UserIcon size={32} className="text-gray-300" />}
                          {isUploading && <div className="absolute inset-0 bg-blue-600/60 flex items-center justify-center"><Loader2 className="animate-spin text-white" size={16} /></div>}
                        </div>
                        <button type="button" disabled={isUploading} onClick={() => checkAuthAndClick(fileInputRef)} className="absolute -bottom-1 -right-1 p-2 bg-blue-600 text-white rounded-lg shadow-lg disabled:opacity-50"><Camera size={16} /></button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                     </div>
                     <div className="flex-1 w-full space-y-4">
                        <div className="space-y-2">
                           <div className="flex justify-between items-center"><label className={labelClasses}>{t('الاسم', 'Name')}</label><VisibilityToggle field="showName" label="Name" /></div>
                           <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} placeholder={t('الاسم الكامل', 'Full Name')} />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center"><label className={labelClasses}>{t('المسمى الوظيفي', 'Job Title')}</label><VisibilityToggle field="showTitle" label="Title" /></div>
                           <input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClasses} placeholder={t('مثلاً: مهندس برمجيات', 'Ex: Software Engineer')} />
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 border-t dark:border-gray-800">
                     <div className="flex items-center gap-3 mb-4">
                        <Shapes className="text-blue-600" size={18} />
                        <h4 className="text-xs font-black dark:text-white uppercase tracking-widest">{isRtl ? 'مكتبة الكركترات والايموجي' : 'Emoji & Character Library'}</h4>
                     </div>
                     <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-3 max-h-[160px] overflow-y-auto no-scrollbar p-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                        {AVATAR_PRESETS.map((url, i) => (
                           <button 
                             key={i} 
                             type="button" 
                             onClick={() => handleChange('profileImage', url)} 
                             className={`aspect-square rounded-xl overflow-hidden transition-all bg-white dark:bg-gray-900 border-2 ${formData.profileImage === url ? 'border-blue-600 scale-105 shadow-md' : 'border-transparent hover:border-blue-100'}`}
                           >
                              <img src={url} className="w-full h-full object-contain p-1" alt={`Preset ${i}`} />
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                     <div className="space-y-2">
                        <div className="flex justify-between items-center"><label className={labelClasses}>{t('الشركة', 'Company')}</label><VisibilityToggle field="showCompany" label="Company" /></div>
                        <input type="text" value={formData.company} onChange={e => handleChange('company', e.target.value)} className={inputClasses} placeholder={t('اسم الشركة أو جهة العمل', 'Company Name')} />
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between items-center"><label className={labelClasses}>{t('النبذة الشخصية', 'Bio')}</label><VisibilityToggle field="showBio" label="Bio" /></div>
                        <textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} className={`${inputClasses} min-h-[120px] resize-none leading-relaxed`} placeholder={t('اكتب نبذة مختصرة عنك...', 'Bio...')} />
                     </div>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-8 animate-fade-in relative z-10">
                   <div className="grid grid-cols-1 gap-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <div className="flex justify-between items-center"><label className={labelClasses}>{t('رقم الهاتف', 'Phone')}</label><VisibilityToggle field="showPhone" label="Phone" /></div>
                           <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={inputClasses} />
                        </div>
                        <div className="space-y-2">
                           <div className="flex justify-between items-center"><label className={labelClasses}>{t('رقم الواتساب', 'WhatsApp')}</label><VisibilityToggle field="showWhatsapp" label="WhatsApp" /></div>
                           <input type="text" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={inputClasses} placeholder="9665..." />
                        </div>
                      </div>

                      <div className="pt-8 border-t dark:border-gray-800 space-y-8">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl shadow-sm"><LinkIcon size={20}/></div>
                               <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('directLinksSection')}</h4>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                               <VisibilityToggle field="showEmail" label={t('email')} />
                               <VisibilityToggle field="showWebsite" label={t('website')} />
                               <button 
                                  onClick={() => handleChange('linksShowText', !formData.linksShowText)} 
                                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${formData.linksShowText ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                               >
                                  {formData.linksShowText ? t('linksShowText') : t('linksIconsOnly')}
                               </button>
                               <button 
                                  onClick={() => handleChange('linksShowBg', !formData.linksShowBg)} 
                                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${formData.linksShowBg ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                               >
                                  {formData.linksShowBg ? t('linksShowBg') : t('بدون أرضية', 'No Background')}
                               </button>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-50/50 dark:bg-gray-800/20 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
                            <div className="space-y-4">
                               <div className="flex justify-between items-center px-1">
                                  <label className={labelClasses + " !mb-0"}>{t('البريد الإلكتروني', 'Emails')}</label>
                                  <button onClick={() => handleAddMultiLink('emails')} className="p-1.5 bg-blue-600 text-white rounded-lg hover:scale-110 transition-transform"><Plus size={14}/></button>
                               </div>
                               <div className="space-y-3">
                                  {(formData.emails || []).map((em, idx) => (
                                    <div key={idx} className="flex gap-2 animate-fade-in">
                                       <input type="email" value={em} onChange={e => handleUpdateMultiLink('emails', idx, e.target.value)} className={inputClasses + " !py-3 !px-4"} placeholder="mail@example.com" />
                                       <button onClick={() => handleRemoveMultiLink('emails', idx)} className="p-3 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                    </div>
                                  ))}
                               </div>
                            </div>

                            <div className="space-y-4">
                               <div className="flex justify-between items-center px-1">
                                  <label className={labelClasses + " !mb-0"}>{t('رابط الموقع', 'Websites')}</label>
                                  <button onClick={() => handleAddMultiLink('websites')} className="p-1.5 bg-emerald-600 text-white rounded-lg hover:scale-110 transition-transform"><Plus size={14}/></button>
                               </div>
                               <div className="space-y-3">
                                  {(formData.websites || []).map((web, idx) => (
                                    <div key={idx} className="flex gap-2 animate-fade-in">
                                       <input type="url" value={web} onChange={e => handleUpdateMultiLink('websites', idx, e.target.value)} className={inputClasses + " !py-3 !px-4"} placeholder="https://..." />
                                       <button onClick={() => handleRemoveMultiLink('websites', idx)} className="p-3 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                                    </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 border-t dark:border-gray-800 space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl shadow-sm"><Navigation2 size={20}/></div>
                            <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('locationSection')}</h4>
                         </div>
                         <VisibilityToggle field="showLocation" label="Location" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800/30 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm">
                         <div className="space-y-2">
                            <label className={labelClasses}>{t('location')}</label>
                            <input type="text" value={formData.location} onChange={e => handleChange('location', e.target.value)} className={inputClasses} placeholder={t('العنوان (مثلاً: الرياض، حي النرجس)', 'Address (Ex: Riyadh, Olaya)')} />
                         </div>
                         <div className="space-y-2">
                            <label className={labelClasses}>{t('locationUrl')}</label>
                            <input type="url" value={formData.locationUrl} onChange={e => handleChange('locationUrl', e.target.value)} className={inputClasses} placeholder="https://maps.google.com/..." />
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 border-t dark:border-gray-800 space-y-6">
                      <div className="flex flex-col gap-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3"><Share2 className="text-emerald-600" size={20}/><h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('روابط التواصل الاجتماعي', 'Social Links')}</h4></div>
                            <VisibilityToggle field="showSocialLinks" label="Socials" />
                         </div>

                         <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-3">
                            <label className={labelClasses}>{t('socialIconColorType')}</label>
                            <div className="flex gap-2 p-1 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700">
                               <button 
                                  type="button"
                                  onClick={() => handleChange('useSocialBrandColors', true)}
                                  className={`flex-1 py-3 rounded-lg font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${formData.useSocialBrandColors ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                               >
                                  <Sparkle size={14} />
                                  {t('brandColors')}
                               </button>
                               <button 
                                  type="button"
                                  onClick={() => handleChange('useSocialBrandColors', false)}
                                  className={`flex-1 py-3 rounded-lg font-black text-[10px] uppercase transition-all flex items-center justify-center gap-2 ${!formData.useSocialBrandColors ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                               >
                                  <Palette size={14} />
                                  {t('designColors')}
                               </button>
                            </div>
                         </div>
                      </div>

                      <div className="bg-emerald-50/30 dark:bg-emerald-900/5 p-6 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/20 space-y-4">
                         <div className="flex flex-col sm:flex-row gap-3">
                            <select value={socialInput.platformId} onChange={e => setSocialInput({...socialInput, platformId: e.target.value})} className="flex-1 bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none ring-1 ring-emerald-100 dark:ring-emerald-900/20">
                               {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input type="url" value={socialInput.url} onChange={e => setSocialInput({...socialInput, url: e.target.value})} placeholder="https://..." className="flex-[2] bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-3 text-sm font-bold dark:text-white outline-none ring-1 ring-emerald-100 dark:ring-emerald-900/20" />
                            <button type="button" onClick={addSocialLink} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"><Plus size={20} /></button>
                         </div>
                         <div className="flex flex-wrap gap-3 pt-4">
                            {formData.socialLinks?.map((link, idx) => (
                              <div key={idx} className="flex items-center gap-3 bg-white dark:bg-gray-800 px-4 py-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-fade-in group">
                                 <SocialIcon platformId={link.platformId} size={18} className="text-emerald-600" />
                                 <span className="text-[10px] font-black uppercase text-gray-500 max-w-[100px] truncate">{link.platform}</span>
                                 <button type="button" onClick={() => removeSocialLinkUI(idx)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                              </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'links' && (
                <div className="space-y-8 animate-fade-in relative z-10">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl shadow-sm">
                            <ImagePlus size={24} />
                         </div>
                         <div>
                            <h2 className="text-2xl font-black dark:text-white uppercase leading-none mb-1">{t('manageLinks')}</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('إضافة صور بروابط للمنتجات أو العروض', 'Add images with links for products or offers')}</p>
                         </div>
                      </div>
                      <VisibilityToggle field="showSpecialLinks" label="Special Links" />
                   </div>

                   <div className="bg-purple-50/30 dark:bg-purple-900/5 p-6 rounded-[2.5rem] border border-purple-100 dark:border-purple-900/20 space-y-6">
                      <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                         <div className="w-full md:w-1/2">
                            <label className={labelClasses}>{t('specialLinksCols')}</label>
                            <div className="flex gap-2 p-1 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-700">
                               {[1, 2, 3].map(val => (
                                 <button key={val} type="button" onClick={() => handleChange('specialLinksCols', val)} className={`flex-1 py-2 rounded-lg font-black text-xs transition-all ${formData.specialLinksCols === val ? 'bg-purple-600 text-white shadow-md' : 'text-gray-400'}`}>{val}</button>
                               ))}
                            </div>
                         </div>
                         <button 
                           type="button" 
                           disabled={isUploadingLinkImg}
                           onClick={() => specialLinkInputRef.current?.click()}
                           className="w-full md:w-auto px-10 py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
                         >
                            {isUploadingLinkImg ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                            {t('addSpecialLink')}
                         </button>
                         <input type="file" ref={specialLinkInputRef} className="hidden" onChange={handleSpecialLinkUpload} accept="image/*" />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                         {(formData.specialLinks || []).map((link) => (
                           <div key={link.id} className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-6 items-center animate-fade-in group">
                              <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-gray-700">
                                 <img src={link.imageUrl} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 uppercase px-1">{t('العنوان (AR)', 'Title AR')}</label>
                                    <input type="text" value={link.titleAr || ''} onChange={e => updateSpecialLink(link.id, 'titleAr', e.target.value)} className={inputClasses + " !py-3 !text-xs"} />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[9px] font-black text-gray-400 uppercase px-1">{t('specialLinkUrl')}</label>
                                    <input type="url" value={link.linkUrl} onChange={e => updateSpecialLink(link.id, 'linkUrl', e.target.value)} className={inputClasses + " !py-3 !text-xs"} placeholder="https://..." />
                                 </div>
                              </div>
                              <button onClick={() => removeSpecialLink(link.id)} className="p-3 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                           </div>
                         ))}
                         {(!formData.specialLinks || formData.specialLinks.length === 0) && (
                            <div className="text-center py-10 opacity-30">
                               <ImagePlus size={48} className="mx-auto mb-2" />
                               <p className="text-xs font-black uppercase tracking-widest">{t('لا يوجد روابط مضافة', 'No links added yet')}</p>
                            </div>
                         )}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'design' && (
                <div className="space-y-8 animate-fade-in relative z-10">
                   <div className="bg-gray-50 dark:bg-gray-800/30 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 space-y-8">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-lg"><Palette size={20}/></div>
                            <h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('تخصيص المظهر والسمة', 'Visual Theme Lab')}</h4>
                         </div>
                         <button onClick={() => handleChange('isDark', !formData.isDark)} className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-black text-[9px] uppercase transition-all shadow-sm ${formData.isDark ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600'}`}>
                            {formData.isDark ? <Moon size={16} /> : <Sun size={16} />}
                            {formData.isDark ? t('وضع ليلي', 'Dark Mode') : t('وضع نهاري', 'Light Mode')}
                         </button>
                      </div>

                      <div className="space-y-6">
                         <label className={labelClasses}>{t('نوع خلفية البطاقة', 'Card Theme Style')}</label>
                         <div className="grid grid-cols-3 gap-3">
                            {['color', 'gradient', 'image'].map(type => (
                              <button key={type} onClick={() => handleChange('themeType', type)} className={`py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.themeType === type ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-white dark:bg-gray-800 text-gray-400'}`}>
                                {type === 'color' ? <Pipette size={20}/> : type === 'gradient' ? <Sparkles size={20}/> : <ImageIcon size={20}/>}
                                <span className="text-[10px] font-black uppercase">{t(type, type.toUpperCase())}</span>
                              </button>
                            ))}
                         </div>
                      </div>

                      {formData.themeType === 'color' && (
                         <div className="grid grid-cols-6 sm:grid-cols-10 gap-3 animate-fade-in">
                            {THEME_COLORS.map(c => <button key={c} onClick={() => handleChange('themeColor', c)} className={`aspect-square rounded-full border-2 transition-all hover:scale-110 ${formData.themeColor === c ? 'border-blue-600 scale-110' : 'border-white'}`} style={{ backgroundColor: c }} />)}
                         </div>
                      )}
                      {formData.themeType === 'gradient' && (
                         <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 animate-fade-in">
                            {THEME_GRADIENTS.map((g, i) => <button key={i} onClick={() => handleChange('themeGradient', g)} className={`h-10 rounded-xl transition-all hover:scale-105 ${formData.themeGradient === g ? 'ring-4 ring-blue-500/20 opacity-100 scale-105' : 'opacity-60'}`} style={{ background: g }} />)}
                         </div>
                      )}
                      {formData.themeType === 'image' && (
                         <div className="space-y-4 animate-fade-in">
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 max-h-[200px] overflow-y-auto no-scrollbar p-2 bg-white dark:bg-gray-800 rounded-2xl">
                               {BACKGROUND_PRESETS.map((u, i) => <button key={i} onClick={() => handleChange('backgroundImage', u)} className={`aspect-square rounded-lg overflow-hidden transition-all ${formData.backgroundImage === u ? 'ring-4 ring-blue-500/30' : 'opacity-50'}`}><img src={u} className="w-full h-full object-cover" /></button>)}
                            </div>
                            <button type="button" disabled={isUploadingBg} onClick={() => checkAuthAndClick(bgFileInputRef)} className="w-full py-4 bg-white dark:bg-gray-800 text-blue-600 border border-dashed rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-3 transition-all hover:bg-blue-50/50 disabled:opacity-50">
                               {isUploadingBg ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                               {t('رفع خلفية خاصة', 'Upload Background')}
                            </button>
                            <input type="file" ref={bgFileInputRef} onChange={handleBgUpload} accept="image/*" className="hidden" />
                         </div>
                      )}
                   </div>

                   <div className="p-8 bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3"><QrCode className="text-blue-600" size={20}/><h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('رمز الاستجابة (QR)', 'QR Code')}</h4></div>
                         <VisibilityToggle field="showQrCode" label="QR Code" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="flex flex-col gap-2">
                            <label className={labelClasses}>{t('لون الباركود', 'QR Color')}</label>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                               <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm shrink-0">
                                  <input type="color" value={formData.qrColor || '#3b82f6'} onChange={e => handleChange('qrColor', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                                  <div className="w-full h-full" style={{ backgroundColor: formData.qrColor || '#3b82f6' }} />
                               </div>
                               <input type="text" value={(formData.qrColor || '#3b82f6').toUpperCase()} onChange={e => handleChange('qrColor', e.target.value)} className="bg-transparent border-none outline-none font-mono text-[10px] font-black w-full text-blue-600 dark:text-blue-400 uppercase" />
                            </div>
                         </div>
                         <div className="flex flex-col gap-2">
                            <label className={labelClasses}>{t('لون خلفية الباركود', 'QR Background')}</label>
                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                               <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 shadow-sm shrink-0">
                                  <input type="color" value={formData.qrBgColor || '#ffffff'} onChange={e => handleChange('qrBgColor', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
                                  <div className="w-full h-full" style={{ backgroundColor: formData.qrBgColor || '#ffffff' }} />
                               </div>
                               <input type="text" value={(formData.qrBgColor || '#ffffff').toUpperCase()} onChange={e => handleChange('qrBgColor', e.target.value)} className="bg-transparent border-none outline-none font-mono text-[10px] font-black w-full text-blue-600 dark:text-blue-400 uppercase" />
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-8 md:pt-10">
            <button 
              onClick={handleFinalSaveInternal}
              disabled={isUploading || isUploadingBg || isUploadingLinkImg || isCheckingSlug}
              className="flex-[2] py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-sm uppercase shadow-xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              { (isUploading || isUploadingBg || isUploadingLinkImg || isCheckingSlug) ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} /> } 
              {t('saveChanges')}
            </button>
            <button 
              onClick={() => setShowMobilePreview(true)}
              className="lg:hidden flex-1 py-5 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-200 dark:border-gray-700 rounded-[1.8rem] font-black text-sm uppercase flex items-center justify-center gap-3 active:scale-95 transition-all"
            >
              <Eye size={20} /> {t('معاينة', 'Preview')}
            </button>
            <button onClick={onCancel} className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-[1.8rem] font-black text-xs uppercase hover:bg-red-50 hover:text-red-500 transition-all">{t('إلغاء', 'Cancel')}</button>
          </div>
        </div>

        <div className="hidden lg:block w-[440px] sticky top-[100px]">
          <div className="bg-white dark:bg-[#050507] p-6 rounded-[4rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
             <div className="mb-6 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('معاينة حية', 'Live Preview')}</span>
                </div>
             </div>
             
             <div 
               ref={previewContainerRef}
               onMouseMove={handlePreviewMouseMove}
               onMouseLeave={() => setPreviewMouseY(0)}
               className="relative transition-all duration-500 rounded-[3.5rem] shadow-2xl overflow-hidden mx-auto bg-white dark:bg-black w-full border-[12px] border-gray-900 dark:border-gray-800 cursor-ns-resize" 
               style={{ isolation: 'isolate', transform: 'translateZ(0)' }}>
                
                <div className="h-[650px] overflow-hidden relative" 
                     style={{ borderRadius: '2.5rem', clipPath: 'inset(0 round 2.5rem)' }}>
                   <div 
                     className="h-full w-full transition-transform duration-500 ease-out origin-top"
                     style={{ 
                       transform: `translateY(-${previewMouseY * 0.45}%)`,
                       willChange: 'transform'
                     }}
                   >
                     <CardPreview 
                       data={formData} 
                       lang={lang} 
                       customConfig={currentTemplate?.config}
                       hideSaveButton={true} 
                       isFullFrame={true}
                     />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {showMobilePreview && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-[#0a0a0c] w-full max-sm rounded-[3.5rem] overflow-hidden flex flex-col h-[90vh]">
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    <h3 className="font-black dark:text-white uppercase text-sm tracking-widest">{t('معاينة البطاقة', 'Live Card Preview')}</h3>
                 </div>
                 <button onClick={() => setShowMobilePreview(false)} className="p-2 text-gray-400 hover:text-red-500 transition-all"><X size={24} /></button>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar bg-gray-50 dark:bg-[#050507] p-4 flex items-start justify-center">
                 <div className="w-full shadow-2xl rounded-[3rem] overflow-hidden relative border-[8px] border-gray-900 dark:border-gray-800 bg-white dark:bg-black"
                      style={{ isolation: 'isolate', transform: 'translateZ(0)' }}>
                    <div className="h-[580px] overflow-y-auto no-scrollbar relative" 
                         style={{ borderRadius: '2.4rem', overflow: 'hidden', clipPath: 'inset(0 round(2.4rem))' }}>
                       <CardPreview data={formData} lang={lang} customConfig={currentTemplate?.config} hideSaveButton={true} isFullFrame={true} />
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Editor;