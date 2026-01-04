
import React, { useState } from 'react';
import { CardData, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { Plus, Trash2, ExternalLink, Edit2, User as UserIcon, Share2, AlertTriangle, RotateCcw, X } from 'lucide-react';
import ShareModal from '../components/ShareModal';

interface MyCardsProps {
  lang: Language;
  cards: CardData[];
  onAdd: () => void;
  onEdit: (card: CardData) => void;
  onDelete: (id: string, ownerId: string) => void;
}

const MyCards: React.FC<MyCardsProps> = ({ lang, cards, onAdd, onEdit, onDelete }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key]?.[lang] || TRANSLATIONS[key]?.['en'] || key;
  const [sharingCard, setSharingCard] = useState<CardData | null>(null);
  const [cardToDelete, setCardToDelete] = useState<CardData | null>(null);

  const handleDeleteConfirm = () => {
    if (cardToDelete) {
      onDelete(cardToDelete.id, cardToDelete.ownerId || '');
      setCardToDelete(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl md:text-4xl font-black dark:text-white">{t('myCards')}</h2>
        <button 
          onClick={onAdd}
          className="p-3.5 md:p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {cards.map((card) => (
          <div key={card.id} className="bg-white dark:bg-[#121215] p-5 md:p-6 rounded-[2.5rem] shadow-sm border border-gray-50 dark:border-gray-800 group transition-all duration-300 hover:shadow-xl">
            <div className={`flex items-start justify-between mb-6 md:mb-8 ${isRtl ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`flex flex-col ${isRtl ? 'items-start' : 'items-end'} min-w-0 flex-1`}>
                <h3 className="font-black text-lg md:text-xl text-gray-900 dark:text-white truncate w-full mb-2">{card.name || '---'}</h3>
                <div className="inline-flex items-center px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full">
                  <span className="text-[10px] font-black tracking-widest">{card.id}</span>
                </div>
              </div>
              <div className={`shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-50 dark:bg-gray-900 ${isRtl ? 'mr-4' : 'ml-4'}`}>
                {card.profileImage ? (
                  <img src={card.profileImage} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <UserIcon size={24} className="text-gray-300"/>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <button 
                onClick={() => setCardToDelete(card)} 
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                title={isRtl ? 'حذف' : 'Delete'}
              >
                <Trash2 size={18} />
              </button>
              
              <button 
                onClick={() => setSharingCard(card)} 
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                title={isRtl ? 'مشاركة' : 'Share'}
              >
                <Share2 size={18} />
              </button>

              <a 
                href={`?u=${card.id}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                title={isRtl ? 'عرض' : 'View'}
              >
                <ExternalLink size={18} />
              </a>
              
              <button 
                onClick={() => onEdit(card)} 
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                title={isRtl ? 'تعديل' : 'Edit'}
              >
                <Edit2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        <button 
          onClick={onAdd}
          className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800 hover:border-blue-200 hover:bg-blue-50/10 transition-all group min-h-[160px]"
        >
          <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm mb-4">
            <Plus size={24} />
          </div>
          <span className="text-[11px] font-black text-gray-400 group-hover:text-blue-600 uppercase tracking-widest">
            {isRtl ? 'إضافة بطاقة جديدة' : 'Add New Card'}
          </span>
        </button>
      </div>
      
      {cards.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 font-bold">{t('noCardsYet')}</p>
        </div>
      )}

      {sharingCard && (
        <ShareModal 
          data={sharingCard} 
          lang={lang} 
          onClose={() => setSharingCard(null)} 
        />
      )}

      {/* نافذة تأكيد الحذف */}
      {cardToDelete && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden p-8 text-center space-y-6 animate-zoom-in">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle size={40} />
              </div>
              <div className="space-y-2">
                 <h3 className="text-xl font-black dark:text-white leading-relaxed">
                    {isRtl ? "تأكيد حذف البطاقة" : "Confirm Card Deletion"}
                 </h3>
                 <p className="text-xs font-bold text-gray-400 leading-relaxed px-4">
                    {isRtl 
                      ? `هل أنت متأكد من حذف البطاقة "${cardToDelete.name}"؟ لا يمكن التراجع عن هذا الإجراء.` 
                      : `Are you sure you want to delete "${cardToDelete.name}"? This action cannot be undone.`}
                 </p>
              </div>
              <div className="flex flex-col gap-3 pt-4">
                 <button 
                   onClick={handleDeleteConfirm}
                   className="w-full py-5 bg-red-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-2"
                 >
                    <Trash2 size={18} />
                    {isRtl ? "نعم، حذف البطاقة" : "Yes, Delete Card"}
                 </button>
                 <button 
                   onClick={() => setCardToDelete(null)}
                   className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-400 rounded-2xl font-black text-[10px] uppercase hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                 >
                    <X size={16} />
                    {isRtl ? "إلغاء التراجع" : "Cancel"}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MyCards;
