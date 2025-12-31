
import React, { useState } from 'react';
import { auth, updateUserSecurity, getAuthErrorMessage } from '../services/firebase';
import { Language } from '../types';
import { 
  User, Lock, Mail, ShieldCheck, Key, Loader2, 
  AlertTriangle, CheckCircle2, UserCircle 
} from 'lucide-react';

interface UserAccountProps {
  lang: Language;
}

const UserAccount: React.FC<UserAccountProps> = ({ lang }) => {
  const isRtl = lang === 'ar';
  const user = auth.currentUser;
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [securityData, setSecurityData] = useState({
    currentPassword: '',
    newEmail: user?.email || '',
    newPassword: '',
    confirmPassword: ''
  });

  const t = (ar: string, en: string) => isRtl ? ar : en;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (securityData.newPassword && securityData.newPassword !== securityData.confirmPassword) {
      setStatus({ 
        type: 'error', 
        message: t("كلمات المرور الجديدة غير متطابقة", "New passwords do not match") 
      });
      return;
    }

    setLoading(true);
    try {
      await updateUserSecurity(
        securityData.currentPassword,
        securityData.newEmail,
        securityData.newPassword || undefined
      );
      setStatus({ 
        type: 'success', 
        message: t("تم تحديث بيانات حسابك بنجاح", "Account details updated successfully") 
      });
      setSecurityData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error: any) {
      console.error("Update Error:", error);
      setStatus({ 
        type: 'error', 
        message: getAuthErrorMessage(error.code, isRtl ? 'ar' : 'en') 
      });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 transition-all";
  const labelClasses = "block text-[10px] font-black text-gray-400 dark:text-gray-500 mb-2 uppercase tracking-widest px-1";

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-10">
        <div className="flex items-center gap-5">
           <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-blue-500/20">
              <UserCircle size={40} />
           </div>
           <div>
              <h1 className="text-3xl font-black dark:text-white">{t('إعدادات الحساب', 'Account Settings')}</h1>
              <p className="text-sm font-bold text-gray-400 mt-1">{user?.email}</p>
           </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 rounded-full border border-emerald-100 dark:border-emerald-800/30">
           <ShieldCheck size={16} />
           <span className="text-[10px] font-black uppercase tracking-widest">{t('حساب محمي', 'Secure Account')}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl">
              <h3 className="font-black text-gray-900 dark:text-white mb-4">{t('معلومات الدخول', 'Login Info')}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-medium">
                {t('تستخدم هذه البيانات للوصول إلى لوحة التحكم الخاصة بك وإدارة بطاقاتك الرقمية.', 'Use these credentials to access your dashboard.')}
              </p>
           </div>
           
           <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-[2rem] border border-amber-100 dark:border-amber-900/30 flex gap-4">
              <AlertTriangle className="text-amber-600 shrink-0" size={20} />
              <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 leading-relaxed">
                {t('لتغيير البريد أو كلمة المرور، يجب إدخال كلمة المرور الحالية أولاً لدواعي الأمان.', 'Current password is required to change email or password.')}
              </p>
           </div>
        </div>

        <div className="lg:col-span-2">
           <form onSubmit={handleUpdate} className="bg-white dark:bg-gray-900 p-8 md:p-12 rounded-[3rem] border border-gray-100 dark:border-gray-800 shadow-2xl space-y-8">
              
              {status && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-fade-in ${status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  <span className="text-xs font-bold">{status.message}</span>
                </div>
              )}

              <div className="space-y-6">
                 <div>
                    <label className={labelClasses}>{t('كلمة المرور الحالية (مطلوب للتغيير)', 'Current Password (Required)')}</label>
                    <div className="relative">
                       <Key className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                       <input 
                         type="password" required
                         value={securityData.currentPassword}
                         onChange={e => setSecurityData({...securityData, currentPassword: e.target.value})}
                         className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`}
                         placeholder="••••••••"
                       />
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-6">
                    <div>
                       <label className={labelClasses}>{t('البريد الإلكتروني الجديد', 'New Email Address')}</label>
                       <div className="relative">
                          <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={18} />
                          <input 
                            type="email" required
                            value={securityData.newEmail}
                            onChange={e => setSecurityData({...securityData, newEmail: e.target.value})}
                            className={`${inputClasses} ${isRtl ? 'pr-12' : 'pl-12'}`}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div>
                          <label className={labelClasses}>{t('كلمة سر جديدة', 'New Password')}</label>
                          <input 
                            type="password"
                            value={securityData.newPassword}
                            onChange={e => setSecurityData({...securityData, newPassword: e.target.value})}
                            className={inputClasses}
                            placeholder={t('6 أحرف على الأقل', 'Min 6 characters')}
                          />
                       </div>
                       <div>
                          <label className={labelClasses}>{t('تأكيد كلمة السر', 'Confirm Password')}</label>
                          <input 
                            type="password"
                            value={securityData.confirmPassword}
                            onChange={e => setSecurityData({...securityData, confirmPassword: e.target.value})}
                            className={inputClasses}
                          />
                       </div>
                    </div>
                 </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                {t('تحديث بيانات الحساب', 'Update Account Details')}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;
