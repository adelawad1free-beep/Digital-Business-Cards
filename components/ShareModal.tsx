
import React, { useState, useEffect } from 'react';
import { Language, CardData } from '../types';
import { generateShareUrl, shortenUrl } from '../utils/share';
import { Copy, Check, Share2, Download, X, Link, Loader2, Wand2 } from 'lucide-react';

interface ShareModalProps {
  data: CardData;
  lang: Language;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ data, lang, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [isShortening, setIsShortening] = useState(false);
  const [isShort, setIsShort] = useState(false);

  useEffect(() => {
    setCurrentUrl(generateShareUrl(data));
  }, [data]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShorten = async () => {
    setIsShortening(true);
    const short = await shortenUrl(currentUrl);
    setCurrentUrl(short);
    setIsShort(true);
    setIsShortening(false);
  };

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-fade-in-up border border-gray-100 dark:border-gray-800">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                  <Share2 size={20} />
               </div>
               <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                    {lang === 'ar' ? 'بطاقتك جاهزة!' : 'Card is Ready!'}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {lang === 'ar' ? 'انشر هويتك الرقمية الآن' : 'Publish your digital ID'}
                  </p>
               </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="p-5 bg-white rounded-[2.5rem] shadow-2xl border-[10px] border-gray-50 mb-4 transition-transform hover:scale-105">
              <img src={qrApiUrl} alt="QR Code" className="w-44 h-44" />
            </div>
            <p className="text-[10px] font-black text-gray-400 text-center uppercase tracking-[0.2em]">
              {lang === 'ar' ? 'امسح الرمز أو انسخ الرابط' : 'Scan code or copy link'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Link size={12} /> {lang === 'ar' ? 'الرابط الفريد' : 'Unique Link'}
                </label>
                {!isShort && (
                  <button 
                    onClick={handleShorten}
                    disabled={isShortening}
                    className="text-[10px] font-black text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {isShortening ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
                    {lang === 'ar' ? 'اختصار الرابط' : 'Shorten Link'}
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <input 
                  readOnly 
                  value={currentUrl} 
                  className="flex-1 bg-transparent border-none text-[11px] font-bold text-blue-600 dark:text-blue-400 px-3 outline-none truncate"
                />
                <button 
                  onClick={copyToClipboard}
                  className={`p-3 rounded-xl transition-all flex items-center gap-2 ${copied ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-200 shadow-sm'}`}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  <span className="text-[10px] font-black">{copied ? (lang === 'ar' ? 'تم!' : 'Copied!') : (lang === 'ar' ? 'نسخ' : 'Copy')}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(currentUrl)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-4 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 rounded-2xl font-black text-xs hover:bg-emerald-100 transition-all active:scale-95"
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
                className="flex items-center justify-center gap-2 py-4 bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 rounded-2xl font-black text-xs hover:bg-blue-100 transition-all active:scale-95"
              >
                <Download size={16} />
                {lang === 'ar' ? 'تحميل الرمز' : 'Get QR'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
