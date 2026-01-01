
import React, { useEffect, useState, useRef } from 'react';
import { 
  getAdminStats, ADMIN_EMAIL, deleteUserCard, 
  getSiteSettings, updateSiteSettings, updateAdminSecurity,
  saveCustomTemplate, getAllTemplates, deleteTemplate,
  auth, getAuthErrorMessage, toggleCardStatus
} from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import { Language, CardData, CustomTemplate } from '../types';
import { generateShareUrl } from '../utils/share';
import TemplateBuilder from '../components/TemplateBuilder';
import { 
  BarChart3, Users, Clock, Loader2,
  ShieldCheck, Trash2, Edit3, Eye, Settings, 
  Globe, Power, Save, Search, LayoutGrid,
  Lock, CheckCircle2, Image as ImageIcon, UploadCloud, X, Layout, 
  Plus, Palette, ShieldAlert, Key, Star, Hash, AlertTriangle, Pin, PinOff, ArrowUpAZ,
  MoreVertical, ToggleLeft, ToggleRight, MousePointer2, TrendingUp, Filter, ListFilter, Activity, Type
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
  const [activeTab, setActiveTab] = useState<'stats' | 'templates' | 'settings' | 'security' | 'builder'>('stats');
  const [stats, setStats] = useState<{ totalCards: number; activeCards: number; totalViews: number; recentCards: any[] } | null>(null);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | undefined>(undefined);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({ 
    siteNameAr: '', 
    siteNameEn: '', 
    siteLogo: '', 
    siteIcon: '',
    maintenanceMode: false,
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Cairo'
  });

  const fontOptions = [
    { name: 'Cairo', value: 'Cairo' },
    { name: 'Tajawal', value: 'Tajawal' },
    { name: 'Almarai', value: 'Almarai' },
    { name: 'IBM Plex Sans Arabic', value: 'IBM Plex Sans Arabic' },
    { name: 'Montserrat', value: 'Montserrat' },
    { name: 'Roboto', value: 'Roboto' }
  ];

  const fetchData = async () => {
    if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) return;
    setLoading(true);
    try {
      const [sData, stData, tData] = await Promise.all([
        getAdminStats().catch(() => ({ totalCards: 0, activeCards: 0, totalViews: 0, recentCards: [] })),
        getSiteSettings().catch(() => null),
        getAllTemplates().catch(() => [])
      ]);
      setStats(sData as any);
      if (stData) {
        setSettings({
          siteNameAr: stData.siteNameAr || '',
          siteNameEn: stData.siteNameEn || '',
          siteLogo: stData.siteLogo || '',
          siteIcon: stData.siteIcon || '',
          maintenanceMode: stData.maintenanceMode || false,
          primaryColor: stData.primaryColor || '#3b82f6',
          secondaryColor: stData.secondaryColor || '#8b5cf6',
          fontFamily: stData.fontFamily || 'Cairo'
        });
      }
      setCustomTemplates(tData as CustomTemplate[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApplyTheme = async () => {
    setSavingSettings(true);
    try {
      await updateSiteSettings(settings);
      alert(isRtl ? 'تم حفظ وتطبيق الهوية بنجاح! سيتم تحديث الموقع للجميع فوراً.' : 'Identity Applied & Saved Successfully!');
      window.location.reload(); // إعادة التحميل لتأكيد الحقن للخطوط الجديدة
    } catch (e) {
      alert(isRtl ? 'فشل الحفظ' : 'Save Failed');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleCardActive = async (cardId: string, ownerId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await toggleCardStatus(cardId, ownerId, newStatus);
      setStats(prev => prev ? {
        ...prev,
        recentCards: prev.recentCards.map(c => c.id === cardId ? { ...c, isActive: newStatus } : c)
      } : null);
    } catch (e) {
      alert(isRtl ? 'فشل تحديث الحالة' : 'Failed to toggle status');
    }
  };

  const handleToggleTemplateActive = async (tmpl: CustomTemplate) => {
    try {
      const updated = { ...tmpl, isActive: !tmpl.isActive };
      await saveCustomTemplate(updated);
      setCustomTemplates(prev => prev.map(t => t.id === tmpl.id ? updated : t));
    } catch (e) {
      alert(isRtl ? 'فشل تحديث الحالة' : 'Failed to toggle status');
    }
  };

  const handleToggleTemplatePin = async (tmpl: CustomTemplate) => {
    try {
      const updated = { ...tmpl, isFeatured: !tmpl.isFeatured };
      await saveCustomTemplate(updated);
      setCustomTemplates(prev => prev.map(t => t.id === tmpl.id ? updated : t));
    } catch (e) {
      alert(isRtl ? 'فشل التثبيت' : 'Failed to toggle pin');
    }
  };

  const handleUpdateTemplateOrder = async (tmpl: CustomTemplate, newOrder: number) => {
    try {
      const updated = { ...tmpl, order: newOrder };
      await saveCustomTemplate(updated);
      setCustomTemplates(prev => prev.map(t => t.id === tmpl.id ? updated : t));
    } catch (e) {
      alert(isRtl ? 'فشل تحديث الترتيب' : 'Failed to update order');
    }
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    setLoading(true);
    try {
      await deleteTemplate(templateToDelete);
      setCustomTemplates(prev => prev.filter(t => t.id !== templateToDelete));
      setTemplateToDelete(null);
    } catch (e) {
      alert(isRtl ? 'خطأ في حذف القالب' : 'Error deleting template');
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [securityData, setSecurityData] = useState({ currentPassword: '', newEmail: ADMIN_EMAIL, newPassword: '', confirmPassword: '' });

  const t = (ar: string, en: string) => isRtl ? ar : en;

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all whitespace-nowrap ${activeTab === id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
    >
      <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const labelTextClasses = "text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest px-1 block mb-2";
  const inputClasses = "w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all";

  if (loading && !templateToDelete) return (
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
            <h1 className="text-4xl md:text-5xl font-black dark:text-white">{t('لوحة التحكم', 'Dashboard')}</h1>
          </div>
          <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto no-scrollbar">
            <TabButton id="stats" label={t('البطاقات', 'Cards')} icon={BarChart3} />
            <TabButton id="templates" label={t('القوالب', 'Templates')} icon={Palette} />
            <TabButton id="settings" label={t('الإعدادات', 'Settings')} icon={Settings} />
            <TabButton id="security" label={t('الأمان', 'Security')} icon={Lock} />
          </div>
        </div>
      )}

      <div className="min-h-[400px]">
        {activeTab === 'builder' && (
          <TemplateBuilder 
            lang={lang} 
            onSave={async (tmpl) => { await saveCustomTemplate(tmpl); setActiveTab('templates'); fetchData(); }} 
            onCancel={() => setActiveTab('templates')}
            initialTemplate={editingTemplate} 
          />
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
             <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-10">
                <div className="space-y-6">
                   <div className="flex items-center gap-4"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><ImageIcon size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('الهوية البصرية للموقع', 'Visual Identity')}</h2></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center gap-4">
                        <label className={`${labelTextClasses} text-center`}>{t('شعار الموقع', 'Logo')}</label>
                        <div className="w-full h-32 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border overflow-hidden flex items-center justify-center relative">
                          {settings.siteLogo ? <img src={settings.siteLogo} className="w-full h-full object-contain p-2" /> : <ImageIcon size={32} className="text-gray-200" />}
                          {uploadingLogo && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                        </div>
                        <input type="file" ref={logoInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setUploadingLogo(true); const b = await uploadImageToCloud(f); if (b) setSettings({...settings, siteLogo: b}); setUploadingLogo(false); }} accept="image/*" className="hidden" />
                        <button onClick={() => logoInputRef.current?.click()} className="w-full py-2.5 bg-white dark:bg-gray-800 border rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2 transition-all active:scale-95"><UploadCloud size={14} className="text-blue-500" /> {t('تغيير الشعار', 'Change Logo')}</button>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center gap-4">
                        <label className={`${labelTextClasses} text-center`}>{t('أيقونة المتصفح', 'Favicon')}</label>
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border overflow-hidden flex items-center justify-center relative mx-auto">
                          {settings.siteIcon ? <img src={settings.siteIcon} className="w-full h-full object-contain p-1" /> : <Layout size={24} className="text-gray-200" />}
                          {uploadingIcon && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                        </div>
                        <input type="file" ref={iconInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setUploadingIcon(true); const b = await uploadImageToCloud(f); if (b) setSettings({...settings, siteIcon: b}); setUploadingIcon(false); }} accept="image/*" className="hidden" />
                        <button onClick={() => iconInputRef.current?.click()} className="w-full py-2.5 bg-white dark:bg-gray-800 border rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2 transition-all active:scale-95"><UploadCloud size={14} className="text-blue-500" /> {t('تغيير الأيقونة', 'Change Icon')}</button>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-gray-100 dark:border-gray-800 space-y-8">
                   <div className="flex items-center gap-4"><div className="p-3 bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-2xl"><Palette size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('ألوان وخطوط المنصة', 'Platform Theme')}</h2></div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <label className={labelTextClasses}>{t('اللون الأساسي للموقع', 'Primary Site Color')}</label>
                         <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                            <input type="color" value={settings.primaryColor} onChange={(e) => setSettings({...settings, primaryColor: e.target.value})} className="w-14 h-14 rounded-xl cursor-pointer border-none outline-none p-0 overflow-hidden" />
                            <input type="text" value={settings.primaryColor} onChange={(e) => setSettings({...settings, primaryColor: e.target.value})} className="bg-transparent border-none outline-none font-mono text-sm uppercase flex-1 dark:text-white font-black" />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <label className={labelTextClasses}>{t('اللون الثانوي للموقع', 'Secondary Color')}</label>
                         <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                            <input type="color" value={settings.secondaryColor} onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})} className="w-14 h-14 rounded-xl cursor-pointer border-none outline-none p-0 overflow-hidden" />
                            <input type="text" value={settings.secondaryColor} onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})} className="bg-transparent border-none outline-none font-mono text-sm uppercase flex-1 dark:text-white font-black" />
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className={labelTextClasses}>{t('خط المنصة العام', 'Platform Font Family')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                         {fontOptions.map(f => (
                           <button 
                             key={f.value}
                             onClick={() => setSettings({...settings, fontFamily: f.value})}
                             className={`p-4 rounded-2xl border-2 transition-all text-sm font-black uppercase tracking-wider ${settings.fontFamily === f.value ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-blue-200'}`}
                             style={{ fontFamily: f.value }}
                           >
                              {f.name}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6">
                   <div className="space-y-2">
                     <label className={labelTextClasses}>{t('اسم الموقع بالعربي', 'Site Name (AR)')}</label>
                     <input type="text" value={settings.siteNameAr} onChange={(e) => setSettings({...settings, siteNameAr: e.target.value})} className={inputClasses} />
                   </div>
                   <div className="space-y-2">
                     <label className={labelTextClasses}>{t('Site Name (English)', 'Site Name (EN)')}</label>
                     <input type="text" value={settings.siteNameEn} onChange={(e) => setSettings({...settings, siteNameEn: e.target.value})} className={inputClasses} />
                   </div>
                </div>
                <button onClick={handleApplyTheme} disabled={savingSettings} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all text-xl uppercase tracking-widest">
                  {savingSettings ? <Loader2 className="animate-spin" /> : <Save size={24} />} 
                  {t('حفظ وتطبيق الهوية الجديدة', 'Apply Platform Theme')}
                </button>
             </div>
          </div>
        )}

        {activeTab === 'stats' && (
           <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600"><Users size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي البطاقات', 'Total Cards')}</p><h4 className="text-2xl font-black dark:text-white">{stats?.totalCards || 0}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"><TrendingUp size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('نشط خلال 30 يوم', 'Active last 30d')}</p><h4 className="text-2xl font-black dark:text-white">{stats?.activeCards || 0}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"><Eye size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي المشاهدات', 'Total Views')}</p><h4 className="text-2xl font-black dark:text-white">{stats?.totalViews || 0}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600"><Globe size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي الزيارات', 'Traffic')}</p><h4 className="text-2xl font-black dark:text-white">{(stats?.totalCards || 0) * 12}</h4></div>
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl">
                 <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-blue-600 text-white rounded-2xl"><LayoutGrid size={24} /></div>
                       <div>
                         <h2 className="text-xl font-black dark:text-white leading-none mb-1">{t('فهرس البطاقات العامة', 'Public Cards Directory')}</h2>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('إدارة كافة الملفات الشخصية المسجلة', 'Manage all registered profiles')}</p>
                       </div>
                    </div>
                    <div className="relative w-full md:w-80">
                      <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                      <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('ابحث...', 'Search...')} className={`${isRtl ? 'pr-12' : 'pl-12'} w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all`} />
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                       <thead>
                         <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                           <td className="px-8 py-4">{t('البطاقة والمالك', 'Card & Owner')}</td>
                           <td className="px-8 py-4 text-center">{t('الحالة', 'Status')}</td>
                           <td className="px-8 py-4 text-center">{t('المشاهدات', 'Views')}</td>
                           <td className="px-8 py-4">{t('آخر تحديث', 'Last Update')}</td>
                           <td className="px-8 py-4 text-center">{t('الإجراءات', 'Actions')}</td>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {stats?.recentCards.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.id?.toLowerCase().includes(searchTerm.toLowerCase())).map((card, idx) => (
                             <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${card.isActive === false ? 'opacity-50' : ''}`}>
                                <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700">{card.profileImage ? <img src={card.profileImage} className="w-full h-full object-cover" /> : <Users size={20} className="m-auto mt-4 text-gray-300" />}</div><div className="min-w-0"><p className="font-black text-base dark:text-white truncate leading-tight">{card.name || '---'}</p><p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">/{card.id}</p></div></div></td>
                                <td className="px-8 py-6 text-center">
                                   <button 
                                       onClick={() => handleToggleCardActive(card.id, card.ownerId, card.isActive !== false)}
                                       className={`inline-flex items-center gap-2 px-6 py-2 rounded-2xl text-[9px] font-black uppercase transition-all shadow-sm ${card.isActive !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}
                                   >
                                       {card.isActive !== false ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                                       {card.isActive !== false ? t('نشط', 'Active') : t('معطل', 'Disabled')}
                                   </button>
                                </td>
                                <td className="px-8 py-6 text-center">
                                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl text-[11px] font-black">
                                      <Eye size={14} />
                                      {card.viewCount || 0}
                                   </div>
                                </td>
                                <td className="px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-widest">{card.updatedAt ? new Date(card.updatedAt).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US') : '---'}</td>
                                <td className="px-8 py-6 text-center"><div className="flex justify-center gap-2"><a href={generateShareUrl(card as CardData)} target="_blank" className="p-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><Eye size={18} /></a><button onClick={() => onEditCard(card as CardData)} className="p-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18} /></button><button onClick={() => onDeleteRequest(card.id, card.ownerId)} className="p-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button></div></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'templates' && (
           <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                      <Layout size={32} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black dark:text-white leading-none mb-2">{t('إدارة القوالب', 'Templates Manager')}</h2>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('تحكم في شكل وخيارات منصتك', 'Customize platform layouts')}</p>
                    </div>
                 </div>
                 <button onClick={() => { setEditingTemplate(undefined); setActiveTab('builder'); }} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all">
                    <Plus size={18} /> {t('إنشاء قالب جديد', 'Create Template')}
                 </button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                 <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4"><ListFilter className="text-blue-600" size={20} /><h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('قائمة القوالب المصممة', 'Design Inventory')}</h4></div>
                    <div className="relative w-full md:w-80"><Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} /><input type="text" value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} placeholder={t('البحث...', 'Search...')} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all`} /></div>
                 </div>

                 <div className="overflow-x-auto">
                    <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                       <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                             <td className="px-8 py-5">{t('القالب والتفاصيل', 'Template & Details')}</td>
                             <td className="px-8 py-5 text-center">{t('الحالة', 'Status')}</td>
                             <td className="px-8 py-5 text-center">{t('تثبيت', 'Pin')}</td>
                             <td className="px-8 py-5 text-center">{t('الترتيب', 'Order')}</td>
                             <td className="px-8 py-5">{t('الاستخدام', 'Usage')}</td>
                             <td className="px-8 py-5 text-center">{t('الإجراءات', 'Actions')}</td>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {customTemplates.filter(t => (isRtl ? t.nameAr : t.nameEn).toLowerCase().includes(templateSearch.toLowerCase())).map((tmpl) => (
                             <tr key={tmpl.id} className="group hover:bg-blue-50/20 transition-all">
                                <td className="px-8 py-6"><div className="flex items-center gap-5"><div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-md">{tmpl.config.defaultBackgroundImage ? <img src={tmpl.config.defaultBackgroundImage} className="w-full h-full object-cover" /> : <Palette size={24} className="m-auto mt-4 text-blue-400" />}</div><div><p className="font-black text-base dark:text-white leading-tight mb-1">{isRtl ? tmpl.nameAr : tmpl.nameEn}</p><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{tmpl.config.headerType}</p></div></div></td>
                                <td className="px-8 py-6 text-center"><button onClick={() => handleToggleTemplateActive(tmpl)} className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${tmpl.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>{tmpl.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}{tmpl.isActive ? t('نشط', 'Active') : t('معطل', 'Disabled')}</button></td>
                                <td className="px-8 py-6 text-center"><button onClick={() => handleToggleTemplatePin(tmpl)} className={`p-3 rounded-xl transition-all ${tmpl.isFeatured ? 'bg-amber-100 text-amber-600 shadow-lg' : 'bg-gray-50 text-gray-300'}`}><Pin size={18} fill={tmpl.isFeatured ? "currentColor" : "none"} /></button></td>
                                <td className="px-8 py-6 text-center"><input type="number" value={tmpl.order || 0} onChange={(e) => handleUpdateTemplateOrder(tmpl, parseInt(e.target.value))} className="w-16 px-2 py-2.5 bg-gray-50 dark:bg-gray-800 border rounded-xl text-[12px] font-black text-center outline-none focus:ring-4 focus:ring-blue-100" /></td>
                                <td className="px-8 py-6"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600"><Activity size={18} /></div><div className="flex flex-col"><span className="text-lg font-black text-indigo-600 leading-none">{tmpl.usageCount || 0}</span><span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t('استخدام', 'Uses')}</span></div></div></td>
                                <td className="px-8 py-6 text-center"><div className="flex justify-center gap-2"><button onClick={() => { setEditingTemplate(tmpl); setActiveTab('builder'); }} className="p-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18} /></button><button onClick={() => setTemplateToDelete(tmpl.id)} className="p-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button></div></td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </div>
           </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
             <form onSubmit={async (e) => { 
               e.preventDefault(); 
               setSecurityStatus(null);
               if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
                  setSecurityStatus({ type: 'error', message: t("كلمات المرور غير متطابقة", "Passwords mismatch") });
                  return;
               }
               setSavingSecurity(true); 
               try { 
                 await updateAdminSecurity(securityData.currentPassword, securityData.newEmail, securityData.newPassword || undefined); 
                 setSecurityStatus({ type: 'success', message: t('تم التحديث بنجاح', 'Security updated') });
                 setSecurityData({...securityData, currentPassword: '', newPassword: '', confirmPassword: ''});
               } catch (err: any) { 
                 setSecurityStatus({ type: 'error', message: getAuthErrorMessage(err.code, isRtl ? 'ar' : 'en') });
               } finally { 
                 setSavingSecurity(false); 
               } 
             }} className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-8">
                <div className="flex items-center gap-4"><div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl"><Key size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('أمان المسؤول', 'Admin Security')}</h2></div>
                {securityStatus && <div className={`p-4 rounded-2xl text-xs font-bold ${securityStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{securityStatus.message}</div>}
                <div className="space-y-6">
                   <div><label className={labelTextClasses}>{t('كلمة المرور الحالية', 'Current Password')}</label><input type="password" required value={securityData.currentPassword} onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})} className={inputClasses} placeholder="••••••••" /></div>
                   <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <div><label className={labelTextClasses}>{t('البريد الإلكتروني للإدارة', 'Admin Email')}</label><input type="email" value={securityData.newEmail} onChange={(e) => setSecurityData({...securityData, newEmail: e.target.value})} className={inputClasses} /></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div><label className={labelTextClasses}>{t('كلمة سر جديدة', 'New Password')}</label><input type="password" value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} className={inputClasses} placeholder="••••••••" /></div>
                         <div><label className={labelTextClasses}>{t('تأكيد كلمة السر', 'Confirm Password')}</label><input type="password" value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} className={inputClasses} placeholder="••••••••" /></div>
                      </div>
                   </div>
                </div>
                <button type="submit" disabled={savingSecurity} className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50">{savingSecurity ? <Loader2 className="animate-spin" /> : <ShieldAlert size={20} />} {t('تحديث البيانات الأمنية', 'Update Protocol')}</button>
             </form>
          </div>
        )}
      </div>

      {templateToDelete && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[400px] rounded-[3.5rem] p-10 text-center shadow-2xl animate-fade-in border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner"><Trash2 size={40} /></div>
            <h3 className="text-2xl font-black mb-4 dark:text-white">{t('تأكيد حذف القالب', 'Confirm Delete')}</h3>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDeleteTemplate} className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase">نعم، حذف القالب</button>
              <button onClick={() => setTemplateToDelete(null)} className="py-5 bg-gray-50 text-gray-500 rounded-3xl font-black text-sm uppercase">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
