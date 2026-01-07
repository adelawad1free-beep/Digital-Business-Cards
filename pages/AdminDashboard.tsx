import React, { useEffect, useState, useRef } from 'react';
import { 
  getAdminStats, ADMIN_EMAIL, deleteUserCard, 
  getDoc, doc, db,
  getSiteSettings, updateSiteSettings, updateUserSecurity,
  saveCustomTemplate, getAllTemplates, deleteTemplate,
  getAllCategories, saveTemplateCategory, deleteTemplateCategory,
  auth, getAuthErrorMessage, toggleCardStatus, getAllVisualStyles,
  getAllUsersWithStats, updateUserSubscription, toggleUserStatus,
  getAllPricingPlans, savePricingPlan, deletePricingPlan
} from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import { Language, CardData, CustomTemplate, TemplateCategory, VisualStyle, PricingPlan } from '../types';
import { generateShareUrl } from '../utils/share';
import CardPreview from '../components/CardPreview';
import TemplateBuilder from '../components/TemplateBuilder';
import StyleManager from '../components/StyleManager';
import { AVAILABLE_FONTS, THEME_GRADIENTS, TRANSLATIONS, THEME_COLORS, SAMPLE_DATA } from '../constants';
import * as LucideIcons from 'lucide-react';
import { 
  BarChart3, Users, Clock, Loader2,
  ShieldCheck, Trash2, Edit3, Eye, Settings, 
  Globe, Power, Save, Search, LayoutGrid,
  Lock, CheckCircle2, Image as ImageIcon, UploadCloud, X, Layout, User as UserIcon,
  Plus, Palette, ShieldAlert, Key, Star, Hash, AlertTriangle, Pin, PinOff, ArrowUpAZ,
  MoreVertical, ToggleLeft, ToggleRight, MousePointer2, TrendingUp, Filter, ListFilter, Activity, Type, FolderEdit, Check, FolderOpen, Tag, PlusCircle, Zap, HardDrive, Database, Link as LinkIcon, FolderSync, Server,
  Info, BarChart, Copy, FileJson, Code, Mail, UserCheck, Calendar, Contact2, CreditCard, RefreshCw, Crown, Type as FontIcon, Shield, Activity as AnalyticsIcon, CreditCard as CardIcon, CreditCard as PaymentIcon, Webhook, ExternalLink, Activity as LiveIcon, Beaker as TestIcon, Link2
} from 'lucide-react';

interface AdminDashboardProps {
  lang: Language;
  onEditCard: (card: CardData) => void;
  onDeleteRequest: (cardId: string, ownerId: string) => void; 
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, onEditCard, onDeleteRequest }) => {
  const isRtl = lang === 'ar';
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'templates' | 'styles' | 'categories' | 'plans' | 'payment' | 'settings' | 'security' | 'builder'>('stats');
  const [stats, setStats] = useState<{ totalCards: number; activeCards: number; totalViews: number; recentCards: any[] } | null>(null);
  const [usersStats, setUsersStats] = useState<any[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [visualStyles, setVisualStyles] = useState<VisualStyle[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | undefined>(undefined);
  
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<{id: string, ownerId: string} | null>(null);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);
  const [subEditUser, setSubEditUser] = useState<any | null>(null);
  
  const [categoryData, setCategoryData] = useState({ id: '', nameAr: '', nameEn: '', order: 0, isActive: true });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  
  const [planData, setPlanData] = useState<Partial<PricingPlan>>({ 
    id: '', nameAr: '', nameEn: '', price: '0', billingCycleAr: 'سنوياً', billingCycleEn: 'Yearly', 
    featuresAr: [], featuresEn: [], isPopular: false, isActive: true, order: 0, iconName: 'Shield',
    buttonTextAr: 'اشترك الآن', buttonTextEn: 'Subscribe Now', stripeLink: ''
  });
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isPlanSubmitting, setIsPlanSubmitting] = useState(false);
  
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingSub, setIsSavingSub] = useState(false);

  const [settings, setSettings] = useState({ 
    siteNameAr: '', 
    siteNameEn: '', 
    siteLogo: '', 
    siteIcon: '',
    maintenanceMode: false,
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Cairo',
    imageStorageType: 'database' as 'database' | 'server', 
    serverUploadUrl: '',
    analyticsCode: '',
    // Stripe Settings
    stripeLiveMode: false,
    stripeTestPublishableKey: '',
    stripeTestSecretKey: '',
    stripeLivePublishableKey: '',
    stripeLiveSecretKey: '',
    stripeWebhookSecret: ''
  });

  const fetchData = async (quiet = false) => {
    if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) return;
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);
    
    setPermissionError(false);
    try {
      const [sData, uData, stData, tData, cData, vsData, pData] = await Promise.all([
        getAdminStats().catch((err) => { 
          if (err.code === 'permission-denied') setPermissionError(true);
          return { totalCards: 0, activeCards: 0, totalViews: 0, recentCards: [] };
        }),
        getAllUsersWithStats().catch((err) => {
          if (err.code === 'permission-denied') setPermissionError(true);
          return [];
        }),
        getSiteSettings().catch(() => null),
        getAllTemplates().catch(() => []),
        getAllCategories().catch(() => []),
        getAllVisualStyles().catch(() => []),
        getAllPricingPlans().catch(() => [])
      ]);
      setStats(sData as any);
      setUsersStats(uData);
      if (stData) {
        setSettings({
          siteNameAr: stData.siteNameAr || '',
          siteNameEn: stData.siteNameEn || '',
          siteLogo: stData.siteLogo || '',
          siteIcon: stData.siteIcon || '',
          maintenanceMode: stData.maintenanceMode || false,
          primaryColor: stData.primaryColor || '#3b82f6',
          secondaryColor: stData.secondaryColor || '#8b5cf6',
          fontFamily: stData.fontFamily || 'Cairo',
          imageStorageType: stData.imageStorageType || 'database',
          serverUploadUrl: stData.serverUploadUrl || '',
          analyticsCode: stData.analyticsCode || '',
          stripeLiveMode: stData.stripeLiveMode || false,
          stripeTestPublishableKey: stData.stripeTestPublishableKey || '',
          stripeTestSecretKey: stData.stripeTestSecretKey || '',
          stripeLivePublishableKey: stData.stripeLivePublishableKey || '',
          stripeLiveSecretKey: stData.stripeLiveSecretKey || '',
          stripeWebhookSecret: stData.stripeWebhookSecret || ''
        });
      }
      setCustomTemplates(tData as CustomTemplate[]);
      setCategories(cData as TemplateCategory[]);
      setVisualStyles(vsData as VisualStyle[]);
      setPricingPlans(pData);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    try {
      await deletePricingPlan(planToDelete);
      setPlanToDelete(null);
      await fetchData(true);
    } catch (e: any) { 
      alert(isRtl ? `فشل حذف الباقة: ${e.message}` : `Error deleting plan: ${e.message}`); 
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planData.nameAr || !planData.nameEn) {
      alert(isRtl ? "يرجى إدخال اسم الباقة" : "Please enter plan name");
      return;
    }
    
    setIsPlanSubmitting(true);
    try {
      const finalFeaturesAr = planData.featuresAr || [];
      const finalFeaturesEn = planData.featuresEn || [];

      await savePricingPlan({ 
        ...planData, 
        id: editingPlanId || undefined,
        featuresAr: finalFeaturesAr,
        featuresEn: finalFeaturesEn
      });

      alert(isRtl ? "تم حفظ الباقة بنجاح" : "Plan saved successfully");
      
      setPlanData({ 
        id: '', nameAr: '', nameEn: '', price: '0', billingCycleAr: 'سنوياً', billingCycleEn: 'Yearly', 
        featuresAr: [], featuresEn: [], isPopular: false, isActive: true, order: pricingPlans.length + 1, iconName: 'Shield',
        buttonTextAr: 'اشترك الآن', buttonTextEn: 'Subscribe Now', stripeLink: ''
      });
      setEditingPlanId(null);
      await fetchData(true);
    } catch (e: any) { 
      if (e.code === 'permission-denied') {
        alert(isRtl ? "خطأ: ليس لديك صلاحية الكتابة في قاعدة البيانات (تحقق من Rules)" : "Error: Permission denied (Check Firestore Rules)");
      } else {
        alert(isRtl ? `حدث خطأ أثناء الحفظ: ${e.message}` : `Error during save: ${e.message}`); 
      }
    } finally { 
      setIsPlanSubmitting(false); 
    }
  };

  const handleTogglePlanActive = async (plan: PricingPlan) => {
    try { await savePricingPlan({ ...plan, isActive: !plan.isActive }); fetchData(true); } catch (e) { alert("Failed to toggle status"); }
  };

  const handleToggleUserStatus = async (user: any) => {
    const newStatus = user.isActive === false;
    try {
      await toggleUserStatus(user.uid, newStatus);
      await fetchData(true);
    } catch (e) {
      alert(isRtl ? "فشل تحديث حالة المستخدم" : "Failed to update user status");
    }
  };

  const handleToggleTemplateActive = async (tmpl: CustomTemplate) => {
    try {
      await saveCustomTemplate({ ...tmpl, isActive: !tmpl.isActive });
      await fetchData(true);
    } catch (e) {
      alert(isRtl ? "فشل تغيير حالة القالب" : "Failed to toggle template status");
    }
  };

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [templateSearchTerm, setTemplateSearchTerm] = useState('');

  const t = (arOrKey: string, en?: string) => {
    if (en) return isRtl ? arOrKey : en;
    return TRANSLATIONS[arOrKey] ? (TRANSLATIONS[arOrKey][lang] || TRANSLATIONS[arOrKey]['en']) : arOrKey;
  };

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all whitespace-nowrap ${activeTab === id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
      <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const labelTextClasses = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 block mb-1.5";
  const inputClasses = "w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all shadow-inner";

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try { await updateSiteSettings(settings); alert(isRtl ? "تم الحفظ بنجاح" : "Settings saved"); } 
    catch (e) { alert("Error saving settings"); } 
    finally { setSavingSettings(false); }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'siteLogo' | 'siteIcon') => {
    const file = e.target.files?.[0]; if (!file) return;
    try {
      const url = await uploadImageToCloud(file, 'logo', { storageType: settings.imageStorageType, uploadUrl: settings.serverUploadUrl });
      if (url) setSettings(prev => ({ ...prev, [field]: url }));
    } catch (e) { alert("Upload failed"); }
  };

  const getIcon = (name: string) => {
    const Icon = (LucideIcons as any)[name] || Shield;
    return Icon;
  };

  if (loading && !planToDelete && !subEditUser) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{t('جاري التحميل...', 'Loading...')}</p>
    </div>
  );

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-6 space-y-10 animate-fade-in-up">
      {activeTab !== 'builder' && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg"><ShieldCheck size={20} /></div>
              <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{t('نظام الإدارة', 'Admin System')}</span>
            </div>
            <div className="flex items-center gap-4">
               <h1 className="text-4xl md:text-5xl font-black dark:text-white">{t('لوحة التحكم', 'Dashboard')}</h1>
               <button onClick={() => fetchData(true)} disabled={isRefreshing} className={`p-3 bg-white dark:bg-gray-900 border rounded-2xl text-blue-600 hover:bg-blue-50 transition-all shadow-sm ${isRefreshing ? 'animate-spin' : ''}`}>
                  <RefreshCw size={20} />
               </button>
            </div>
          </div>
          <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto no-scrollbar">
            <TabButton id="stats" label={t('البطاقات', 'Cards')} icon={BarChart3} />
            <TabButton id="users" label={t('المسجلين', 'Users')} icon={Users} />
            <TabButton id="plans" label={t('الباقات', 'Plans')} icon={CardIcon} />
            <TabButton id="payment" label={t('الدفع', 'Payments')} icon={PaymentIcon} />
            <TabButton id="templates" label={t('القوالب', 'Templates')} icon={Layout} />
            <TabButton id="styles" label={t('الأنماط', 'Styles')} icon={Palette} />
            <TabButton id="categories" label={t('الأقسام', 'Categories')} icon={FolderEdit} />
            <TabButton id="settings" label={t('إعدادات الموقع العامة', 'Settings')} icon={Settings} />
            <TabButton id="security" label={t('الأمان', 'Security')} icon={Lock} />
          </div>
        </div>
      )}

      <div className="min-h-[400px]">
        {activeTab === 'stats' && (
           <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600"><Users size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي البطاقات', 'Total Cards')}</p><h4 className="text-2xl font-black dark:text-white">{stats?.totalCards || 0}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"><TrendingUp size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('نشط حالياً', 'Active Cards')}</p><h4 className="text-2xl font-black dark:text-white">{stats?.activeCards || 0}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"><Eye size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي المشاهدات', 'Total Views')}</p><h4 className="text-2xl font-black dark:text-white">{stats?.totalViews || 0}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600"><Users size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي المسجلين', 'Registered Users')}</p><h4 className="text-2xl font-black dark:text-white">{usersStats.length}</h4></div>
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3"><Activity className="text-blue-600" size={20}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('آخر البطاقات المحدثة', 'Recent Updates')}</h3></div>
                  <div className="relative w-full md:w-80">
                    <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t('ابحث في البطاقات...', 'Search cards...')} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all`} />
                  </div>
                </div>
                <div className="overflow-x-auto">
                   <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                      <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                         <tr>
                            <td className="px-8 py-5">{t('البطاقة', 'Card')}</td>
                            <td className="px-8 py-5">{t('الرابط', 'Link')}</td>
                            <td className="px-8 py-5">{t('المشاهدات', 'Views')}</td>
                            <td className="px-8 py-5">{t('الحالة', 'Status')}</td>
                            <td className="px-8 py-5">{t('الإجراءات', 'Actions')}</td>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                         {(stats?.recentCards || []).filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase())).map((card) => (
                            <tr key={card.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                               <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">{card.profileImage ? <img src={card.profileImage} className="w-full h-full object-cover" /> : <UserIcon className="text-gray-300" size={18}/>}</div><div><p className="font-black dark:text-white leading-none">{card.name || '---'}</p><p className="text-[10px] font-bold text-gray-400 uppercase mt-1">{card.ownerEmail}</p></div></div></td>
                               <td className="px-8 py-6"><a href={generateShareUrl(card)} target="_blank" className="text-blue-600 font-black text-xs hover:underline uppercase">/{card.id}</a></td>
                               <td className="px-8 py-6"><div className="flex items-center gap-1 font-black text-indigo-600"><Eye size={12}/>{card.viewCount || 0}</div></td>
                               <td className="px-8 py-6">
                                  <button onClick={() => toggleCardStatus(card.id, card.ownerId, card.isActive === false)} className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase ${card.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                     {card.isActive !== false ? t('نشط', 'Active') : t('معطل', 'Disabled')}
                                  </button>
                               </td>
                               <td className="px-8 py-6"><div className="flex gap-2"><button onClick={() => onEditCard(card)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={18}/></button><button onClick={() => setCardToDelete({id: card.id, ownerId: card.ownerId})} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button></div></td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
           </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8 animate-fade-in">
             <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3"><Users className="text-blue-600" size={20}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('قائمة المستخدمين', 'User Registry')}</h3></div>
                  <div className="relative w-full md:w-80">
                    <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                    <input type="text" value={userSearchTerm} onChange={e => setUserSearchTerm(e.target.value)} placeholder={t('ابحث عن مستخدم...', 'Search users...')} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all`} />
                  </div>
                </div>
                <div className="overflow-x-auto">
                   <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                      <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                         <tr>
                            <td className="px-8 py-5">{t('المستخدم', 'User')}</td>
                            <td className="px-8 py-5">{t('الرتبة / الباقة', 'Role / Plan')}</td>
                            <td className="px-8 py-5">{t('الحالة', 'Status')}</td>
                            <td className="px-8 py-5 text-center">{t('الإحصائيات', 'Stats')}</td>
                            <td className="px-8 py-5">{t('الإجراءات', 'Actions')}</td>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                         {usersStats.filter(u => u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())).map((user) => (
                            <tr key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                               <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center"><UserIcon size={20}/></div><div><p className="font-black dark:text-white leading-none">{user.email}</p><p className="text-[9px] font-bold text-gray-400 uppercase mt-1">ID: {user.uid.substring(0, 8)}...</p></div></div></td>
                               <td className="px-8 py-6">
                                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : user.role === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                                     {user.role === 'admin' ? <ShieldCheck size={10}/> : user.role === 'premium' ? <Crown size={10}/> : <UserIcon size={10}/>}
                                     {user.planId ? pricingPlans.find(p => p.id === user.planId)?.[isRtl ? 'nameAr' : 'nameEn'] || user.role : user.role}
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase ${user.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                     {user.isActive !== false ? <CheckCircle2 size={10}/> : <AlertTriangle size={10}/>}
                                     {user.isActive !== false ? t('نشط', 'Active') : t('محظور', 'Banned')}
                                  </div>
                               </td>
                               <td className="px-8 py-6 text-center">
                                  <div className="flex flex-col items-center">
                                     <span className="font-black text-gray-900 dark:text-white text-xs">{user.cardCount || 0} {t('كروت', 'Cards')}</span>
                                     <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold"><Eye size={10}/>{user.totalViews || 0}</div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-2">
                                     <button 
                                        onClick={() => setSubEditUser(user)} 
                                        className="p-2.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        title={t('تعديل الحساب والباقة', 'Edit Account & Plan')}
                                     >
                                        <Edit3 size={18}/>
                                     </button>
                                     <button 
                                        onClick={() => handleToggleUserStatus(user)} 
                                        className={`p-2.5 rounded-xl transition-all shadow-sm ${user.isActive !== false ? 'text-red-500 bg-red-50 hover:bg-red-500 hover:text-white' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white'}`}
                                        title={user.isActive !== false ? t('إيقاف الحساب', 'Disable User') : t('تنشيط الحساب', 'Enable User')}
                                     >
                                        <Power size={18}/>
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="w-full space-y-10 animate-fade-in">
             <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                   <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><CardIcon size={24} /></div>
                   <h2 className="text-2xl font-black dark:text-white uppercase leading-none">{editingPlanId ? t('تعديل باقة', 'Edit Plan') : t('إضافة باقة جديدة', 'New Pricing Plan')}</h2>
                </div>

                <form onSubmit={handleSavePlan} className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div><label className={labelTextClasses}>{t('الاسم (AR)', 'Name (AR)')}</label><input type="text" required value={planData.nameAr} onChange={e => setPlanData({...planData, nameAr: e.target.value})} className={inputClasses} placeholder="باقة المحترفين" /></div>
                      <div><label className={labelTextClasses}>{t('الاسم (EN)', 'Name (EN)')}</label><input type="text" required value={planData.nameEn} onChange={e => setPlanData({...planData, nameEn: e.target.value})} className={inputClasses} placeholder="Pro Plan" /></div>
                      <div><label className={labelTextClasses}>{t('السعر (USD)', 'Price')}</label><input type="text" required value={planData.price} onChange={e => setPlanData({...planData, price: e.target.value})} className={inputClasses} placeholder="29" /></div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <label className={labelTextClasses}>{t('المميزات (عربي - ميزة في كل سطر)', 'Features AR')}</label>
                         <textarea rows={4} value={planData.featuresAr?.join('\n')} onChange={e => setPlanData({...planData, featuresAr: e.target.value.split('\n').filter(l => l.trim() !== '')})} className={inputClasses + " resize-none"} placeholder="بطاقات غير محدودة&#10;وسام توثيق" />
                      </div>
                      <div className="space-y-4">
                         <label className={labelTextClasses}>{t('المميزات (EN - One per line)', 'Features EN')}</label>
                         <textarea rows={4} value={planData.featuresEn?.join('\n')} onChange={e => setPlanData({...planData, featuresEn: e.target.value.split('\n').filter(l => l.trim() !== '')})} className={inputClasses + " resize-none"} placeholder="Unlimited Cards&#10;Verified Badge" />
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div><label className={labelTextClasses}>{t('دورة الفوترة (AR)', 'Billing Cycle AR')}</label><input type="text" value={planData.billingCycleAr} onChange={e => setPlanData({...planData, billingCycleAr: e.target.value})} className={inputClasses} placeholder="سنوياً" /></div>
                      <div><label className={labelTextClasses}>{t('دورة الفوترة (EN)', 'Billing Cycle EN')}</label><input type="text" value={planData.billingCycleEn} onChange={e => setPlanData({...planData, billingCycleEn: e.target.value})} className={inputClasses} placeholder="Yearly" /></div>
                      <div><label className={labelTextClasses}>{t('نص الزر (AR)', 'Button Text AR')}</label><input type="text" value={planData.buttonTextAr} onChange={e => setPlanData({...planData, buttonTextAr: e.target.value})} className={inputClasses} /></div>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                      <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] border border-blue-100 dark:border-blue-900/30 space-y-4">
                         <div className="flex items-center gap-3">
                            <Link2 className="text-blue-600" size={20} />
                            <label className={labelTextClasses + " !mb-0"}>{t('رابط الدفع من Stripe', 'Stripe Payment Link')}</label>
                         </div>
                         <input 
                           type="url" 
                           value={planData.stripeLink || ''} 
                           onChange={e => setPlanData({...planData, stripeLink: e.target.value})} 
                           className={inputClasses + " font-mono text-xs"} 
                           placeholder="https://buy.stripe.com/..." 
                         />
                         <p className="text-[9px] font-bold text-gray-400 italic px-2">
                           {isRtl ? "* سيتم توجيه المستخدم لهذا الرابط مباشرة عند الضغط على زر الاشتراك." : "* User will be redirected to this link when clicking subscribe."}
                         </p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                      <div><label className={labelTextClasses}>{t('الترتيب', 'Order')}</label><input type="number" value={planData.order} onChange={e => setPlanData({...planData, order: parseInt(e.target.value) || 0})} className={inputClasses} /></div>
                      <div><label className={labelTextClasses}>{t('الأيقونة (Lucide Name)', 'Icon')}</label><input type="text" value={planData.iconName} onChange={e => setPlanData({...planData, iconName: e.target.value})} className={inputClasses} placeholder="Crown, Star, Shield" /></div>
                      <div className="flex items-center gap-4 h-14 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                         <span className="text-[10px] font-black text-gray-400 uppercase">{t('الأكثر طلباً؟', 'Is Popular?')}</span>
                         <button type="button" onClick={() => setPlanData({...planData, isPopular: !planData.isPopular})} className={`w-10 h-6 rounded-full relative transition-all ${planData.isPopular ? 'bg-amber-500' : 'bg-gray-300'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (planData.isPopular ? 'left-1' : 'left-5') : (planData.isPopular ? 'right-1' : 'right-5')}`} />
                         </button>
                      </div>
                      <button type="submit" disabled={isPlanSubmitting} className="py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                         {isPlanSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                         {editingPlanId ? t('تحديث الباقة', 'Update Plan') : t('حفظ الباقة', 'Save Plan')}
                      </button>
                   </div>
                </form>
             </div>

             <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="overflow-x-auto">
                   <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                      <thead>
                         <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                            <td className="px-10 py-5">{t('الباقة', 'Plan')}</td>
                            <td className="px-10 py-5 text-center">{t('السعر', 'Price')}</td>
                            <td className="px-10 py-5 text-center">{t('الحالة', 'Status')}</td>
                            <td className="px-10 py-5 text-center">{t('الإجراءات', 'Actions')}</td>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                         {pricingPlans.map((plan) => (
                            <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                               <td className="px-10 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.isPopular ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <Zap size={20} />
                                     </div>
                                     <div>
                                        <p className="font-black dark:text-white leading-none">{isRtl ? plan.nameAr : plan.nameEn}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                           <p className="text-[10px] font-bold text-gray-400 uppercase">ID: {plan.id}</p>
                                           {/* Fix: Wrap Link2 in a span because Lucide icons do not support the 'title' prop directly */}
                                           {plan.stripeLink && <span title="Has Stripe Link"><Link2 size={10} className="text-blue-500" /></span>}
                                        </div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-10 py-6 text-center font-black text-xl text-blue-600">${plan.price}</td>
                               <td className="px-10 py-6 text-center">
                                  <button onClick={() => handleTogglePlanActive(plan)} className={`inline-flex items-center gap-2 px-6 py-2 rounded-2xl text-[9px] font-black uppercase shadow-sm ${plan.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                      {plan.isActive !== false ? t('نشط', 'Active') : t('معطل', 'Disabled')}
                                  </button>
                               </td>
                               <td className="px-10 py-6 text-center">
                                  <div className="flex justify-center gap-2">
                                     <button onClick={() => { setEditingPlanId(plan.id); setPlanData(plan); }} className="p-3 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18} /></button>
                                     <button onClick={() => setPlanToDelete(plan.id)} className="p-3 text-red-600 bg-red-50 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'payment' && (
           <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
              <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-12">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><PaymentIcon size={24}/></div>
                    <h2 className="text-2xl font-black dark:text-white uppercase leading-none">{t('مختبر إعدادات الدفع (Stripe)', 'Payment DNA & Gateway Lab')}</h2>
                 </div>

                 <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-2xl ${settings.stripeLiveMode ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                          {settings.stripeLiveMode ? <LiveIcon size={24}/> : <TestIcon size={24}/>}
                       </div>
                       <div>
                          <span className="text-xs font-black uppercase tracking-widest dark:text-white block">{settings.stripeLiveMode ? t('الوضع المباشر (LIVE)', 'Live Production Mode') : t('وضع الاختبار (TEST)', 'Development Test Mode')}</span>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{settings.stripeLiveMode ? t('يتم استقبال دفع حقيقي الآن', 'Real payments are active') : t('الدفع في بيئة تجريبية فقط', 'Sandboxed test environment')}</p>
                       </div>
                    </div>
                    <button onClick={() => setSettings({...settings, stripeLiveMode: !settings.stripeLiveMode})} className={`w-14 h-7 rounded-full relative transition-all ${settings.stripeLiveMode ? 'bg-emerald-600 shadow-lg' : 'bg-amber-600 shadow-lg'}`}>
                       <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${isRtl ? (settings.stripeLiveMode ? 'left-1' : 'left-8') : (settings.stripeLiveMode ? 'right-1' : 'right-8')}`} />
                    </button>
                 </div>

                 <div className="grid grid-cols-1 gap-10">
                    <div className="space-y-6">
                       <div className="flex items-center gap-2 mb-4">
                          {/* Fix: Use TestIcon instead of Beaker as it was imported with an alias */}
                          <TestIcon size={16} className="text-amber-500" />
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('مفاتيح الاختبار', 'Test Mode Credentials')}</h4>
                       </div>
                       <div><label className={labelTextClasses}>{t('المفتاح العام للاختبار', 'Test Publishable Key')}</label><input type="text" value={settings.stripeTestPublishableKey} onChange={e => setSettings({...settings, stripeTestPublishableKey: e.target.value})} className={inputClasses} placeholder="pk_test_..." /></div>
                       <div><label className={labelTextClasses}>{t('المفتاح السري للاختبار', 'Test Secret Key')}</label><input type="password" value={settings.stripeTestSecretKey} onChange={e => setSettings({...settings, stripeTestSecretKey: e.target.value})} className={inputClasses} placeholder="sk_test_..." /></div>
                    </div>

                    <div className="pt-10 border-t dark:border-gray-800 space-y-6">
                       <div className="flex items-center gap-2 mb-4">
                          <Zap size={16} className="text-emerald-500" />
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{t('مفاتيح الوضع المباشر', 'Live Mode Credentials')}</h4>
                       </div>
                       <div><label className={labelTextClasses}>{t('المفتاح العام المباشر', 'Live Publishable Key')}</label><input type="text" value={settings.stripeLivePublishableKey} onChange={e => setSettings({...settings, stripeLivePublishableKey: e.target.value})} className={inputClasses} placeholder="pk_live_..." /></div>
                       <div><label className={labelTextClasses}>{t('المفتاح السري المباشر', 'Live Secret Key')}</label><input type="password" value={settings.stripeLiveSecretKey} onChange={e => setSettings({...settings, stripeLiveSecretKey: e.target.value})} className={inputClasses} placeholder="sk_live_..." /></div>
                    </div>

                    <div className="pt-10 border-t dark:border-gray-800 space-y-8">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl shadow-sm"><Webhook size={24}/></div>
                          <h3 className="text-xl font-black dark:text-white uppercase leading-none">{t('إعدادات الـ Webhooks', 'Stripe Webhook DNA')}</h3>
                       </div>

                       <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[2rem] border border-gray-100 dark:border-gray-700 space-y-4">
                          <label className={labelTextClasses}>{t('رابط استماع الهوك (Webhook URL)', 'Your Webhook Endpoint')}</label>
                          <div className="flex gap-2">
                             <input type="text" readOnly value={`${window.location.origin}/api/webhook/stripe`} className={inputClasses + " bg-gray-100/50 dark:bg-black/20 font-mono text-xs cursor-default"} />
                             <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/api/webhook/stripe`); alert("Copied!"); }} className="p-4 bg-white dark:bg-gray-800 border rounded-2xl text-indigo-600 hover:bg-indigo-50 transition-all"><Copy size={18}/></button>
                          </div>
                          <p className="text-[9px] font-bold text-gray-400 italic px-2">
                             {isRtl ? "* قم بنسخ هذا الرابط ووضعه في لوحة تحكم Stripe لإرسال إشعارات الدفع التلقائية." : "* Copy this URL to your Stripe Dashboard to handle automatic payment notifications."}
                          </p>
                       </div>

                       <div><label className={labelTextClasses}>{t('السر الخاص بالتوقيع (Signing Secret)', 'Webhook Signing Secret')}</label><input type="password" value={settings.stripeWebhookSecret} onChange={e => setSettings({...settings, stripeWebhookSecret: e.target.value})} className={inputClasses} placeholder="whsec_..." /></div>
                    </div>
                 </div>

                 <button onClick={handleSaveSettings} disabled={savingSettings} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50">
                    {savingSettings ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                    {t('حفظ إعدادات الدفع', 'Save Gateway Config')}
                 </button>
              </div>
           </div>
        )}

        {activeTab === 'templates' && (
           <div className="space-y-10 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><Layout size={24} /></div>
                  <div><h2 className="text-2xl font-black dark:text-white uppercase leading-none mb-1">{t('إدارة القوالب', 'Templates Manager')}</h2><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('تحكم في القوالب المتاحة للمستخدمين عبر نظام الجدول', 'Manage available templates via table view')}</p></div>
                </div>
                <button onClick={() => setActiveTab('builder')} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-3 hover:scale-105 transition-all"><Plus size={18} /> {t('إضافة قالب جديد', 'New Template')}</button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3"><Layout className="text-blue-600" size={20}/><h3 className="text-lg font-black dark:text-white uppercase tracking-widest">{t('قائمة القوالب', 'Template List')}</h3></div>
                  <div className="relative w-full md:w-80">
                    <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                    <input type="text" value={templateSearchTerm} onChange={e => setTemplateSearchTerm(e.target.value)} placeholder={t('ابحث في القوالب...', 'Search templates...')} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border-none font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all`} />
                  </div>
                </div>
                <div className="overflow-x-auto">
                   <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                      <thead className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                         <tr>
                            <td className="px-8 py-5">{t('القالب', 'Template')}</td>
                            <td className="px-8 py-5">{t('القسم', 'Category')}</td>
                            <td className="px-8 py-5">{t('الحالة', 'Status')}</td>
                            <td className="px-8 py-5">{t('الإجراءات', 'Actions')}</td>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                         {customTemplates.filter(t => (isRtl ? t.nameAr : t.nameEn).toLowerCase().includes(templateSearchTerm.toLowerCase())).map((tmpl) => (
                            <tr key={tmpl.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 border dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0">
                                        <div className="scale-[0.15] origin-center w-[400px] h-[700px] pointer-events-none">
                                           <CardPreview data={{...SAMPLE_DATA[lang], templateId: tmpl.id} as any} lang={lang} customConfig={tmpl.config} hideSaveButton={true}/>
                                        </div>
                                     </div>
                                     <div>
                                        <p className="font-black dark:text-white leading-none mb-1">{isRtl ? tmpl.nameAr : tmpl.nameEn}</p>
                                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">ID: {tmpl.id}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg text-[9px] font-black uppercase">
                                     <Tag size={10} />
                                     {tmpl.categoryId}
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex gap-2">
                                     <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${tmpl.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {tmpl.isActive ? t('نشط', 'Active') : t('معطل', 'Disabled')}
                                     </div>
                                     {tmpl.isFeatured && (
                                        <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-[8px] font-black uppercase flex items-center gap-1">
                                           <Star size={8} fill="currentColor"/> {t('مميز', 'Pro')}
                                        </div>
                                     )}
                                     {tmpl.restrictedUserId && (
                                        <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-[8px] font-black uppercase flex items-center gap-1">
                                           <Lock size={8}/> {t('خاص', 'Private')}
                                        </div>
                                     )}
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex gap-2">
                                     <button 
                                        onClick={() => handleToggleTemplateActive(tmpl)} 
                                        className={`p-2.5 rounded-xl transition-all shadow-sm ${tmpl.isActive ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white' : 'text-gray-400 bg-gray-50 hover:bg-gray-600 hover:text-white'}`}
                                        title={tmpl.isActive ? t('تعطيل القالب', 'Deactivate') : t('تنشيط القالب', 'Activate')}
                                     >
                                        <Power size={18}/>
                                     </button>
                                     <button onClick={() => { setEditingTemplate(tmpl); setActiveTab('builder'); }} className="p-2.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18}/></button>
                                     <button onClick={() => setTemplateToDelete(tmpl.id)} className="p-2.5 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18}/></button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
              </div>
           </div>
        )}

        {activeTab === 'styles' && <StyleManager lang={lang} />}

        {activeTab === 'categories' && (
           <div className="space-y-10 animate-fade-in">
              <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl">
                 <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><FolderEdit size={24}/></div>
                    <h2 className="text-2xl font-black dark:text-white uppercase leading-none">{editingCategoryId ? t('تعديل قسم', 'Edit Category') : t('إضافة قسم جديد', 'New Category')}</h2>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div><label className={labelTextClasses}>{t('الاسم (AR)', 'Name (AR)')}</label><input type="text" value={categoryData.nameAr} onChange={e => setCategoryData({...categoryData, nameAr: e.target.value})} className={inputClasses} /></div>
                    <div><label className={labelTextClasses}>{t('الاسم (EN)', 'Name (EN)')}</label><input type="text" value={categoryData.nameEn} onChange={e => setCategoryData({...categoryData, nameEn: e.target.value})} className={inputClasses} /></div>
                    <div><label className={labelTextClasses}>{t('الترتيب', 'Order')}</label><input type="number" value={categoryData.order} onChange={e => setCategoryData({...categoryData, order: parseInt(e.target.value) || 0})} className={inputClasses} /></div>
                    <button onClick={async () => { setIsCategorySubmitting(true); try { await saveTemplateCategory({...categoryData, id: editingCategoryId || undefined}); setCategoryData({id: '', nameAr: '', nameEn: '', order: categories.length + 1, isActive: true}); setEditingCategoryId(null); await fetchData(true); } finally { setIsCategorySubmitting(false); } }} disabled={isCategorySubmitting} className="py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all">
                       {isCategorySubmitting ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18}/>}
                       {editingCategoryId ? t('تحديث القسم', 'Update') : t('حفظ القسم', 'Save')}
                    </button>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {categories.map(cat => (
                   <div key={cat.id} className="bg-white dark:bg-gray-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group">
                      <div className="flex items-center gap-5">
                         <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner"><Tag size={20}/></div>
                         <div><h3 className="font-black dark:text-white leading-none mb-1">{isRtl ? cat.nameAr : cat.nameEn}</h3><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('ترتيب', 'Order')}: {cat.order}</p></div>
                      </div>
                      <div className="flex gap-2"><button onClick={() => { setEditingCategoryId(cat.id); setCategoryData(cat); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit3 size={18}/></button><button onClick={() => setCategoryToDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18}/></button></div>
                   </div>
                 ))}
              </div>
           </div>
        )}

        {activeTab === 'settings' && (
           <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in">
              <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-10">
                 <div className="flex items-center gap-4"><div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg"><Settings size={24}/></div><h2 className="text-2xl font-black dark:text-white uppercase leading-none">{t('إعدادات الموقع العامة', 'Global Site Settings')}</h2></div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                       <div><label className={labelTextClasses}>{t('اسم الموقع (AR)', 'Site Name (AR)')}</label><input type="text" value={settings.siteNameAr} onChange={e => setSettings({...settings, siteNameAr: e.target.value})} className={inputClasses} /></div>
                       <div><label className={labelTextClasses}>{t('اسم الموقع (EN)', 'Site Name (EN)')}</label><input type="text" value={settings.siteNameEn} onChange={e => setSettings({...settings, siteNameEn: e.target.value})} className={inputClasses} /></div>
                       <div><label className={labelTextClasses}>{t('الخط المستخدم', 'Primary Font')}</label><select value={settings.fontFamily} onChange={e => setSettings({...settings, fontFamily: e.target.value})} className={inputClasses}>{AVAILABLE_FONTS.map(f => <option key={f.id} value={f.id}>{isRtl ? f.nameAr : f.name}</option>)}</select></div>
                       <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                          <div className="flex items-center gap-3"><Power className="text-red-500" size={18}/><span className="text-[10px] font-black uppercase tracking-widest dark:text-white">{t('وضع الصيانة', 'Maintenance Mode')}</span></div>
                          <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-12 h-6 rounded-full relative transition-all ${settings.maintenanceMode ? 'bg-red-500 shadow-md' : 'bg-gray-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-md ${isRtl ? (settings.maintenanceMode ? 'right-7' : 'right-1') : (settings.maintenanceMode ? 'left-7' : 'left-1')}`} /></button>
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 text-center">
                          <label className={labelTextClasses}>{t('شعار الموقع', 'Site Logo')}</label>
                          <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-700 mx-auto mb-4 flex items-center justify-center overflow-hidden">{settings.siteLogo ? <img src={settings.siteLogo} className="w-full h-full object-contain p-2" /> : <ImageIcon className="text-gray-300" size={32}/>}</div>
                          <input type="file" ref={logoInputRef} onChange={e => handleLogoUpload(e, 'siteLogo')} className="hidden" accept="image/*" /><button onClick={() => logoInputRef.current?.click()} className="px-6 py-2 bg-white dark:bg-gray-900 border rounded-xl text-[10px] font-black uppercase shadow-sm flex items-center justify-center gap-2 mx-auto hover:bg-blue-50 transition-all"><UploadCloud size={14}/> {t('رفع الشعار', 'Upload')}</button>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <ColorPicker label={t('اللون الأساسي', 'Primary Color')} value={settings.primaryColor} onChange={(v: string) => setSettings({...settings, primaryColor: v})} />
                          <ColorPicker label={t('اللون الثانوي', 'Secondary Color')} value={settings.secondaryColor} onChange={(v: string) => setSettings({...settings, secondaryColor: v})} />
                       </div>
                    </div>
                 </div>

                 <div className="pt-10 border-t border-gray-100 dark:border-gray-800 space-y-8">
                    <div className="flex items-center gap-4"><div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl shadow-sm"><HardDrive size={22}/></div><h3 className="text-xl font-black dark:text-white uppercase leading-none">{t('إعدادات تخزين الملفات', 'Media Storage DNA')}</h3></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 space-y-4">
                          <label className={labelTextClasses}>{t('نوع التخزين', 'Storage Strategy')}</label>
                          <div className="grid grid-cols-2 gap-2">
                             <button onClick={() => setSettings({...settings, imageStorageType: 'database'})} className={`py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.imageStorageType === 'database' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-900 text-gray-400'}`}><Database size={18}/> <span className="text-[9px] font-black uppercase">Firebase</span></button>
                             <button onClick={() => setSettings({...settings, imageStorageType: 'server'})} className={`py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${settings.imageStorageType === 'server' ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white dark:bg-gray-900 text-gray-400'}`}><Server size={18}/> <span className="text-[9px] font-black uppercase">Private Server</span></button>
                          </div>
                       </div>
                       {settings.imageStorageType === 'server' && (
                         <div className="space-y-4 animate-fade-in">
                            <label className={labelTextClasses}>{t('رابط ملف الرفع (PHP URL)', 'PHP Upload Script URL')}</label>
                            <div className="relative">
                               <LinkIcon className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
                               <input type="url" value={settings.serverUploadUrl} onChange={e => setSettings({...settings, serverUploadUrl: e.target.value})} placeholder="https://domain.com/upload.php" className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} font-mono text-xs`} />
                            </div>
                         </div>
                       )}
                    </div>
                 </div>

                 <button onClick={handleSaveSettings} disabled={savingSettings} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase shadow-2xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50">{savingSettings ? <Loader2 className="animate-spin mx-auto" /> : <Save size={24} className="mx-auto" />}</button>
              </div>
           </div>
        )}

        {activeTab === 'security' && (
           <div className="w-full max-w-xl mx-auto animate-fade-in">
              <div className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-10">
                 <div className="flex items-center gap-4"><div className="p-3 bg-red-600 text-white rounded-2xl shadow-lg"><Lock size={24}/></div><h2 className="text-2xl font-black dark:text-white uppercase leading-none">{t('تغيير بيانات الأدمن', 'Admin Security Lab')}</h2></div>
                 <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-4"><ShieldAlert className="text-amber-600 shrink-0" size={24}/><p className="text-xs font-bold text-amber-800 dark:text-amber-400 leading-relaxed">{t('تنبيه: ستحتاج لإعادة تسجيل الدخول بالبيانات الجديدة فوراً بعد الحفظ.', 'Caution: You must re-login with the new credentials immediately after saving.')}</p></div>
                 <div className="space-y-6">
                    <div><label className={labelTextClasses}>{t('كلمة السر الحالية', 'Current Password')}</label><input type="password" id="curr-pass" className={inputClasses} placeholder="••••••••" /></div>
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                       <div><label className={labelTextClasses}>{t('البريد الجديد', 'New Email')}</label><input type="email" id="new-email" defaultValue={auth.currentUser?.email || ''} className={inputClasses} /></div>
                       <div><label className={labelTextClasses}>{t('كلمة السر الجديدة', 'New Password')}</label><input type="password" id="new-pass" className={inputClasses} placeholder="••••••••" /></div>
                    </div>
                 </div>
                 <button onClick={async () => { const curr = (document.getElementById('curr-pass') as HTMLInputElement).value; const email = (document.getElementById('new-email') as HTMLInputElement).value; const pass = (document.getElementById('new-pass') as HTMLInputElement).value; if (!curr) return alert("Current password required"); try { await updateUserSecurity(curr, email, pass || undefined); alert("Success! Please re-login."); auth.signOut().then(() => window.location.reload()); } catch (e: any) { alert(getAuthErrorMessage(e.code, isRtl ? 'ar' : 'en')); } }} className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black text-lg uppercase shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all"><Key size={24}/> {t('تحديث بيانات الأمان', 'Apply Security Patch')}</button>
              </div>
           </div>
        )}

        {activeTab === 'builder' && <TemplateBuilder lang={lang} initialTemplate={editingTemplate} onSave={async (tmpl) => { await saveCustomTemplate(tmpl); setEditingTemplate(undefined); setActiveTab('templates'); await fetchData(true); }} onCancel={() => { setEditingTemplate(undefined); setActiveTab('templates'); }} />}
      </div>

      {subEditUser && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-zoom-in">
              <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center">
                 <div className="flex items-center gap-4"><div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl"><Crown size={24}/></div><h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">{t('إدارة اشتراك العضو', 'User Subscription DNA')}</h3></div>
                 <button onClick={() => setSubEditUser(null)} className="p-2 text-gray-400 hover:text-red-500"><X size={24}/></button>
              </div>
              <div className="p-8 overflow-y-auto max-h-[75vh] no-scrollbar">
                 <div className="flex items-center gap-4 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 mb-8"><div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg"><UserIcon size={28}/></div><div><p className="font-black dark:text-white text-xl leading-none">{subEditUser.email}</p><p className="text-[10px] font-bold text-gray-400 mt-1 uppercase">ID: {subEditUser.uid}</p></div></div>
                 
                 <div className="space-y-6">
                    <label className={labelTextClasses}>{t('اختر الباقة المناسبة للمستخدم', 'Select User Subscription Plan')}</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       <button 
                          onClick={() => setSubEditUser({...subEditUser, role: 'user', planId: null})} 
                          className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 text-center ${subEditUser.role === 'user' ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-[1.02]' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                       >
                          <UserIcon size={32} />
                          <div>
                             <p className="font-black text-sm uppercase">Basic User</p>
                             <p className="text-[10px] font-bold opacity-60 mt-1">{isRtl ? 'عضوية مجانية افتراضية' : 'Default free membership'}</p>
                          </div>
                       </button>

                       {pricingPlans.map(plan => {
                          const Icon = getIcon(plan.iconName);
                          const isSelected = subEditUser.planId === plan.id;
                          return (
                             <button 
                                key={plan.id}
                                onClick={() => setSubEditUser({...subEditUser, role: 'premium', planId: plan.id})} 
                                className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 text-center ${isSelected ? 'bg-amber-600 border-amber-600 text-white shadow-xl scale-[1.02]' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                             >
                                <Icon size={32} />
                                <div>
                                   <p className="font-black text-sm uppercase">{isRtl ? plan.nameAr : plan.nameEn}</p>
                                   <p className="text-xl font-black mt-1">${plan.price}</p>
                                </div>
                             </button>
                          );
                       })}
                    </div>
                 </div>

                 <div className={`mt-10 space-y-8 transition-all duration-500 ${subEditUser.role === 'premium' ? 'opacity-100 translate-y-0' : 'opacity-40 -translate-y-4 pointer-events-none'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className={labelTextClasses}>{t('تاريخ انتهاء المميزات', 'Premium Expiry Date')}</label>
                          <div className="relative"><Calendar className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} /><input type="date" value={subEditUser.premiumUntil || ''} onChange={e => setSubEditUser({...subEditUser, premiumUntil: e.target.value})} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} /></div>
                       </div>
                    </div>
                 </div>

                 <button onClick={async () => { setIsSavingSub(true); try { await updateUserSubscription(subEditUser.uid, subEditUser.role, subEditUser.planId || null, subEditUser.role === 'premium' ? subEditUser.premiumUntil : null); alert(isRtl ? "تم تحديث اشتراك العضو بنجاح" : "User subscription updated"); setSubEditUser(null); await fetchData(true); } finally { setIsSavingSub(false); } }} disabled={isSavingSub} className="w-full mt-10 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg uppercase shadow-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
                    {isSavingSub ? <Loader2 className="animate-spin" /> : <Save size={24}/>} {t('اعتماد وحفظ الاشتراك', 'Commit & Save Subscription')}
                 </button>
              </div>
           </div>
        </div>
      )}

      {cardToDelete && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
           <div className="bg-white dark:bg-gray-900 w-full max-sm rounded-[3rem] p-10 text-center shadow-2xl border border-gray-100 dark:border-gray-800 animate-zoom-in">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={40} /></div>
              <h3 className="text-2xl font-black mb-4 dark:text-white">{t('حذف البطاقة نهائياً؟', 'Permanent Delete?')}</h3>
              <p className="text-xs font-bold text-gray-400 mb-8">{t('سيتم مسح كافة البيانات من السيرفر فوراً ولا يمكن استرجاعها.', 'All data will be wiped and cannot be recovered.')}</p>
              <div className="flex flex-col gap-3">
                 <button onClick={async () => { await deleteUserCard(cardToDelete.ownerId, cardToDelete.id); setCardToDelete(null); await fetchData(true); }} className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase shadow-xl hover:brightness-110">تأكيد الحذف النهائي</button>
                 <button onClick={() => setCardToDelete(null)} className="py-5 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-3xl font-black text-sm uppercase">تراجع</button>
              </div>
           </div>
        </div>
      )}

      {planToDelete && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
           <div className="bg-white dark:bg-gray-900 w-full max-sm rounded-[3rem] p-10 text-center shadow-2xl border border-gray-100 dark:border-gray-800 animate-zoom-in">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={40} /></div>
              <h3 className="text-2xl font-black mb-4 dark:text-white">{t('حذف الباقة؟', 'Delete Plan?')}</h3>
              <p className="text-xs font-bold text-gray-400 mb-8">{isRtl ? 'هل أنت متأكد من حذف هذه الباقة؟ سيؤثر هذا على ما يظهر للمستخدمين في الصفحة الرئيسية.' : 'Are you sure? This will affect the landing page pricing section.'}</p>
              <div className="flex flex-col gap-3">
                 <button onClick={confirmDeletePlan} className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase shadow-xl hover:brightness-110">تأكيد الحذف</button>
                 <button onClick={() => setPlanToDelete(null)} className="py-5 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-3xl font-black text-sm uppercase">إلغاء</button>
              </div>
           </div>
        </div>
      )}

      {templateToDelete && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
           <div className="bg-white dark:bg-gray-900 w-full max-sm rounded-[3rem] p-10 text-center shadow-2xl border border-gray-100 dark:border-gray-800 animate-zoom-in">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={40} /></div>
              <h3 className="text-2xl font-black mb-4 dark:text-white">{t('حذف القالب؟', 'Delete Template?')}</h3>
              <p className="text-xs font-bold text-gray-400 mb-8">{t('سيختفي القالب من قائمة الاختيار للمستخدمين.', 'Users will no longer be able to select this template.')}</p>
              <div className="flex flex-col gap-3">
                 <button onClick={async () => { await deleteTemplate(templateToDelete); setTemplateToDelete(null); await fetchData(true); }} className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase shadow-xl hover:brightness-110">تأكيد الحذف</button>
                 <button onClick={() => setTemplateToDelete(null)} className="py-5 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-3xl font-black text-sm uppercase">تراجع</button>
              </div>
           </div>
        </div>
      )}

      {categoryToDelete && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
           <div className="bg-white dark:bg-gray-900 w-full max-sm rounded-[3rem] p-10 text-center shadow-2xl border border-gray-100 dark:border-gray-800 animate-zoom-in">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Trash2 size={40} /></div>
              <h3 className="text-2xl font-black mb-4 dark:text-white">{t('حذف القسم؟', 'Delete Category?')}</h3>
              <p className="text-xs font-bold text-gray-400 mb-8">{t('تأكد من عدم وجود قوالب مرتبطة بهذا القسم أولاً.', 'Ensure no templates are linked to this category.')}</p>
              <div className="flex flex-col gap-3">
                 <button onClick={async () => { await deleteTemplateCategory(categoryToDelete); setCategoryToDelete(null); await fetchData(true); }} className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase shadow-xl hover:brightness-110">تأكيد الحذف</button>
                 <button onClick={() => setCategoryToDelete(null)} className="py-5 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-3xl font-black text-sm uppercase">إلغاء</button>
              </div>
           </div>
        </div>
      )}

      <ColorPicker label="" value="" onChange={() => {}} style={{display: 'none'}} />
    </div>
  );
};

const ColorPicker = ({ label, value, onChange, style }: any) => (
  <div style={style} className={`flex items-center justify-between p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm`}>
    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-2">
       <div className="relative w-8 h-8 rounded-xl overflow-hidden border shadow-sm">
          <input type="color" value={value || '#3b82f6'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150" />
          <div className="w-full h-full" style={{ backgroundColor: value || '#3b82f6' }} />
       </div>
       <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)} className="bg-transparent border-none outline-none font-mono text-[9px] font-black w-16 text-center dark:text-gray-400 uppercase" placeholder="#HEX" />
    </div>
  </div>
);

export default AdminDashboard;
