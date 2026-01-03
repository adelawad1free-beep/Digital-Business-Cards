
import React, { useState, useEffect, useRef } from 'react';
import { Language, CardData, TemplateConfig, CustomTemplate } from '../types';
import { generateShareUrl } from '../utils/share';
import { Copy, Check, Download, X, Send, Hash, UserCheck, ImageIcon, Loader2 } from 'lucide-react';
import CardPreview from './CardPreview';
import { getAllTemplates } from '../services/firebase';

interface ShareModalProps {
  data: CardData;
  lang: Language;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ data, lang, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [customConfig, setCustomConfig] = useState<TemplateConfig | undefined>(undefined);

  useEffect(() => {
    setUrl(generateShareUrl(data));
    getAllTemplates().then(templates => {
      const tmpl = (templates as CustomTemplate[]).find(t => t.id === data.templateId);
      if (tmpl) setCustomConfig(tmpl.config);
    });
  }, [data]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  const handleImageShare = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      const captureTarget = document.getElementById('share-card-capture-area');
      if (!captureTarget) throw new Error("Capture target not found");

      // @ts-ignore
      const canvas = await window.html2canvas(captureTarget, {
        useCORS: true, 
        allowTaint: false,
        scale: 2, 
        backgroundColor: data.isDark ? '#0a0a0c' : '#ffffff',
        logging: false,
        width: 400,
        height: 700
      });

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      
      if (blob && navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'card.jpg', { type: 'image/jpeg' })] })) {
        const file = new File([blob], `${data.id}.jpg`, { type: 'image/jpeg' });
        await navigator.share({
          files: [file],
          title: data.name,
          text: getProfessionalText()
        });
      } else {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg', 0.95);
        link.download = `identity-${data.id}.jpg`;
        link.click();
      }
    } catch (err) {
      console.error("Capture Error:", err);
      alert(lang === 'ar' ? "يرجى المحاولة مرة أخرى" : "Please try again");
    } finally {
      setIsCapturing(false);
    }
  };

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=2563eb&margin=2`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      {/* منطقة الالتقاط المخفية */}
      <div className="fixed top-0 left-0 -translate-x-[2000px] pointer-events-none" style={{ width: '400px' }}>
          <div id="share-card-capture-area" className="bg-white dark:bg-black overflow-hidden" style={{ width: '400px', minHeight: '700px' }}>
             <CardPreview data={data} lang={lang} customConfig={customConfig} hideSaveButton={true} isFullFrame={true} isCapturing={true} />
          </div>
      </div>

      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
             <div className="flex flex-col">
                <h3 className="text-xl font-black dark:text-white">
                  {lang === 'ar' ? 'مشاركة البطاقة' : 'Share Card'}
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
                <img src={qrApiUrl} alt="QR Code" className="w-36 h-36" crossOrigin="anonymous" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleImageShare}
              disabled={isCapturing}
              className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70"
            >
              {isCapturing ? <Loader2 size={18} className="animate-spin" /> : <ImageIcon size={18} />}
              {lang === 'ar' ? (isCapturing ? 'جاري التحويل...' : 'مشاركة كصورة (واتساب)') : (isCapturing ? 'Converting...' : 'Share as Image')}
            </button>

            <button 
              onClick={handleNativeShare}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-3 shadow-lg shadow-blue-600/10 hover:scale-[1.01] transition-all"
            >
              <Send size={16} />
              {lang === 'ar' ? 'مشاركة رابط البطاقة' : 'Share Link'}
            </button>

            <div className="flex gap-2">
              <button 
                onClick={copyToClipboard}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-xs transition-all border ${copied ? 'bg-emerald-50 border-emerald-500 text-white' : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-100 dark:border-gray-700 hover:bg-gray-100'}`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? (lang === 'ar' ? 'تم النسخ' : 'Copied') : (lang === 'ar' ? 'نسخ الرابط' : 'Copy Link')}
              </button>
              
              <button 
                onClick={() => {
                   const link = document.createElement('a');
                   link.href = qrApiUrl;
                   link.download = `qr-${data.id}.png`;
                   link.click();
                }}
                className="px-6 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-100"
                title={lang === 'ar' ? 'تحميل QR' : 'Download QR'}
              >
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
