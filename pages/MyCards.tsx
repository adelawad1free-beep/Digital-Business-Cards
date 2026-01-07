import React, { useState, useEffect } from 'react';
import { CardData, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, ExternalLink, Edit2, User as UserIcon, 
  Share2, AlertTriangle, X, Eye, Calendar, ShieldCheck, 
  Clock, TrendingUp, Sparkles, Crown, Zap, ArrowUpRight,
  // Fix: Added missing Loader2 import from lucide-react
  Loader2,
  // Added missing imports
  CreditCard, Star
} from 'lucide-react';
import ShareModal from '../components/ShareModal';
import { auth, getUserProfile } from '../services/firebase';

interface MyCardsProps {
  lang: Language;
  cards: CardData[];
  onAdd: () => void;
  onEdit: (card: CardData) => void;
  onDelete: (id: string, ownerId: string) => void;
}

const MyCards: React.FC<MyCardsProps> = ({ lang, cards, onAdd, onEdit, onDelete }) => {
  const isRtl = lang === 'ar';
  const navigate = useNavigate();
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  const [sharingCard, setSharingCard] = useState<CardData | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CardData | null>(null);
  const [userRole, setUserRole] = useState<'user' | 'premium' | 'admin'>('user');
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);

  useEffect(() => {
    if (auth.currentUser) {
      getUserProfile(auth.currentUser.uid).then(profile => {
        if (profile) {
          setUserRole(profile.role);
          setPremiumUntil(profile.premiumUntil || null);
        }
      });
    }
  }, []);

  const isPremium = userRole === 'premium' || userRole === 'admin';

  const handleDeleteConfirm = () => {
    if (cardToDelete) {
      onDelete(cardToDelete.id, cardToDelete.ownerId || '');
      setCardToDelete(null);
    }
  };

  const getMembershipStats = (card: CardData) => {
    if (!card.membershipExpiryDate) return null;
    const now = new Date();
    const start = card.membershipStartDate ? new Date(card.membershipStartDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = new Date(card.membershipExpiryDate);
    const total = end.getTime() - start.getTime();
    const remaining = end.getTime() - now.getTime();
    const progress = Math.max(0, Math.min(100, (remaining / total) * 100));
    const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));
    let color = 'bg-emerald-500';
    if (daysLeft <= 0) color = 'bg-red-500';
    else if (daysLeft <= 7) color = 'bg-orange-500';
    return { progress, daysLeft, color, start, end };
  };

  const handleCreateMembershipCard = () => {
    navigate(`/${lang}/templates?mode=private`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-12 animate-fade-in-up">
      
      {/* Premium Upgrade Banner for Basic Users */}
      {!isPremium && cards.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
           <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-2xl">
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                    <Sparkles size={12} /> {isRtl ? 'عرض خاص لفترة محدودة' : 'Limited Time Offer'}
                 </div>
                 <h2 className="text-3xl md:text-4xl font-black leading-tight">
                    {isRtl ? 'احصل على هويتي الرقمية الموثقة الآن' : 'Get Your Verified Digital Identity Now'}
                 </h2>
                 <p className="text-blue-100 font-bold opacity-90">
                    {isRtl 
                      ? 'قم بترقية حسابك للعضوية المميزة واحصل على وسام التوثيق، قوالب حصرية، وإمكانية تفعيل نظام العضويات والاشتراكات لعملائك.' 
                      : 'Upgrade to Premium and get a verified badge, exclusive templates, and the ability to enable membership systems for your clients.'}
                 </p>
              </div>
              <button 
                onClick={() => navigate(`/${lang}/custom-orders`)}
                className="shrink-0 px-10 py-5 bg-white text-blue-600 rounded-[1.5rem] font-black text-sm uppercase shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                 {isRtl ? 'اطلب الترقية الآن' : 'Upgrade Account'}
                 <ArrowUpRight size={18} />
              </button>
           </div>
           <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <Crown size={240} />
           </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className={`p-4 rounded-[1.5rem] shadow-lg ${isPremium ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-blue-600 text-white shadow-blue-500/20'}`}>
              {isPremium ? <Crown size={32} /> : <CreditCard size={32} />}
           </div>
           <div>
              <h2 className="text-4xl font-black dark:text-white leading-tight">{t('myCards')}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    {isRtl ? `لديك ${cards.length} بطاقة رقمية مفعلة` : `You have ${cards.length} active digital cards`}
                 </p>
                 {isPremium && (
                   <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-tighter">
                      <Star size={10} fill="currentColor" /> {isRtl ? 'حساب مميز' : 'Premium Member'}
                   </div>
                 )}
              </div>
           </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            {isPremium && (
               <button onClick={handleCreateMembershipCard} className="flex items-center justify-center gap-3 px-6 py-4 bg-amber-500 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all">
                <ShieldCheck size={20} />
                {isRtl ? 'بطاقة عضوية خاصة' : 'Private Member Card'}
               </button>
            )}
            <button onClick={onAdd} className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all">
              <Plus size={20} />
              {isRtl ? 'إنشاء بطاقة جديدة' : 'Create New Card'}
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {cards.map((card) => {
          const mStats = getMembershipStats(card);
          return (
            <div key={card.id} className="bg-white dark:bg-[#0f0f12] rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800/50 flex flex-col overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
              <div className="p-8 pb-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800 border-2 border-white dark:border-gray-700 shadow-lg overflow-hidden flex items-center justify-center">
                      {card.profileImage ? (
                        <img src={card.profileImage} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <UserIcon size={24} className="text-gray-300"/>
                      )}
                    </div>
                    {card.isActive !== false && (
                       <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#0f0f12] rounded-full"></div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-black text-xl text-gray-900 dark:text-white truncate leading-tight">{card.name || '---'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-lg">ID: {card.id}</span>
                       {card.isVerified && <ShieldCheck size={12} className="text-blue-500" />}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-xl">
                      <Eye size={14} />
                      <span className="text-[11px] font-black">{card.viewCount || 0}</span>
                   </div>
                </div>
              </div>

              <div className="px-8 py-4">
                {card.showMembership && mStats ? (
                  <div className="p-5 bg-gray-50 dark:bg-white/[0.03] rounded-[2rem] border border-gray-100 dark:border-white/5 space-y-4">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center gap-2">
                          <ShieldCheck size={14} className={mStats.daysLeft > 0 ? "text-emerald-500" : "text-red-500"} />
                          <span className="text-[9px] font-black dark:text-white uppercase tracking-widest">
                             {isRtl ? (card.membershipTitleAr || 'حالة العضوية') : (card.membershipTitleEn || 'Membership')}
                          </span>
                       </div>
                       <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${mStats.daysLeft > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {mStats.daysLeft > 0 ? (isRtl ? `${mStats.daysLeft} يوم متبقي` : `${mStats.daysLeft} Days Left`) : (isRtl ? 'منتهي' : 'Expired')}
                       </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                       <div className={`h-full transition-all duration-1000 ${mStats.color}`} style={{ width: `${mStats.progress}%` }} />
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                       <div className="flex items-center gap-1"><Calendar size={10}/> {mStats.start.toLocaleDateString()}</div>
                       <div className="flex items-center gap-1">{mStats.end.toLocaleDateString()} <Clock size={10}/></div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[102px] flex items-center justify-center border border-dashed border-gray-200 dark:border-gray-800 rounded-[2rem] group-hover:border-blue-500/30 transition-colors">
                     <p className="text-[9px] font-black text-gray-300 dark:text-gray-700 uppercase tracking-widest">{isRtl ? 'العضوية غير مفعلة للبطاقة' : 'Membership not enabled'}</p>
                  </div>
                )}
              </div>

              <div className="mt-auto p-8 pt-2">
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => onEdit(card)} className="p-3.5 bg-gray-900 text-white rounded-2xl flex items-center justify-center hover:bg-black transition-all shadow-lg" title={t('تعديل')}><Edit2 size={18} /></button>
                  <button onClick={() => setSharingCard(card)} className="p-3.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm" title={t('مشاركة')}><Share2 size={18} /></button>
                  <a href={`?u=${card.id}`} target="_blank" rel="noopener noreferrer" className="p-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm" title={t('عرض')}><ExternalLink size={18} /></a>
                  <button onClick={() => setCardToDelete(card)} className="p-3.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm" title={t('حذف')}><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          );
        })}
        
        <button onClick={onAdd} className="flex flex-col items-center justify-center p-12 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-blue-500 hover:bg-blue-50/10 transition-all duration-500 group">
          <div className="w-20 h-20 rounded-[2rem] bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner mb-6">
            <Plus size={32} />
          </div>
          <span className="text-xs font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest">
            {isRtl ? 'إضافة بطاقة جديدة' : 'Add New Card'}
          </span>
        </button>
      </div>
      
      {sharingCard && (
        <ShareModal data={sharingCard} lang={lang} onClose={() => setSharingCard(null)} />
      )}

      {cardToDelete && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-sm rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-8 text-center space-y-6 animate-zoom-in">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle size={40} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black dark:text-white leading-relaxed">{isRtl ? "تأكيد حذف البطاقة" : "Confirm Card Deletion"}</h3>
                 <p className="text-xs font-bold text-gray-400 leading-relaxed px-4">
                    {isRtl ? `هل أنت متأكد من حذف البطاقة "${cardToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.` : `Are you sure you want to delete "${cardToDelete.name}"? This action cannot be undone.`}
                 </p>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                 <button onClick={handleDeleteConfirm} className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2">
                    <Trash2 size={18} /> {isRtl ? "نعم، حذف البطاقة" : "Yes, Delete Card"}
                 </button>
                 <button onClick={() => setCardToDelete(null)} className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl font-black text-[10px] uppercase hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                    <X size={16} /> {isRtl ? "تراجع" : "Cancel"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyCards;