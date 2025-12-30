
// Fix: Added React import to resolve "Cannot find namespace 'React'" error
import React, { useEffect, useState } from 'react';
import { getAdminStats, ADMIN_EMAIL, deleteCardByAdmin, getSiteSettings, updateSiteSettings, updateAdminSecurity } from '../services/firebase';
import { Language, CardData } from '../types';
import { generateShareUrl } from '../utils/share';
// Fix: Added ShieldAlert to imports to resolve "Cannot find name 'ShieldAlert'" error
import { 
  BarChart3, Users, Clock, ArrowUpRight, Loader2,
  ShieldCheck, Trash2, Edit3, Eye, Settings, 
  Globe, Power, Save, Search, LayoutGrid,
  Lock, Mail, UserCog, Key, Shield, ShieldAlert
} from 'lucide-react';

interface AdminDashboardProps {
  lang: Language;
  onEditCard: (card: CardData) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, onEditCard }) => {
  const isRtl = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'stats' | 'settings' | 'security'>('stats');
  const [stats, setStats] = useState<{ totalCards: number; recentCards: any[] } | null>(null);
  const [settings, setSettings] = useState({ siteNameAr: '', siteNameEn: '', maintenanceMode: false });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Security State
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
      alert(isRtl ? "تم حفظ إعدادات الموقع بنجاح" : "Site settings updated successfully");
    } catch (e) {
      alert(isRtl ? "فشل الحفظ، تأكد من صلاحياتك" : "Save failed, check permissions");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleUpdateSecurity = async () => {
    if (!securityData.currentPassword) {
      alert(isRtl ? "يرجى إدخال كلمة المرور الحالية للأمان" : "Please enter current password for security");
      return;
    }
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
      alert(isRtl ? "تم تحديث بيانات الأمان بنجاح" : "Security data updated successfully");
      setSecurityData({ ...securityData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) {
      alert(isRtl ? "فشل التحديث: تأكد من كلمة المرور الحالية" : "Update failed: verify current password");
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleDelete = async (cardId: string, ownerId: string) => {
    const confirmMsg = isRtl ? "هل أنت متأكد من حذف هذه البطاقة؟" : "Are you sure you want to delete this card?";
    if (!window.confirm(confirmMsg)) return;
    setActionLoading(cardId);
    try {
      await deleteCardByAdmin(cardId, ownerId);
      await fetchData();
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCards = stats?.recentCards.filter(card => 
    card.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    card.id?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const t = (ar: string, en: string) => isRtl ? ar : en;

  const inputClasses = "w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all";
  const labelClasses = "block text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-2";

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="animate-spin text-blue-600 mb-6" size={64} />
        <p className="text-gray-400 font-black uppercase tracking-widest text-xs">{t('جاري تحميل لوحة التحكم...', 'Loading Dashboard...')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in-up">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl"><ShieldCheck size={20} /></div>
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{t('وصول المسؤول', 'Admin Control')}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white">
            {t('لوحة الإدارة', 'Management Console')}
          </h1>
        </div>
        
        <div className="flex bg-white dark:bg-gray-900 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto no-scrollbar">
          <button onClick={() => setActiveTab('stats')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${activeTab === 'stats' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
            <BarChart3 size={16} /> {t('الإحصائيات', 'Analytics')}
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
            <Globe size={16} /> {t('إعدادات الموقع', 'Site Settings')}
          </button>
          <button onClick={() => setActiveTab('security')} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}>
            <Lock size={16} /> {t('الأمان والحساب', 'Security')}
          </button>
        </div>
      </div>

      {activeTab === 'stats' && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">{t('إجمالي البطاقات', 'Active Cards')}</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black dark:text-white leading-none">{stats?.totalCards || 0}</span>
                <span className="text-emerald-500 text-xs font-bold mb-1 flex items-center"><ArrowUpRight size={14} /> +12%</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
             <div className="p-8 md:p-10 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <h2 className="text-2xl font-black dark:text-white">{t('إدارة البطاقات الرقمية', 'Cards Management')}</h2>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('بحث...', 'Search Cards...')} className={inputClasses} />
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredCards.map((card, idx) => (
                         <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                            <td className="px-8 py-5">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
                                    {card.profileImage ? <img src={card.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Users size={20} /></div>}
                                  </div>
                                  <div>
                                    <p className="font-black text-sm dark:text-white leading-none">{card.name || 'Anonymous'}</p>
                                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">@{card.id}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-8 py-5 text-center">
                               <div className="flex justify-center gap-2">
                                  {/* Fix: استخدام generateShareUrl بدلاً من المسار المباشر */}
                                  <a 
                                    href={generateShareUrl(card as CardData)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:scale-110 transition-all"
                                  >
                                    <Eye size={18} />
                                  </a>
                                  <button onClick={() => onEditCard(card)} className="p-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:scale-110 transition-all"><Edit3 size={18} /></button>
                                  <button onClick={() => handleDelete(card.id, card.ownerId)} disabled={actionLoading === card.id} className="p-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:scale-110 transition-all">
                                     {actionLoading === card.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
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

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8">
            <h2 className="text-2xl font-black dark:text-white flex items-center gap-3"><Globe className="text-blue-600" /> {t('إعدادات هوية الموقع', 'Site Identity Settings')}</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelClasses}>{t('اسم الموقع (العربية)', 'Site Name (Arabic)')}</label>
                  <input type="text" value={settings.siteNameAr} onChange={e => setSettings({...settings, siteNameAr: e.target.value})} className={inputClasses} placeholder="هويتي الرقمية" />
                </div>
                <div className="space-y-2">
                  <label className={labelClasses}>{t('اسم الموقع (الإنجليزية)', 'Site Name (English)')}</label>
                  <input type="text" value={settings.siteNameEn} onChange={e => setSettings({...settings, siteNameEn: e.target.value})} className={inputClasses} placeholder="My Digital ID" />
                </div>
              </div>

              <div className="p-8 bg-amber-50 dark:bg-amber-900/10 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Power className={settings.maintenanceMode ? "text-amber-600" : "text-gray-400"} />
                  <div>
                    <p className="font-black dark:text-white text-sm">{t('وضع الصيانة', 'Maintenance Mode')}</p>
                    <p className="text-[10px] font-bold text-amber-600/70">{t('تعطيل الوصول للجمهور مؤقتاً', 'Disable public access temporarily')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                  className={`w-16 h-8 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-amber-500 shadow-lg shadow-amber-500/20' : 'bg-gray-300 dark:bg-gray-700'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.maintenanceMode ? (isRtl ? 'right-9' : 'left-9') : (isRtl ? 'right-1' : 'left-1')}`} />
                </button>
              </div>

              <button onClick={handleSaveSettings} disabled={savingSettings} className="w-full py-6 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3">
                {savingSettings ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                {t('حفظ الإعدادات', 'Save Settings')}
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/20 space-y-4">
              <h3 className="font-black text-blue-900 dark:text-blue-100">{t('ملاحظة أمنية', 'Security Note')}</h3>
              <p className="text-xs leading-relaxed text-blue-800/70 dark:text-blue-300 font-bold">
                {t('يتم حفظ هذه الإعدادات في قسم عام لضمان ظهور اسم الموقع للمستخدمين حتى قبل تسجيل الدخول، بينما يتم حماية إمكانية التعديل للمسؤولين فقط.', 'These settings are stored publicly to ensure site identity visibility even before login, but write access is admin-protected.')}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl"><Shield size={24} /></div>
              <h2 className="text-2xl font-black dark:text-white">{t('أمان الحساب وتغيير البيانات', 'Account & Security')}</h2>
            </div>
            
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="text-amber-500" size={18} />
                  <span className="text-xs font-black uppercase tracking-widest text-gray-500">{t('التحقق الإلزامي', 'Mandatory Verification')}</span>
                </div>
                <div>
                  <label className={labelClasses}>{t('كلمة المرور الحالية', 'Current Password')}</label>
                  <input 
                    type="password" 
                    value={securityData.currentPassword} 
                    onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})} 
                    className={inputClasses} 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <div className="space-y-6 pt-4">
                <div>
                  <label className={labelClasses}>{t('البريد الإلكتروني للإدارة', 'New Admin Email')}</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="email" value={securityData.newEmail} onChange={e => setSecurityData({...securityData, newEmail: e.target.value})} className={`${inputClasses} pl-12`} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClasses}>{t('كلمة المرور الجديدة', 'New Password')}</label>
                    <input type="password" value={securityData.newPassword} onChange={e => setSecurityData({...securityData, newPassword: e.target.value})} className={inputClasses} placeholder="••••••••" />
                  </div>
                  <div>
                    <label className={labelClasses}>{t('تأكيد كلمة المرور الجديدة', 'Confirm New Password')}</label>
                    <input type="password" value={securityData.confirmPassword} onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})} className={inputClasses} placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <button onClick={handleUpdateSecurity} disabled={savingSecurity} className="w-full py-6 bg-red-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-red-500/20 hover:bg-red-700 transition-all flex items-center justify-center gap-3">
                {savingSecurity ? <Loader2 className="animate-spin" /> : <ShieldAlert size={20} />}
                {t('تحديث بيانات الأمان', 'Update Security')}
              </button>
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
                <div className="flex flex-col items-center text-center">
                   <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <UserCog size={40} />
                   </div>
                   <h4 className="font-black dark:text-white text-lg">{t('حساب المسؤول', 'Primary Admin')}</h4>
                   <p className="text-xs text-gray-400 font-bold mt-1 tracking-wider uppercase">{ADMIN_EMAIL}</p>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
