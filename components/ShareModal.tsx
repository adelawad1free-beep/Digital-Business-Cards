
import React, { useState } from 'react';
import { Language, CardData } from '../types';
import { TRANSLATIONS } from '../constants';
import { generateShareUrl } from '../utils/share';
import { Copy, Check, Share2, Download, X, QrCode } from 'lucide-react';

interface ShareModalProps {
  data: CardData;
  lang: Language;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ data, lang, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = generateShareUrl(data);
  const isRtl = lang === 'ar';
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-800">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Share2 size={24} className="text-blue-600" />
              {lang === 'ar' ? 'تم النشر بنجاح!' : 'Published Successfully!'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="p-4 bg-white rounded-3xl shadow-lg border-4 border-gray-50 mb-4 transition-transform hover:scale-105">
              <img src={qrApiUrl} alt="QR Code" className="w-40 h-40" />
            </div>
            <p className="text-sm font-bold text-gray-500 text-center">
              {lang === 'ar' ? 'امسح الرمز للمشاركة الفورية' : 'Scan to share instantly'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <label className="block text-xs font-black text-gray-400 uppercase mb-2 px-1 tracking-widest">
                {lang === 'ar' ? 'رابط بطاقتك الفريد' : 'Your Unique Card Link'}
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <input 
                  readOnly 
                  value={shareUrl} 
                  className="flex-1 bg-transparent border-none text-xs font-bold text-blue-600 dark:text-blue-400 px-3 outline-none truncate"
                />
                <button 
                  onClick={copyToClipboard}
                  className={`p-3 rounded-xl transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 shadow-sm'}`}
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                  <span className="text-xs font-bold">{copied ? (lang === 'ar' ? 'تم!' : 'Copied!') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(shareUrl)}`} 
                target="_blank" 
                className="flex items-center justify-center gap-2 py-3.5 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-colors"
              >
                {lang === 'ar' ? 'واتساب' : 'WhatsApp'}
              </a>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrApiUrl;
                  link.download = `qr-code-${data.name}.png`;
                  link.click();
                }}
                className="flex items-center justify-center gap-2 py-3.5 bg-blue-50 text-blue-600 rounded-2xl font-bold text-sm hover:bg-blue-100 transition-colors"
              >
                <Download size={16} />
                {lang === 'ar' ? 'تحميل QR' : 'Download QR'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
