
import React, { useState, useEffect } from 'react';
import { Language, CardData } from '../types';
import { generateShareUrl } from '../utils/share';
import { Copy, Check, Download, X, Send, Hash, Info, UserCheck } from 'lucide-react';

interface ShareModalProps {
  data: CardData;
  lang: Language;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ data, lang, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    setUrl(generateShareUrl(data));
  }, [data]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // توليد نص احترافي للمشاركة يبدأ باسم العميل
  const getProfessionalText = () => {
    const name = data.name || (lang === 'ar' ? 'بطاقة رقمية' : 'Digital ID');
    const title = data.title ? `(${data.title})` : '';
    
    if (lang === 'ar') {
      return `*${name}* ${title}\nتفضل بزيارة بطاقتي المهنية الرقمية وتواصل معي مباشرة عبر الرابط:\n\n${url}`;
    }
    return `*${name}* ${title}\nView my professional digital identity and connect with me here:\n\n${url}`;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.name,
          text: getProfessionalText(),
          url: url,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=2563eb&margin=2`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
             <div className="flex flex-col">
                <h3 className="text-xl font-black dark:text-white">
                  {lang === 'ar' ? 'تم الحفظ بنجاح!' : 'Saved Successfully!'}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                   <Hash size={12} className="text-blue-600" />
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: {data.id}</span>
                </div>
             </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 mb-8">
            <div className="relative group">
              <div className="absolute -inset-4 bg-blue-500/10 rounded-[3rem] blur-xl"></div>
              <div className="relative p-6 bg-white rounded-[2.5rem] shadow-inner border border-gray-50">
                <img src={qrApiUrl} alt="QR Code" className="w-36 h-36" />
              </div>
            </div>
            <div className="text-center px-4">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                 {lang === 'ar' ? 'امسح الكود للمشاركة السريعة' : 'Scan for instant share'}
               </p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleNativeShare}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-600/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Send size={18} />
              {lang === 'ar' ? 'مشاركة عبر واتساب' : 'Share via WhatsApp'}
            </button>

            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs transition-all border ${copied ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:bg-gray-100'}`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'Copy Link' : 'Copy Link')}
              </button>
              
              <button 
                onClick={() => {
                   const link = document.createElement('a');
                   link.href = qrApiUrl;
                   link.download = `qr-${data.id}.png`;
                   link.click();
                }}
                className="px-6 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-100"
              >
                <Download size={20} />
              </button>
            </div>
          </div>
          
          <div className="mt-8 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] flex flex-col gap-3">
             <div className="flex gap-2 items-center">
                <UserCheck size={16} className="text-blue-600" />
                <span className="text-[10px] font-black uppercase text-blue-800 dark:text-blue-400">{lang === 'ar' ? 'نصيحة' : 'Tip'}</span>
             </div>
             <p className="text-[10px] leading-relaxed text-blue-800/80 dark:text-blue-300/80 font-bold">
                {lang === 'ar' 
                  ? 'عند مشاركة الرابط، سيظهر اسمك وصورتك الشخصية كمعاينة في المحادثة بدلاً من اسم الموقع لزيادة الثقة والاحترافية.' 
                  : 'When sharing, your name and profile picture will appear as a preview instead of the site name for better branding.'}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
