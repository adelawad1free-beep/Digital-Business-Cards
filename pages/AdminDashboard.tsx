
import React, { useEffect, useState, useRef } from 'react';
import { 
  getAdminStats, ADMIN_EMAIL, deleteUserCard, 
  getSiteSettings, updateSiteSettings, updateAdminSecurity,
  saveCustomTemplate, getAllTemplates, deleteTemplate,
  auth, getAuthErrorMessage
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
  Plus, Palette, ShieldAlert, Key, Star, Hash, AlertTriangle, Pin, PinOff, ArrowUpAZ
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
  const [stats, setStats] = useState<{ totalCards: number; recentCards: any[] } | null>(null);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | undefined>(undefined);
  
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  
  const [settings, setSettings] = useState({ 
    siteNameAr: '', 
    siteNameEn: '', 
    siteLogo: '', 
    siteIcon: '',
    maintenanceMode: false 
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [securityData, setSecurityData] = useState({ 
    currentPassword: '', 
    newEmail: ADMIN_EMAIL, 
    newPassword: '', 
    confirmPassword: '' 
  });

  const fetchData = async () => {
    if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) return;
    setLoading(true);
    try {
      const [sData, stData, tData] = await Promise.all([
        getAdminStats().catch(() => ({ totalCards: 0, recentCards: [] })),
        getSiteSettings().catch(() => null),
        getAllTemplates().catch(() => [])
      ]);
      setStats(sData);
      if (stData) setSettings(stData as any);
      setCustomTemplates(tData as CustomTemplate[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveTemplate = async (template: CustomTemplate) => {
    await saveCustomTemplate(template);
    const tData = await getAllTemplates();
    setCustomTemplates(tData as CustomTemplate[]);
    setActiveTab('templates');
  };

  const handleTogglePin = async (tmpl: CustomTemplate) => {
    const updated = { ...tmpl, isFeatured: !tmpl.isFeatured };
    await saveCustomTemplate(updated);
    const tData = await getAllTemplates();
    setCustomTemplates(tData as CustomTemplate[]);
  };

  const handleUpdateOrder = async (tmpl: CustomTemplate, newOrder: number) => {
    const updated = { ...tmpl, order: newOrder };
    await saveCustomTemplate(updated);
    const tData = await getAllTemplates();
    setCustomTemplates(tData as CustomTemplate[]);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    setLoading(true);
    try {
      await deleteTemplate(templateToDelete);
      setCustomTemplates(prev => prev.filter(t => t.id !== templateToDelete));
      setTemplateToDelete(null);
    } catch (error: any) {
      alert(isRtl ? `فشل الحذف: ${error.message}` : `Delete failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const t = (ar: string, en: string) => isRtl ? ar : en;

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all whitespace-nowrap ${activeTab === id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
    >
      <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );

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
            onSave={handleSaveTemplate} 
            onCancel={() => setActiveTab('templates')}
            initialTemplate={editingTemplate} 
          />
        )}

        {activeTab === 'templates' && (
           <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <Layout className="text-blue-600" size={32} />
                    <h2 className="text-3xl font-black dark:text-white">{t('إدارة القوالب', 'Templates Manager')}</h2>
                 </div>
                 <button onClick={() => { setEditingTemplate(undefined); setActiveTab('builder'); }} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-3 active:scale-95 transition-all">
                    <Plus size={18} /> {t('قالب جديد', 'New Template')}
                 </button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl">
                 <div className="overflow-x-auto">
                    <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                       <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                             <td className="px-8 py-5">{t('القالب', 'Template')}</td>
                             <td className="px-8 py-5">{t('الحالة', 'Status')}</td>
                             <td className="px-8 py-5 text-center">{t('التثبيت', 'Featured')}</td>
                             <td className="px-8 py-5 text-center">{t('الترتيب', 'Order')}</td>
                             <td className="px-8 py-5 text-center">{t('الإجراءات', 'Actions')}</td>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {customTemplates.map((tmpl) => (
                             <tr key={tmpl.id} className={`hover:bg-blue-50/30 dark:hover:bg-blue-900/5 transition-colors ${tmpl.isFeatured ? 'bg-amber-50/20 dark:bg-amber-900/5' : ''}`}>
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-4">
                                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-sm">
                                         {tmpl.config.defaultBackgroundImage ? (
                                            <img src={tmpl.config.defaultBackgroundImage} className="w-full h-full object-cover" />
                                         ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-400">
                                               <Palette size={20} />
                                            </div>
                                         )}
                                      </div>
                                      <div>
                                         <p className="font-black text-sm dark:text-white leading-tight">{isRtl ? tmpl.nameAr : tmpl.nameEn}</p>
                                         <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{tmpl.id}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${tmpl.isActive ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                                      {tmpl.isActive ? t('نشط', 'Active') : t('معطل', 'Disabled')}
                                   </span>
                                </td>
                                <td className="px-8 py-6 text-center">
                                   <button 
                                      onClick={() => handleTogglePin(tmpl)}
                                      className={`p-3 rounded-xl transition-all ${tmpl.isFeatured ? 'bg-amber-100 text-amber-600 shadow-sm' : 'bg-gray-50 dark:bg-gray-800 text-gray-300'}`}
                                      title={t('تثبيت في البداية', 'Pin to top')}
                                   >
                                      {tmpl.isFeatured ? <Pin size={18} fill="currentColor" /> : <Pin size={18} />}
                                   </button>
                                </td>
                                <td className="px-8 py-6 text-center">
                                   <div className="flex items-center justify-center gap-2">
                                      <ArrowUpAZ size={14} className="text-gray-300" />
                                      <input 
                                         type="number" 
                                         value={tmpl.order || 0}
                                         onChange={(e) => handleUpdateOrder(tmpl, parseInt(e.target.value))}
                                         className="w-16 px-2 py-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg text-[11px] font-black text-center focus:ring-2 focus:ring-blue-100 outline-none"
                                      />
                                   </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                   <div className="flex justify-center gap-2">
                                      <button 
                                         onClick={() => { setEditingTemplate(tmpl); setActiveTab('builder'); }} 
                                         className="p-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                      >
                                         <Edit3 size={18} />
                                      </button>
                                      <button 
                                         onClick={() => setTemplateToDelete(tmpl.id)} 
                                         className="p-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                      >
                                         <Trash2 size={18} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
                 {customTemplates.length === 0 && (
                    <div className="py-20 text-center">
                       <Layout className="mx-auto text-gray-200 mb-4" size={48} />
                       <p className="text-gray-400 font-bold">{t('لا توجد قوالب حالياً', 'No templates found')}</p>
                    </div>
                 )}
              </div>
           </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8 animate-fade-in">
             <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl flex items-center gap-6 max-w-sm">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner"><Users size={32} /></div>
                <div>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي البطاقات', 'Total Cards')}</p>
                   <h4 className="text-3xl font-black dark:text-white leading-tight">{stats?.totalCards || 0}</h4>
                </div>
             </div>
             <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-3"><LayoutGrid className="text-blue-600" size={24} /><h2 className="text-xl font-black dark:text-white">{t('فهرس البطاقات العامة', 'Public Cards Directory')}</h2></div>
                   <div className="relative w-full md:w-80"><Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('ابحث...', 'Search...')} className={`${isRtl ? 'pr-12' : 'pl-12'} w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm`} /></div>
                </div>
                <div className="overflow-x-auto">
                   <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                          <td className="px-8 py-4">{t('البطاقة', 'Card')}</td>
                          <td className="px-8 py-4">{t('آخر تحديث', 'Last Update')}</td>
                          <td className="px-8 py-4 text-center">{t('الإجراءات', 'Actions')}</td>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                         {stats?.recentCards.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase())).map((card, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                               <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700">{card.profileImage ? <img src={card.profileImage} className="w-full h-full object-cover" /> : <Users size={20} className="m-auto mt-3 text-gray-400" />}</div><div className="min-w-0"><p className="font-black text-sm dark:text-white truncate">{card.name || '---'}</p><p className="text-[10px] font-bold text-blue-600 uppercase">/{card.id}</p></div></div></td>
                               <td className="px-8 py-6 text-[10px] font-bold text-gray-400">{card.updatedAt ? new Date(card.updatedAt).toLocaleDateString() : '---'}</td>
                               <td className="px-8 py-6 text-center"><div className="flex justify-center gap-2"><a href={generateShareUrl(card as CardData)} target="_blank" className="p-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl"><Eye size={18} /></a><button onClick={() => onEditCard(card as CardData)} className="p-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl"><Edit3 size={18} /></button><button onClick={() => onDeleteRequest(card.id, card.ownerId)} className="p-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl"><Trash2 size={18} /></button></div></td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
             <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-8">
                <div className="space-y-6">
                   <div className="flex items-center gap-4"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><ImageIcon size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('الهوية البصرية للموقع', 'Visual Identity')}</h2></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center gap-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('شعار الموقع', 'Logo')}</label>
                        <div className="w-full h-32 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border overflow-hidden flex items-center justify-center relative">{settings.siteLogo ? <img src={settings.siteLogo} className="w-full h-full object-contain p-2" /> : <ImageIcon size={32} className="text-gray-200" />}{uploadingLogo && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}</div>
                        <input type="file" ref={logoInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setUploadingLogo(true); const b = await uploadImageToCloud(f); if (b) setSettings({...settings, siteLogo: b}); setUploadingLogo(false); }} accept="image/*" className="hidden" />
                        <button onClick={() => logoInputRef.current?.click()} className="w-full py-2.5 bg-white dark:bg-gray-800 border rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2"><UploadCloud size={14} className="text-blue-500" /> {t('تغيير الشعار', 'Change Logo')}</button>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center gap-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('أيقونة المتصفح', 'Favicon')}</label>
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border overflow-hidden flex items-center justify-center relative mx-auto">{settings.siteIcon ? <img src={settings.siteIcon} className="w-full h-full object-contain p-1" /> : <Layout size={24} className="text-gray-200" />}{uploadingIcon && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}</div>
                        <input type="file" ref={iconInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setUploadingIcon(true); const b = await uploadImageToCloud(f); if (b) setSettings({...settings, siteIcon: b}); setUploadingIcon(false); }} accept="image/*" className="hidden" />
                        <button onClick={() => iconInputRef.current?.click()} className="w-full py-2.5 bg-white dark:bg-gray-800 border rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2"><UploadCloud size={14} className="text-blue-500" /> {t('تغيير الأيقونة', 'Change Icon')}</button>
                      </div>
                   </div>
                </div>
                <div className="pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6">
                   <input type="text" value={settings.siteNameAr} onChange={(e) => setSettings({...settings, siteNameAr: e.target.value})} className={`w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border rounded-2xl font-bold text-sm text-${isRtl ? 'right' : 'left'}`} placeholder="اسم الموقع (عربي)" />
                   <input type="text" value={settings.siteNameEn} onChange={(e) => setSettings({...settings, siteNameEn: e.target.value})} className={`w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border rounded-2xl font-bold text-sm text-${isRtl ? 'left' : 'right'}`} placeholder="Site Name (EN)" />
                   <div className="pt-4 flex items-center justify-between">
                      <div className="flex items-center gap-4"><div className={`p-4 rounded-2xl ${settings.maintenanceMode ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}><Power size={24} /></div><p className="font-black dark:text-white text-lg">{t('وضع الصيانة', 'Maintenance')}</p></div>
                      <button onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})} className={`w-16 h-8 rounded-full relative transition-all ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isRtl ? (settings.maintenanceMode ? 'right-9' : 'right-1') : (settings.maintenanceMode ? 'left-9' : 'left-1')}`} /></button>
                   </div>
                </div>
                <button onClick={async () => { setSavingSettings(true); await updateSiteSettings(settings); setSavingSettings(false); alert(t('تم الحفظ', 'Saved')); }} disabled={savingSettings} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">{savingSettings ? <Loader2 className="animate-spin" /> : <Save size={20} />} {t('حفظ الإعدادات', 'Save Settings')}</button>
             </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
             <form onSubmit={async (e) => { 
               e.preventDefault(); 
               setSecurityStatus(null);
               if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
                  setSecurityStatus({ type: 'error', message: t("كلمات المرور غير متطابقة", "Passwords do not match") });
                  return;
               }
               setSavingSecurity(true); 
               try { 
                 await updateAdminSecurity(securityData.currentPassword, securityData.newEmail, securityData.newPassword || undefined); 
                 setSecurityStatus({ type: 'success', message: t('تم تحديث بيانات الأمان بنجاح', 'Security updated successfully') });
                 setSecurityData({...securityData, currentPassword: '', newPassword: '', confirmPassword: ''});
               } catch (err: any) { 
                 setSecurityStatus({ type: 'error', message: getAuthErrorMessage(err.code, isRtl ? 'ar' : 'en') });
               } finally { 
                 setSavingSecurity(false); 
               } 
             }} className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-8">
                
                <div className="flex items-center gap-4"><div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl"><Key size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('أمان المسؤول', 'Admin Security')}</h2></div>
                
                {securityStatus && (
                  <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${securityStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {securityStatus.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                    <span className="text-xs font-bold">{securityStatus.message}</span>
                  </div>
                )}

                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('كلمة المرور الحالية', 'Current Password')}</label>
                      <input type="password" required value={securityData.currentPassword} onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})} className={`w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border rounded-2xl font-bold text-sm text-${isRtl ? 'right' : 'left'}`} placeholder="••••••••" />
                   </div>
                   <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('البريد الإلكتروني', 'Email')}</label>
                         <input type="email" value={securityData.newEmail} onChange={(e) => setSecurityData({...securityData, newEmail: e.target.value})} className={`w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border rounded-2xl font-bold text-sm text-${isRtl ? 'right' : 'left'}`} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('كلمة سر جديدة', 'New Password')}</label>
                            <input type="password" value={securityData.newPassword} onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})} className={`w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border rounded-2xl font-bold text-sm text-${isRtl ? 'right' : 'left'}`} placeholder="••••••••" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">{t('تأكيد كلمة السر', 'Confirm')}</label>
                            <input type="password" value={securityData.confirmPassword} onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})} className={`w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 border rounded-2xl font-bold text-sm text-${isRtl ? 'right' : 'left'}`} placeholder="••••••••" />
                         </div>
                      </div>
                   </div>
                </div>
                <button type="submit" disabled={savingSecurity} className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">{savingSecurity ? <Loader2 className="animate-spin" /> : <ShieldAlert size={20} />} {t('تحديث البيانات', 'Update Security')}</button>
             </form>
          </div>
        )}
      </div>

      {templateToDelete && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[360px] rounded-[3.5rem] p-10 text-center shadow-2xl animate-fade-in border border-gray-100 dark:border-gray-800">
            <Trash2 size={48} className="mx-auto text-red-500 mb-6" />
            <h3 className="text-2xl font-black mb-4 dark:text-white">{t('تأكيد الحذف', 'Confirm Delete')}</h3>
            <p className="text-xs font-bold text-gray-400 dark:text-gray-500 mb-10 leading-relaxed">
              {t('هل أنت متأكد من حذف هذا القالب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.', 'Are you sure you want to delete this template permanently? This action cannot be undone.')}
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmDeleteTemplate} 
                className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase shadow-xl shadow-red-500/20 active:scale-95 transition-all"
              >
                {t('نعم، احذف القالب', 'Yes, Delete Template')}
              </button>
              <button 
                onClick={() => setTemplateToDelete(null)} 
                className="py-5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-3xl font-black text-sm uppercase active:scale-95 transition-all border border-gray-100 dark:border-gray-700"
              >
                {t('إلغاء', 'Cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
