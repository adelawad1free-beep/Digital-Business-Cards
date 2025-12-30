
import React, { useEffect, useState } from 'react';
import { getAdminStats, ADMIN_EMAIL, deleteUserCard, getSiteSettings, updateSiteSettings, updateAdminSecurity } from '../services/firebase';
import { Language, CardData } from '../types';
import { generateShareUrl } from '../utils/share';
import { 
  BarChart3, Users, Clock, ArrowUpRight, Loader2,
  ShieldCheck, Trash2, Edit3, Eye, Settings, 
  Globe, Power, Save, Search, LayoutGrid,
  Lock, Mail, UserCog, Key, Shield, ShieldAlert,
  AlertTriangle, CheckCircle2
} from 'lucide-react';

interface AdminDashboardProps {
  lang: Language;
  onEditCard: (card: CardData) => void;
  onDeleteRequest: (cardId: string, ownerId: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, onEditCard, onDeleteRequest }) => {
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'stats' | 'settings' | 'security'>('stats');
  const [stats, setStats] = useState<{ totalCards: number; recentCards: any[] } | null>(null);
  const [settings, setSettings] = useState({ siteNameAr: '', siteNameEn: '', maintenanceMode: false });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [securityData, setSecurityData] = useState({ 
    currentPassword: '', 
    newEmail: ADMIN_EMAIL, 
    newPassword: '', 
    confirmPassword: '' 
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, settingsData] = await Promise.all([
        getAdminStats(),
        getSiteSettings()
      ]);
      setStats(statsData);
      setSettings(settingsData as any);
    } catch (err: any) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await updateSiteSettings(settings);
      alert(isRtl ? "تم حفظ إعدادات الموقع بنجاح" : "Site settings saved successfully");
    } catch (e) {
      alert(isRtl ? "فشل الحفظ: تأكد من صلاحيات المسؤول" : "Save failed: Check admin permissions");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
      alert(isRtl ? "كلمات المرور الجديدة غير متطابقة" : "New passwords do not match");
      return;
    }

    setSavingSecurity(true);
    try {
      await updateAdminSecurity(
        securityData.currentPassword,
        securityData.newEmail,
        securityData.newPassword || undefined
      );
      alert(isRtl ? "تم تحديث بيانات الأمان بنجاح" : "Security credentials updated successfully");
      setSecurityData({ ...securityData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      alert(isRtl ? `فشل التحديث: ${error.message}` : `Update failed: ${error.message}`);
    } finally {
      setSavingSecurity(false);
    }
  };

  const filteredCards = stats?.recentCards.filter(card => 
    card.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    card.id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const t = (ar: string, en: string) => isRtl ? ar : en;

  const inputClasses = "w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all";
  const labelClasses = "block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest px-1";

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
        <p className="font-bold text-gray-400 uppercase tracking-widest">{t('جاري تحميل لوحة التحكم...', 'Loading Dashboard...')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20"><ShieldCheck size={20} /></div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{t('وصول المسؤول الكامل', 'Full Admin Access')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">{t('لوحة الإدارة', 'Site Admin')}</h1>
        </div>
        
        <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <button 
            onClick={() => setActiveTab('stats')} 
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'stats' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
          >
            <BarChart3 size={16} /> <span className="hidden sm:inline">{t('البطاقات', 'Cards')}</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
          >
            <Settings size={16} /> <span className="hidden sm:inline">{t('الإعدادات', 'Settings')}</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')} 
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
          >
            <Lock size={16} /> <span className="hidden sm:inline">{t('الأمان', 'Security')}</span>
          </button>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="min-h-[400px]">
        
        {/* Tab 1: Cards Management & Stats */}
        {activeTab === 'stats' && (
          <div className="space-y-8 animate-fade-in">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl flex items-center gap-6">
                   <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner"><Users size={32} /></div>
                   <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي البطاقات', 'Total Cards')}</p>
                      <h4 className="text-3xl font-black dark:text-white leading-tight">{stats?.totalCards}</h4>
                   </div>
                </div>
             </div>

             <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-3">
                      <LayoutGrid className="text-blue-600" size={24} />
                      <h2 className="text-xl font-black dark:text-white">{t('فهرس البطاقات العامة', 'Public Cards Directory')}</h2>
                   </div>
                   <div className="relative w-full md:w-80">
                     <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                     <input 
                       type="text" 
                       value={searchTerm} 
                       onChange={(e) => setSearchTerm(e.target.value)} 
                       placeholder={t('ابحث عن اسم أو رابط...', 'Search name or slug...')} 
                       className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`} 
                     />
                   </div>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                          <td className="px-8 py-4">{t('البطاقة', 'Card')}</td>
                          <td className="px-8 py-4">{t('آخر تحديث', 'Last Update')}</td>
                          <td className="px-8 py-4 text-center">{t('الإجراءات', 'Actions')}</td>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                         {filteredCards.map((card, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700">
                                       {card.profileImage ? <img src={card.profileImage} className="w-full h-full object-cover" /> : <Users size={20} className="m-auto mt-3 text-gray-400" />}
                                     </div>
                                     <div className="min-w-0">
                                       <p className="font-black text-sm dark:text-white truncate">{card.name || '---'}</p>
                                       <p className="text-[10px] font-bold text-blue-600 uppercase">/{card.id}</p>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold">
                                     <Clock size={14} />
                                     {card.updatedAt ? new Date(card.updatedAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US') : '---'}
                                  </div>
                               </td>
                               <td className="px-8 py-6">
                                  <div className="flex justify-center gap-2">
                                     <a href={generateShareUrl(card as CardData)} target="_blank" className="p-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:scale-110 transition-all shadow-sm"><Eye size={18} /></a>
                                     <button onClick={() => onEditCard(card as CardData)} className="p-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:scale-110 transition-all shadow-sm"><Edit3 size={18} /></button>
                                     <button onClick={() => onDeleteRequest(card.id, card.ownerId)} className="p-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:scale-110 transition-all shadow-sm">
                                        <Trash2 size={18} />
                                     </button>
                                  </div>
                               </td>
                            </tr>
                         ))}
                         {filteredCards.length === 0 && (
                           <tr>
                             <td colSpan={3} className="py-20 text-center">
                               <p className="text-gray-400 font-bold">{t('لا توجد بطاقات مطابقة لبحثك', 'No matching cards found')}</p>
                             </td>
                           </tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {/* Tab 2: Site Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
             <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-8">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl"><Globe size={24} /></div>
                   <h2 className="text-2xl font-black dark:text-white">{t('إعدادات الموقع العامة', 'Global Site Settings')}</h2>
                </div>

                <div className="space-y-6">
                   <div>
                      <label className={labelClasses}>{t('اسم الموقع (عربي)', 'Site Name (Arabic)')}</label>
                      <input 
                        type="text" 
                        value={settings.siteNameAr} 
                        onChange={(e) => setSettings({...settings, siteNameAr: e.target.value})}
                        className={inputClasses}
                        placeholder="هويتي الرقمية"
                      />
                   </div>
                   <div>
                      <label className={labelClasses}>{t('اسم الموقع (إنجليزي)', 'Site Name (English)')}</label>
                      <input 
                        type="text" 
                        value={settings.siteNameEn} 
                        onChange={(e) => setSettings({...settings, siteNameEn: e.target.value})}
                        className={inputClasses}
                        placeholder="My Digital Identity"
                      />
                   </div>
                   
                   <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl transition-all ${settings.maintenanceMode ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'}`}>
                           {settings.maintenanceMode ? <Power size={24} /> : <CheckCircle2 size={24} />}
                        </div>
                        <div>
                           <p className="font-black dark:text-white text-lg">{t('وضع الصيانة', 'Maintenance Mode')}</p>
                           <p className="text-[10px] font-bold text-gray-400 uppercase">{settings.maintenanceMode ? t('الموقع غير متاح حالياً للزوار', 'Site is currently offline for visitors') : t('الموقع متاح للجميع حالياً', 'Site is currently live and public')}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                        className={`w-16 h-8 rounded-full relative transition-all shadow-inner ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-200 dark:bg-gray-700'}`}
                      >
                         <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${isRtl ? (settings.maintenanceMode ? 'right-9' : 'right-1') : (settings.maintenanceMode ? 'left-9' : 'left-1')}`} />
                      </button>
                   </div>
                </div>

                <button 
                  onClick={handleSaveSettings} 
                  disabled={savingSettings}
                  className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all"
                >
                   {savingSettings ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                   {t('حفظ كافة الإعدادات', 'Save Global Settings')}
                </button>
             </div>
          </div>
        )}

        {/* Tab 3: Account & Security */}
        {activeTab === 'security' && (
          <div className="max-w-2xl mx-auto animate-fade-in">
             <form onSubmit={handleUpdateSecurity} className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-8">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl"><Key size={24} /></div>
                   <h2 className="text-2xl font-black dark:text-white">{t('أمان حساب المسؤول', 'Admin Security')}</h2>
                </div>

                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex gap-4">
                   <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                   <p className="text-xs font-bold text-amber-800 dark:text-amber-400 leading-relaxed">
                     {t('تنبيه: تغيير البريد الإلكتروني أو كلمة المرور يتطلب تأكيد هويتك بكلمة المرور الحالية. يرجى تذكر البيانات الجديدة جيداً.', 'Caution: Updating your email or password requires re-authentication. Please ensure you remember your new credentials.')}
                   </p>
                </div>

                <div className="space-y-6">
                   <div>
                      <label className={labelClasses}>{t('كلمة المرور الحالية (مطلوب)', 'Current Password (Required)')}</label>
                      <input 
                        type="password" required
                        value={securityData.currentPassword} 
                        onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                        className={inputClasses}
                        placeholder="••••••••"
                      />
                   </div>

                   <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-6">
                      <div>
                        <label className={labelClasses}>{t('البريد الإلكتروني للإدارة', 'Admin Email')}</label>
                        <div className="relative">
                          <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                          <input 
                            type="email" 
                            value={securityData.newEmail} 
                            onChange={(e) => setSecurityData({...securityData, newEmail: e.target.value})}
                            className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className={labelClasses}>{t('كلمة سر جديدة', 'New Password')}</label>
                            <input 
                              type="password"
                              value={securityData.newPassword} 
                              onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                              className={inputClasses}
                              placeholder={t('اتركها فارغة لعدم التغيير', 'Leave blank to keep current')}
                            />
                         </div>
                         <div>
                            <label className={labelClasses}>{t('تأكيد كلمة السر', 'Confirm New Password')}</label>
                            <input 
                              type="password"
                              value={securityData.confirmPassword} 
                              onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                              className={inputClasses}
                            />
                         </div>
                      </div>
                   </div>
                </div>

                <button 
                  type="submit"
                  disabled={savingSecurity}
                  className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black shadow-xl shadow-red-500/20 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all"
                >
                   {savingSecurity ? <Loader2 className="animate-spin" /> : <ShieldAlert size={20} />}
                   {t('تحديث بيانات الأمان', 'Update Security Credentials')}
                </button>
             </form>
          </div>
        )}
      </div>

      {/* Footer Branding for Admin */}
      <div className="text-center pt-10 opacity-30">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] dark:text-white">Admin Core System v2.0</p>
      </div>
    </div>
  );
};

export default AdminDashboard;
