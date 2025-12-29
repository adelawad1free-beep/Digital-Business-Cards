
import React, { useEffect, useState } from 'react';
import { getAdminStats, ADMIN_EMAIL } from '../services/firebase';
import { Language } from '../types';
import { BarChart3, Users, Clock, ArrowUpRight, Loader2, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';

interface AdminDashboardProps {
  lang: Language;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang }) => {
  const [stats, setStats] = useState<{ totalCards: number; recentCards: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch administrative statistics from Firebase
  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      if (err.code === 'permission-denied' || err.message?.includes('permission')) {
        setError('permissions');
      } else {
        setError('unknown');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const t = (ar: string, en: string) => lang === 'ar' ? ar : en;

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <p className="text-gray-500 font-bold">{t('جاري جلب الإحصائيات...', 'Fetching statistics...')}</p>
      </div>
    );
  }

  // Handle permission errors by showing required Firestore rules
  if (error === 'permissions') {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-[3rem] p-12 shadow-2xl border border-amber-100 dark:border-amber-900/20 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-3xl flex items-center justify-center text-amber-600 mx-auto">
          <ShieldAlert size={40} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white">
          {t('خطأ في الصلاحيات (Firestore Rules)', 'Firestore Permissions Error')}
        </h2>
        <p className="text-gray-500 font-bold max-w-md mx-auto leading-relaxed">
          {t(
            'يبدو أن القواعد الأمنية لـ Firestore لا تسمح للمسؤول بجلب الإحصائيات. يرجى التأكد من تحديث القواعد في لوحة تحكم Firebase.',
            'It seems Firestore Security Rules are preventing the admin from fetching stats. Please ensure you update the rules in your Firebase Console.'
          )}
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl text-left font-mono text-xs overflow-x-auto border border-gray-100 dark:border-gray-700">
          <p className="text-blue-600 font-bold mb-2">// Copy these rules to Firebase Console (Firestore Rules tab):</p>
          <pre className="text-gray-600 dark:text-gray-400">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /public_cards/{cardId} {
      allow read: if true;
      allow create, update: if request.auth != null;
      allow list: if request.auth != null && request.auth.token.email == '${ADMIN_EMAIL}';
    }
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
          </pre>
        </div>
        <button 
          onClick={fetchStats}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all"
        >
          {t('إعادة المحاولة', 'Retry Connection')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
            {t('لوحة التحكم الملكية', 'Admin Command Center')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold">
            {t('مرحباً بك يا مدير، إليك نظرة على نشاط المنصة.', 'Welcome Admin, here is an overview of the platform activity.')}
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 font-bold text-sm shadow-sm hover:bg-gray-50 transition-all"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          {t('تحديث البيانات', 'Refresh Data')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Cards Metric */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600">
            <Users size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('إجمالي البطاقات', 'Total Cards')}</p>
            <p className="text-3xl font-black dark:text-white">{stats?.totalCards || 0}</p>
          </div>
        </div>

        {/* Activity Analytics Metric */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-6">
          <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center text-violet-600">
            <BarChart3 size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('تحليلات النشاط', 'Activity Analytics')}</p>
            <p className="text-3xl font-black dark:text-white">{t('مفعلة', 'Active')}</p>
          </div>
        </div>

        {/* System Status Metric */}
        <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
            <ShieldCheck size={32} />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('حالة النظام', 'System Status')}</p>
            <p className="text-3xl font-black dark:text-white">{t('مستقر', 'Stable')}</p>
          </div>
        </div>
      </div>

      {/* Recent Cards List */}
      <div className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-black dark:text-white flex items-center gap-3">
            <Clock className="text-blue-600" />
            {t('أحدث البطاقات المنشأة', 'Recently Created Cards')}
          </h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {stats?.recentCards.map((card: any, idx: number) => (
            <div key={idx} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  {card.profileImage ? (
                    <img src={card.profileImage} className="w-full h-full object-cover" alt={card.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Users size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{card.name || 'N/A'}</p>
                  <p className="text-xs text-gray-500 font-medium">
                    {card.title} {card.company ? `@ ${card.company}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline-block text-[10px] font-black px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full uppercase tracking-tighter">
                  ID: {card.id}
                </span>
                <a 
                  href={`?u=${card.id}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 transition-all"
                >
                  <ArrowUpRight size={18} />
                </a>
              </div>
            </div>
          ))}
          {stats?.recentCards.length === 0 && (
            <div className="p-12 text-center text-gray-400 font-bold">
              {t('لا توجد بطاقات منشأة بعد.', 'No cards have been created yet.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
