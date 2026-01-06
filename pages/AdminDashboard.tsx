
import React, { useEffect, useState, useRef } from 'react';
import { 
  getAdminStats, ADMIN_EMAIL, deleteUserCard, 
  getDoc, doc, db,
  getSiteSettings, updateSiteSettings, updateAdminSecurity,
  saveCustomTemplate, getAllTemplates, deleteTemplate,
  getAllCategories, saveTemplateCategory, deleteTemplateCategory,
  auth, getAuthErrorMessage, toggleCardStatus, getAllVisualStyles,
  getAllUsersWithStats
} from '../services/firebase';
import { uploadImageToCloud } from '../services/uploadService';
import { Language, CardData, CustomTemplate, TemplateCategory, VisualStyle } from '../types';
import { generateShareUrl } from '../utils/share';
import TemplateBuilder from '../components/TemplateBuilder';
import StyleManager from '../components/StyleManager';
import { AVAILABLE_FONTS, THEME_GRADIENTS, TRANSLATIONS, THEME_COLORS } from '../constants';
import { 
  BarChart3, Users, Clock, Loader2,
  ShieldCheck, Trash2, Edit3, Eye, Settings, 
  Globe, Power, Save, Search, LayoutGrid,
  Lock, CheckCircle2, Image as ImageIcon, UploadCloud, X, Layout, 
  Plus, Palette, ShieldAlert, Key, Star, Hash, AlertTriangle, Pin, PinOff, ArrowUpAZ,
  MoreVertical, ToggleLeft, ToggleRight, MousePointer2, TrendingUp, Filter, ListFilter, Activity, Type, FolderEdit, Check, FolderOpen, Tag, PlusCircle, Zap, HardDrive, Database, Link as LinkIcon, FolderSync, Server,
  Info, BarChart, Copy, FileJson, Code, Mail, UserCheck, Calendar, Contact2, CreditCard, RefreshCw, Crown, Type as FontIcon
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
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'templates' | 'styles' | 'categories' | 'settings' | 'security' | 'builder'>('stats');
  const [stats, setStats] = useState<{ totalCards: number; activeCards: number; totalViews: number; recentCards: any[] } | null>(null);
  const [usersStats, setUsersStats] = useState<any[]>([]);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [visualStyles, setVisualStyles] = useState<VisualStyle[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | undefined>(undefined);
  
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<{id: string, ownerId: string} | null>(null);
  
  const [categoryData, setCategoryData] = useState({ id: '', nameAr: '', nameEn: '', order: 0, isActive: true });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [showPhpCode, setShowPhpCode] = useState(false);
  const [permissionError, setPermissionError] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [settings, setSettings] = useState({ 
    siteNameAr: '', 
    siteNameEn: '', 
    siteLogo: '', 
    siteIcon: '',
    maintenanceMode: false,
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Cairo',
    imageStorageType: 'database', 
    serverUploadUrl: '',
    analyticsCode: ''
  });

  const phpSampleCode = `<?php
/**
 * NEXTID - Optimized PHP Upload Handler
 */
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $uploadDir = 'upload/';
    if (!is_dir($uploadDir)) { mkdir($uploadDir, 0777, true); }
    $ext = strtolower(pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION));
    $fileName = time() . '_' . uniqid() . '.' . $ext;
    $targetPath = $uploadDir . $fileName;
    if (move_uploaded_file($_FILES['file']['tmp_name'], $targetPath)) {
        $protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') ? "https://" : "http://";
        echo json_encode(["url" => $protocol . $_SERVER['HTTP_HOST'] . dirname($_SERVER['PHP_SELF']) . '/' . $targetPath]);
    } else { http_response_code(500); echo json_encode(["error" => "Upload failed"]); }
} else { http_response_code(400); echo json_encode(["error" => "Invalid request"]); }
?>`;

  const fetchData = async (quiet = false) => {
    if (!auth.currentUser || auth.currentUser.email !== ADMIN_EMAIL) return;
    if (!quiet) setLoading(true);
    else setIsRefreshing(true);
    
    setPermissionError(false);
    try {
      const [sData, uData, stData, tData, cData, vsData] = await Promise.all([
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
        getAllVisualStyles().catch(() => [])
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
          analyticsCode: stData.analyticsCode || ''
        });
      }
      setCustomTemplates(tData as CustomTemplate[]);
      setCategories(cData as TemplateCategory[]);
      setVisualStyles(vsData as VisualStyle[]);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryData.nameAr || !categoryData.nameEn) return;
    setIsCategorySubmitting(true);
    try {
      await saveTemplateCategory({ ...categoryData, id: editingCategoryId || undefined });
      setCategoryData({ id: '', nameAr: '', nameEn: '', order: categories.length + 1, isActive: true });
      setEditingCategoryId(null);
      await fetchData(true);
    } catch (e) { alert("Error saving category"); } finally { setIsCategorySubmitting(false); }
  };

  const handleToggleCategoryActive = async (cat: TemplateCategory) => {
    try { await saveTemplateCategory({ ...cat, isActive: !cat.isActive }); fetchData(true); } catch (e) { alert("Failed to toggle status"); }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    setLoading(true);
    try {
      await deleteTemplateCategory(categoryToDelete);
      setCategoryToDelete(null);
      await fetchData();
    } catch (e) { alert(isRtl ? "حدث خطأ أثناء الحذف" : "Error during deletion"); } finally { setLoading(false); }
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;
    try { await deleteTemplate(templateToDelete); setTemplateToDelete(null); fetchData(true); } catch (e) { alert(isRtl ? "فشل حذف القالب" : "Error deleting template"); }
  };

  const handleCloneTemplate = (tmpl: CustomTemplate) => {
    const clonedTemplate: CustomTemplate = {
      ...tmpl,
      id: `tmpl_copy_${Date.now()}`,
      nameAr: `${tmpl.nameAr} (${isRtl ? 'نسخة' : 'Copy'})`,
      nameEn: `${tmpl.nameEn} (Copy)`,
      usageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingTemplate(clonedTemplate);
    setActiveTab('builder');
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;
    setLoading(true);
    try {
      await deleteUserCard(cardToDelete.ownerId, cardToDelete.id);
      setCardToDelete(null);
      await fetchData();
    } catch (e) {
      alert(isRtl ? "فشل حذف البطاقة" : "Error deleting card");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTheme = async () => {
    setSavingSettings(true);
    try {
      await updateSiteSettings(settings);
      alert(isRtl ? "تم حفظ كافة الإعدادات بنجاح" : "All settings saved successfully");
    } catch (e) { alert(isRtl ? "فشل حفظ الإعدادات" : "Error saving settings"); } finally { setSavingSettings(false); }
  };

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);
  const [securityStatus, setSecurityStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [templateSearch, setTemplateSearch] = useState('');
  const [securityData, setSecurityData] = useState({ currentPassword: '', newEmail: ADMIN_EMAIL, newPassword: '', confirmPassword: '' });

  // دالة الترجمة المرنة
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

  if (loading && !templateToDelete && !categoryToDelete && !cardToDelete) return (
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
            <TabButton id="templates" label={t('القوالب', 'Templates')} icon={Layout} />
            <TabButton id="styles" label={t('الأنماط', 'Styles')} icon={Palette} />
            <TabButton id="categories" label={t('الأقسام', 'Categories')} icon={FolderEdit} />
            <TabButton id="settings" label={t('الإعدادات', 'Settings')} icon={Settings} />
            <TabButton id="security" label={t('الأمان', 'Security')} icon={Lock} />
          </div>
        </div>
      )}

      {permissionError && (
        <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-[2rem] flex items-center gap-4 animate-shake">
           <AlertTriangle size={32} className="text-red-500 shrink-0" />
           <div>
              <h3 className="text-sm font-black text-red-700 dark:text-red-400 uppercase tracking-widest">{t('خطأ في الصلاحيات', 'Permission Denied')}</h3>
              <p className="text-[11px] font-bold text-red-600/70 dark:text-red-500/70">{t('لا تملك صلاحيات كافية لجلب بعض البيانات من قاعدة البيانات. يرجى مراجعة إعدادات Firestore Security Rules.', 'Insufficient permissions to fetch some database records. Please check Firestore Security Rules.')}</p>
           </div>
           <button onClick={() => fetchData()} className="mr-auto ml-auto px-5 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-red-600/20 active:scale-95 transition-all">{t('تحديث', 'Retry')}</button>
        </div>
      )}

      <div className="min-h-[400px]">
        {activeTab === 'builder' && (
          <TemplateBuilder 
            lang={lang} 
            onSave={async (tmpl) => { await saveCustomTemplate(tmpl); setActiveTab('templates'); fetchData(true); }} 
            onCancel={() => setActiveTab('templates')}
            initialTemplate={editingTemplate} 
          />
        )}

        {activeTab === 'styles' && <StyleManager lang={lang} />}

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
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600"><Users size={24} /></div>
                    <div><p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('إجمالي المسجلين', 'Registered Users')}</p><h4 className="text-2xl font-black dark:text-white">{usersStats.length}</h4></div>
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
                      <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t('ابحث بالاسم أو البريد...', 'Search by name or email...')} className={`${isRtl ? 'pr-12' : 'pl-12'} w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all`} />
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                       <thead>
                         <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                           <td className="px-8 py-4">{t('البطاقة والمالك', 'Card & Owner')}</td>
                           <td className="px-8 py-4">{t('بريد صاحب الحساب (المسجل)', 'Account Owner Email')}</td>
                           <td className="px-8 py-4 text-center">{t('الحالة', 'Status')}</td>
                           <td className="px-8 py-4 text-center">{t('المشاهدات', 'Views')}</td>
                           <td className="px-8 py-4">{t('آخر تحديث', 'Last Update')}</td>
                           <td className="px-8 py-4 text-center">{t('الإجراءات', 'Actions')}</td>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {(stats?.recentCards || []).filter(c => 
                            (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (c.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (c.ownerEmail || '').toLowerCase().includes(searchTerm.toLowerCase())
                          ).map((card, idx) => (
                             <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${card.isActive === false ? 'opacity-50' : ''}`}>
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-4">
                                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-gray-50 dark:border-gray-700">
                                         {card.profileImage ? <img src={card.profileImage} className="w-full h-full object-cover" /> : <Users size={20} className="m-auto mt-4 text-gray-300" />}
                                      </div>
                                      <div className="min-w-0">
                                         <p className="font-black text-base dark:text-white truncate leading-tight">{card.name || '---'}</p>
                                         <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">/{card.id}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-3">
                                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                         <UserCheck size={14} />
                                      </div>
                                      <div className="flex flex-col">
                                         <span className="text-[11px] font-black text-gray-900 dark:text-white truncate max-w-[220px]">{card.ownerEmail || '---'}</span>
                                         <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{t('البريد الرسمي للمنشئ', 'Registered Creator Email')}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-6 text-center">
                                   <button 
                                       onClick={() => toggleCardStatus(card.id, card.ownerId, card.isActive !== false)}
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
                                <td className="px-8 py-6 text-center"><div className="flex justify-center gap-2"><a href={generateShareUrl(card as CardData)} target="_blank" className="p-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><Eye size={18} /></a><button onClick={() => onEditCard(card as CardData)} className="p-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit3 size={18} /></button><button onClick={() => setCardToDelete({id: card.id, ownerId: card.ownerId})} className="p-3 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-600 hover:text-white transition-all"><Trash2 size={18} /></button></div></td>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.2rem] bg-blue-600 text-white flex items-center justify-center shadow-lg"><Users size={32} /></div>
                    <div><p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('إجمالي المسجلين', 'Total Registered')}</p><h4 className="text-3xl font-black dark:text-white">{usersStats.length}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.2rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg"><CreditCard size={32} /></div>
                    <div><p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('متوسط البطاقات', 'Avg Cards')}</p><h4 className="text-3xl font-black dark:text-white">{(usersStats.reduce((acc, u) => acc + (u.cardCount || 0), 0) / (usersStats.length || 1)).toFixed(1)}</h4></div>
                 </div>
                 <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[1.2rem] bg-emerald-600 text-white flex items-center justify-center shadow-lg"><Activity size={32} /></div>
                    <div><p className="text-xs font-black text-gray-400 uppercase tracking-widest">{t('مستخدمين نشطين', 'Active Creators')}</p><h4 className="text-3xl font-black dark:text-white">{usersStats.filter(u => (u.cardCount || 0) > 0).length}</h4></div>
                 </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                 <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-indigo-600 text-white rounded-2xl"><Users size={24} /></div>
                       <div>
                         <h2 className="text-xl font-black dark:text-white leading-none mb-1">{t('سجل المستخدمين المسجلين', 'User Registry Statistics')}</h2>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('تتبع نمو المنصة وتفاعل المستخدمين', 'Monitor platform growth and engagement')}</p>
                       </div>
                    </div>
                    <div className="relative w-full md:w-80">
                      <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                      <input type="text" value={userSearchTerm} onChange={(e) => setUserSearchTerm(e.target.value)} placeholder={t('ابحث بالبريد...', 'Search by email...')} className={`${isRtl ? 'pr-12' : 'pl-12'} w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all`} />
                    </div>
                 </div>
                 <div className="overflow-x-auto">
                    <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                       <thead>
                         <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                           <td className="px-10 py-5">{t('المستخدم', 'User')}</td>
                           <td className="px-10 py-5 text-center">{t('عدد البطاقات', 'Cards')}</td>
                           <td className="px-10 py-5 text-center">{t('إجمالي المشاهدات', 'Total Views')}</td>
                           <td className="px-10 py-5">{t('تاريخ التسجيل', 'Join Date')}</td>
                           <td className="px-10 py-5">{t('آخر نشاط', 'Last Activity')}</td>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {usersStats.filter(u => (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase())).map((user, idx) => (
                             <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="px-10 py-6">
                                   <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center relative">
                                         {user.role === 'admin' ? <Crown size={24} className="text-amber-500" /> : <Contact2 size={24} />}
                                      </div>
                                      <div className="min-w-0">
                                         <div className="flex items-center gap-2">
                                            <p className="font-black text-sm dark:text-white truncate max-w-[200px]">{user.email}</p>
                                            {user.role === 'admin' && <span className="bg-amber-100 text-amber-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Admin</span>}
                                         </div>
                                         <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ID: {user.uid.substring(0,8)}...</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-10 py-6 text-center">
                                   <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black ${(user.cardCount || 0) > 0 ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                                      <CreditCard size={14} />
                                      {user.cardCount || 0}
                                   </div>
                                </td>
                                <td className="px-10 py-6 text-center">
                                   <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-xl text-[11px] font-black">
                                      <Eye size={14} />
                                      {user.totalViews || 0}
                                   </div>
                                </td>
                                <td className="px-10 py-6">
                                   <div className="flex flex-col">
                                      <span className="text-[11px] font-black dark:text-white">{user.createdAt ? new Date(user.createdAt).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US') : '---'}</span>
                                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={10}/> Join Date</span>
                                   </div>
                                </td>
                                <td className="px-10 py-6">
                                   <div className="flex flex-col">
                                      <span className="text-[11px] font-black dark:text-white">{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US') : (user.lastCardUpdate ? new Date(user.lastCardUpdate).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US') : '---')}</span>
                                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Clock size={10}/> Last Seen</span>
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
                 <button onClick={() => { setEditingTemplate(undefined); setActiveTab('builder'); }} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all">
                    <Plus size={18} /> {t('إنشاء قالب جديد', 'Create Template')}
                 </button>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                 <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4"><ListFilter className="text-blue-600" size={20} /><h4 className="text-sm font-black dark:text-white uppercase tracking-widest">{t('قائمة القوالب المصممة', 'Design Inventory')}</h4></div>
                    <div className="relative w-full md:w-80"><Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} /><input type="text" value={templateSearch} onChange={(e) => setTemplateSearch(e.target.value)} placeholder={t('ابحث...', 'Search...')} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 font-bold text-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all`} /></div>
                 </div>

                 <div className="overflow-x-auto">
                    <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                       <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                             <td className="px-8 py-5">{t('القالب والتفاصيل', 'Template & Details')}</td>
                             <td className="px-8 py-5">{t('القسم', 'Category')}</td>
                             <td className="px-8 py-5 text-center">{t('الحالة', 'Status')}</td>
                             <td className="px-8 py-5 text-center">{t('أولوية الترتيب', 'Display Order')}</td>
                             <td className="px-8 py-5 text-center">{t('تمييز القالب', 'Featured')}</td>
                             <td className="px-8 py-5 text-center">{t('الاستخدام', 'Usage')}</td>
                             <td className="px-8 py-5 text-center">{t('الإجراءات', 'Actions')}</td>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {customTemplates.filter(t => (isRtl ? t.nameAr : t.nameEn).toLowerCase().includes(templateSearch.toLowerCase())).map((tmpl) => (
                             <tr key={tmpl.id} className="group hover:bg-blue-50/20 transition-all">
                                <td className="px-8 py-6"><div className="flex items-center gap-5"><div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border-2 border-white shadow-md">{tmpl.config.defaultBackgroundImage ? <img src={tmpl.config.defaultBackgroundImage} className="w-full h-full object-cover" /> : <Palette size={24} className="m-auto mt-4 text-blue-400" />}</div><div><p className="font-black text-base dark:text-white leading-tight mb-1">{isRtl ? tmpl.nameAr : tmpl.nameEn}</p><p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{tmpl.config.headerType}</p></div></div></td>
                                <td className="px-8 py-6">
                                   <div className="flex items-center gap-2">
                                      <FolderOpen size={14} className="text-blue-500" />
                                      <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300 uppercase">
                                         {categories.find(c => c.id === tmpl.categoryId) ? (isRtl ? categories.find(c => c.id === tmpl.categoryId)!.nameAr : categories.find(c => c.id === tmpl.categoryId)!.nameEn) : t('بدون قسم', 'Uncategorized')}
                                      </span>
                                   </div>
                                </td>
                                <td className="px-8 py-6 text-center"><button onClick={() => saveCustomTemplate({...tmpl, isActive: !tmpl.isActive}).then(() => fetchData(true))} className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase transition-all ${tmpl.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'}`}>{tmpl.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}{tmpl.isActive ? t('نشط', 'Active') : t('معطل', 'Disabled')}</button></td>
                                <td className="px-8 py-6 text-center">
                                   <input 
                                     type="number" 
                                     value={tmpl.order || 0} 
                                     onChange={(e) => saveCustomTemplate({...tmpl, order: parseInt(e.target.value) || 0}).then(() => fetchData(true))}
                                     className="w-16 px-2 py-1 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 font-black text-blue-600 outline-none"
                                   />
                                </td>
                                <td className="px-8 py-6 text-center">
                                   <button 
                                      onClick={() => saveCustomTemplate({...tmpl, isFeatured: !tmpl.isFeatured}).then(() => fetchData(true))}
                                      className={`p-3 rounded-xl transition-all ${tmpl.isFeatured ? 'bg-amber-50 text-amber-500 border border-amber-200 shadow-sm' : 'bg-gray-50 text-gray-300'}`}
                                   >
                                      <Star size={20} fill={tmpl.isFeatured ? "currentColor" : "none"} />
                                   </button>
                                </td>
                                <td className="px-8 py-6 text-center"><div className="flex flex-col"><span className="text-lg font-black text-indigo-600 leading-none">{tmpl.usageCount || 0}</span><span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t('استخدام', 'Uses')}</span></div></td>
                                <td className="px-8 py-6 text-center">
                                  <div className="flex justify-center gap-2">
                                    <button 
                                      onClick={() => handleCloneTemplate(tmpl)} 
                                      title={isRtl ? "نسخ القالب" : "Clone Template"}
                                      className="p-3 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                    >
                                      <Copy size={18} />
                                    </button>
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
              </div>
           </div>
        )}

        {activeTab === 'categories' && (
          <div className="w-full space-y-10 animate-fade-in">
             <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center gap-8 relative z-10">
                   <div className="shrink-0 flex items-center gap-5">
                      <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20"><PlusCircle size={28} /></div>
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-black dark:text-white uppercase leading-none">{editingCategoryId ? t('تعديل القسم', 'Edit Section') : t('إضافة قسم جديد', 'New Section')}</h2>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('تنظيم وتصنيف القوالب', 'Categorize your templates')}</span>
                      </div>
                   </div>
                   
                   <form onSubmit={handleSaveCategory} className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 items-end w-full">
                      <div>
                         <label className={labelTextClasses}>{t('الاسم (عربي)', 'Name (AR)')}</label>
                         <input type="text" required value={categoryData.nameAr} onChange={e => setCategoryData({...categoryData, nameAr: e.target.value})} className={inputClasses} placeholder="مثلاً: كروت أعمال" />
                      </div>
                      <div>
                         <label className={labelTextClasses}>{t('الاسم (EN)', 'Name (EN)')}</label>
                         <input type="text" required value={categoryData.nameEn} onChange={e => setCategoryData({...categoryData, nameEn: e.target.value})} className={inputClasses} placeholder="Ex: Business Cards" />
                      </div>
                      <div>
                         <label className={labelTextClasses}>{t('الترتيب الهيكلي', 'Display Order')}</label>
                         <input type="number" required value={categoryData.order} onChange={e => setCategoryData({...categoryData, order: parseInt(e.target.value) || 0})} className={inputClasses} />
                      </div>
                      <div className="flex gap-3">
                         <button type="submit" disabled={isCategorySubmitting} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all">
                            {isCategorySubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {editingCategoryId ? t('تحديث البيانات', 'Update') : t('حفظ القسم', 'Save')}
                         </button>
                         {editingCategoryId && (
                           <button type="button" onClick={() => { setEditingCategoryId(null); setCategoryData({ id: '', nameAr: '', nameEn: '', order: categories.length + 1, isActive: true }); }} className="p-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all border border-gray-100 dark:border-gray-700">
                              <X size={20} />
                           </button>
                         )}
                      </div>
                   </form>
                </div>
             </div>

             <div className="bg-white dark:bg-gray-900 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden">
                <div className="p-10 border-b border-gray-50 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 shadow-inner"><Tag size={28} /></div>
                      <div>
                         <h3 className="text-2xl font-black dark:text-white uppercase leading-tight">{t('قائمة تصنيفات المنصة', 'Platform Categories')}</h3>
                         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{t('إدارة كافة الأقسام التي تظهر في المعرض', 'Manage all gallery sections')}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="px-8 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-blue-100 dark:border-blue-900/30">
                        {categories.length} {t('قسم مفعل', 'Active Sections')}
                      </div>
                   </div>
                </div>
                
                <div className="overflow-x-auto">
                   <table className={`w-full text-${isRtl ? 'right' : 'left'}`}>
                      <thead>
                         <tr className="bg-gray-50/50 dark:bg-gray-800/20 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-gray-100 dark:border-gray-800">
                            <td className="px-12 py-6">{t('الترتيب', 'Order')}</td>
                            <td className="px-12 py-6">{t('اسم القسم والتصنيف', 'Category Identity')}</td>
                            <td className="px-12 py-6 text-center">{t('القوالب المرتبطة', 'Linked Templates')}</td>
                            <td className="px-12 py-6 text-center">{t('حالة العرض', 'Display Status')}</td>
                            <td className="px-12 py-6 text-center">{t('خيارات التحكم', 'Control Panel')}</td>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                         {categories.map((cat) => (
                            <tr key={cat.id} className="group hover:bg-blue-50/10 transition-all">
                               <td className="px-12 py-8">
                                  <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center font-black text-blue-600 text-xl shadow-inner border border-white dark:border-gray-700">
                                     {cat.order}
                                  </div>
                               </td>
                               <td className="px-12 py-8">
                                  <div>
                                     <p className="font-black text-xl dark:text-white leading-none mb-2">{isRtl ? cat.nameAr : cat.nameEn}</p>
                                     <div className="flex items-center gap-2">
                                        <Hash size={12} className="text-gray-300" />
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{cat.id}</span>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-12 py-8 text-center">
                                  <div className="inline-flex items-center gap-3 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-[1.2rem] font-black text-base shadow-sm">
                                     <LayoutGrid size={18} />
                                     {customTemplates.filter(t => t.categoryId === cat.id).length}
                                  </div>
                               </td>
                               <td className="px-12 py-8 text-center">
                                  <button 
                                     onClick={() => handleToggleCategoryActive(cat)}
                                     className={`inline-flex items-center gap-3 px-8 py-3 rounded-2xl text-[11px] font-black uppercase transition-all shadow-md ${cat.isActive !== false ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                                  >
                                     {cat.isActive !== false ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                                     {cat.isActive !== false ? t('نشط حالياً', 'Live Now') : t('معطل', 'Disabled')}
                                  </button>
                               </td>
                               <td className="px-12 py-8 text-center">
                                  <div className="flex justify-center gap-4 opacity-100 md:opacity-40 group-hover:opacity-100 transition-opacity">
                                     <button 
                                       onClick={() => { setEditingCategoryId(cat.id); setCategoryData(cat); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                                       className="p-4 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-blue-500/20"
                                     >
                                        <Edit3 size={20} />
                                     </button>
                                     <button 
                                       onClick={() => setCategoryToDelete(cat.id)} 
                                       className="p-4 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm hover:shadow-red-500/20"
                                     >
                                        <Trash2 size={20} />
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
          <div className="w-full space-y-10 animate-fade-in">
             <div className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-10">
                <div className="space-y-6">
                   <div className="flex items-center gap-4"><div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><ImageIcon size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('الهوية البصرية للمنصة', 'Platform Visual Identity')}</h2></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center gap-4">
                        <label className={`${labelTextClasses} text-center`}>{t('اسم الموقع (النصي)', 'Site Brand Name')}</label>
                        <div className="w-full h-32 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border overflow-hidden flex flex-col items-center justify-center p-4">
                           <div className="flex items-center gap-2 mb-2">
                             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-[10px]">ID</div>
                             <span className="font-black dark:text-white text-sm">{isRtl ? settings.siteNameAr : settings.siteNameEn}</span>
                           </div>
                           <p className="text-[8px] text-gray-400 font-bold uppercase">{t('معاينة الهيدر', 'Header Preview')}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center gap-4">
                        <label className={`${labelTextClasses} text-center`}>{t('أيقونة المتصفح (Favicon)', 'Browser Tab Icon')}</label>
                        <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-900 shadow-sm border overflow-hidden flex items-center justify-center relative mx-auto">
                          {settings.siteIcon ? <img src={settings.siteIcon} className="w-full h-full object-contain p-1" /> : <Layout size={24} className="text-gray-200" />}
                          {uploadingIcon && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                        </div>
                        <input type="file" ref={iconInputRef} onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; setUploadingIcon(true); const b = await uploadImageToCloud(f, 'logo', { storageType: settings.imageStorageType as any, uploadUrl: settings.serverUploadUrl }); if (b) setSettings({...settings, siteIcon: b}); setUploadingIcon(false); }} accept="image/*" className="hidden" />
                        <button onClick={() => iconInputRef.current?.click()} className="w-full py-2.5 bg-white dark:bg-gray-800 border rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2 transition-all active:scale-95"><UploadCloud size={14} className="text-blue-500" /> {t('تغيير أيقونة التبويب', 'Change Tab Icon')}</button>
                      </div>
                   </div>
                </div>

                <div className="pt-10 border-t border-gray-100 dark:border-gray-800 space-y-8">
                   <div className="flex items-center gap-4"><div className="p-3 bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-2xl"><FontIcon size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('selectSiteFont')}</h2></div>
                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                      {AVAILABLE_FONTS.map((font) => (
                        <button 
                          key={font.id} 
                          onClick={() => setSettings({...settings, fontFamily: font.id})}
                          className={`py-4 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${settings.fontFamily === font.id ? 'bg-violet-600 text-white border-violet-600 shadow-lg' : 'bg-gray-50 dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700'}`}
                          style={{ fontFamily: font.id }}
                        >
                           <span className="text-base font-black">Aa</span>
                           <span className="text-[8px] font-black uppercase text-center leading-tight">{isRtl ? font.nameAr : font.name}</span>
                        </button>
                      ))}
                   </div>
                </div>

                <div className="pt-10 border-t border-gray-100 dark:border-gray-800 space-y-8">
                   <div className="flex items-center gap-4"><div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-2xl"><Server size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('إعدادات مجلد رفع الصور', 'Image Upload Destination')}</h2></div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <label className={labelTextClasses}>{t('مكان تخزين الملفات', 'Files Destination')}</label>
                         <div className="flex bg-gray-50 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-inner">
                            <button onClick={() => setSettings({...settings, imageStorageType: 'database'})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${settings.imageStorageType === 'database' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400'}`}><Database size={14} /> {t('قاعدة البيانات', 'Database')}</button>
                            <button onClick={() => setSettings({...settings, imageStorageType: 'server'})} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${settings.imageStorageType === 'server' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400'}`}><HardDrive size={14} /> {t('سيرفر خاص', 'Private Server')}</button>
                         </div>
                      </div>

                      {settings.imageStorageType === 'server' && (
                        <div className="space-y-4 animate-fade-in-up">
                           <label className={labelTextClasses}>{t('رابط معالج الرفع (API/URL)', 'Server Upload Handler URL')}</label>
                           <div className="relative">
                              <LinkIcon className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
                              <input type="url" value={settings.serverUploadUrl} onChange={(e) => setSettings({...settings, serverUploadUrl: e.target.value})} className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'} !py-3.5 font-mono text-[11px]`} placeholder="https://nextid.my/upload.php" />
                           </div>
                           <button onClick={() => setShowPhpCode(!showPhpCode)} className="w-full py-2 bg-amber-600 text-white rounded-lg font-black text-[9px] uppercase flex items-center justify-center gap-2"><Code size={14} /> {showPhpCode ? t('إخفاء الكود', 'Hide Code') : t('عرض كود PHP الجاهز للسيرفر', 'Show Sample PHP Script')}</button>
                        </div>
                      )}
                   </div>

                   {settings.imageStorageType === 'server' && showPhpCode && (
                     <div className="animate-fade-in-up space-y-4">
                        <pre className="p-6 bg-gray-900 text-emerald-400 rounded-2xl text-[10px] font-mono overflow-x-auto border-2 border-indigo-500/20">{phpSampleCode}</pre>
                     </div>
                   )}
                </div>

                <div className="pt-10 border-t border-gray-100 dark:border-gray-800 space-y-8">
                   <div className="flex items-center gap-4"><div className="p-3 bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-2xl"><BarChart size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('إعدادات تتبع الزوار (Analytics)', 'Analytics Integration')}</h2></div>
                   <textarea value={settings.analyticsCode} onChange={(e) => setSettings({...settings, analyticsCode: e.target.value})} className={`${inputClasses} font-mono text-[11px] min-h-[150px] resize-y py-4`} placeholder="<!-- Paste your scripts here -->" />
                </div>

                <div className="pt-10 border-t border-gray-100 dark:border-gray-800 space-y-8">
                   <div className="flex items-center gap-4"><div className="p-3 bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-2xl"><Palette size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('ألوان وخطوط المنصة', 'Platform Theme')}</h2></div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <label className={labelTextClasses}>{t('اللون الأساسي للموقع', 'Primary Site Color')}</label>
                         <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <input type="color" value={settings.primaryColor} onChange={(e) => setSettings({...settings, primaryColor: e.target.value})} className="w-14 h-14 rounded-xl cursor-pointer" />
                            <input type="text" value={settings.primaryColor} onChange={(e) => setSettings({...settings, primaryColor: e.target.value})} className="bg-transparent font-mono text-sm uppercase flex-1 dark:text-white font-black" />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <label className={labelTextClasses}>{t('اللون الثانوي للموقع', 'Secondary Color')}</label>
                         <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                            <input type="color" value={settings.secondaryColor} onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})} className="w-14 h-14 rounded-xl cursor-pointer" />
                            <input type="text" value={settings.secondaryColor} onChange={(e) => setSettings({...settings, secondaryColor: e.target.value})} className="bg-transparent font-mono text-sm uppercase flex-1 dark:text-white font-black" />
                         </div>
                      </div>
                   </div>
                </div>

                <button onClick={handleApplyTheme} disabled={savingSettings} className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all text-xl uppercase tracking-widest">
                  {savingSettings ? <Loader2 className="animate-spin" /> : <Save size={24} />} 
                  {t('حفظ وتطبيق الهوية الجديدة', 'Apply Platform Theme')}
                </button>
             </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="w-full max-w-2xl mx-auto animate-fade-in">
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
               } finally { setSavingSecurity(false); } 
             }} className="bg-white dark:bg-gray-900 p-10 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-8">
                <div className="flex items-center gap-4"><div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 rounded-2xl"><Key size={24} /></div><h2 className="text-2xl font-black dark:text-white">{t('أمان المسؤول', 'Admin Security')}</h2></div>
                {securityStatus && <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${securityStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{securityStatus.message}</div>}
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

      {/* --- نوافذ تأكيد الحذف --- */}

      {cardToDelete && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[400px] rounded-[3.5rem] p-10 text-center shadow-2xl animate-fade-in border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner"><Trash2 size={40} /></div>
            <h3 className="text-2xl font-black mb-4 dark:text-white">{t('تأكيد حذف البطاقة العامة', 'Confirm Profile Delete')}</h3>
            <p className="text-sm font-bold text-gray-400 mb-8 leading-relaxed px-4">{t('سيتم مسح هذه البطاقة نهائياً من قاعدة البيانات ومن حساب المستخدم. هل أنت متأكد؟', 'This will delete the card from database and user account permanently. Are you sure?')}</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDeleteCard} className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase shadow-xl shadow-red-500/20 active:scale-95 transition-all">نعم، احذف البطاقة</button>
              <button onClick={() => setCardToDelete(null)} className="py-5 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-3xl font-black text-sm uppercase">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {templateToDelete && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[360px] rounded-[3.5rem] p-10 text-center shadow-2xl animate-fade-in border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner"><Trash2 size={40} /></div>
            <h3 className="text-2xl font-black mb-4 dark:text-white">{t('تأكيد حذف القالب', 'Confirm Template Delete')}</h3>
            <p className="text-sm font-bold text-gray-400 mb-8 leading-relaxed px-4">{t('هل أنت متأكد من رغبتك في حذف هذا التصميم نهائياً؟ لا يمكن التراجع عن هذا الإجراء.', 'This template will be permanently removed. This action cannot be undone.')}</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDeleteTemplate} className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase shadow-xl shadow-red-500/20 active:scale-95 transition-all">نعم، حذف القالب</button>
              <button onClick={() => setTemplateToDelete(null)} className="py-5 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-3xl font-black text-sm uppercase">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {categoryToDelete && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-gray-900 w-full max-w-[360px] rounded-[3.5rem] p-10 text-center shadow-2xl animate-fade-in border border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner"><Trash2 size={40} /></div>
            <h3 className="text-2xl font-black mb-4 dark:text-white">{t('تأكيد حذف القسم', 'Confirm Category Delete')}</h3>
            <p className="text-sm font-bold text-gray-400 mb-8 leading-relaxed px-4">{t('سيؤدي هذا إلى حذف القسم. القوالب المرتبطة به ستصبح "بدون تصنيف". هل أنت متأكد؟', 'Deleting this category will make all linked templates uncategorized. Are you sure?')}</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDeleteCategory} className="py-5 bg-red-600 text-white rounded-3xl font-black text-sm uppercase shadow-xl shadow-red-500/20 active:scale-95 transition-all">نعم، حذف القسم</button>
              <button onClick={() => setCategoryToDelete(null)} className="py-5 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-3xl font-black text-sm uppercase">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
