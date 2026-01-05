
import React, { useState, useEffect } from 'react';
import { Language, CardData, TemplateConfig, CustomTemplate } from '../types';
import { generateShareUrl } from '../utils/share';
import { Copy, Check, Download, X, Send, Hash, ImageIcon, Loader2, UserPlus, Smartphone, ArrowUpRight, Compass } from 'lucide-react';
import CardPreview from './CardPreview';
import { getAllTemplates } from '../services/firebase';
import { downloadVCard } from '../utils/vcard';
import { TRANSLATIONS } from '../constants';

interface ShareModalProps {
  data: CardData;
  lang: Language;
  onClose: () => void;
  isNewSave?: boolean; 
}

const ShareModal: React.FC<ShareModalProps> = ({ data, lang, onClose, isNewSave }) => {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [showShortcutGuide, setShowShortcutGuide] = useState(false);
  const [customConfig, setCustomConfig] = useState<TemplateConfig | undefined>(undefined);
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;

  // التعرف التلقائي على النظام (iOS / Android)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

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
    } finally {
      setIsCapturing(false);
    }
  };

  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&bgcolor=ffffff&color=2563eb&margin=2`;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="fixed top-0 left-0 -translate-x-[2000px] pointer-events-none" style={{ width: '400px' }}>
          <div id="share-card-capture-area" className="bg-white dark:bg-black overflow-hidden" style={{ width: '400px', minHeight: '700px' }}>
             <CardPreview data={data} lang={lang} customConfig={customConfig} hideSaveButton={true} isFullFrame={true} />
          </div>
      </div>

      <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative animate-zoom-in">
        
        {showShortcutGuide ? (
          <div className="p-8 space-y-6 animate-fade-in">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter">{t('shortcutGuideTitle')}</h3>
                <button onClick={() => setShowShortcutGuide(false)} className="p-2 text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl"><X size={20}/></button>
             </div>
             
             <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-900/20 space-y-6 text-center">
                <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm text-blue-600">
                   {isIOS ? <Compass size={32} /> : <Smartphone size={32} />}
                </div>
                <p className="text-xs font-bold leading-relaxed dark:text-gray-300">
                   {isIOS ? t('iosGuide') : t('androidGuide')}
                </p>
                <div className="flex items-center justify-center gap-2 text-blue-600 animate-pulse">
                   <ArrowUpRight size={20} />
                   <span className="text-[10px] font-black uppercase tracking-widest">{isRtl ? 'اتبع الأسهم في المتصفح' : 'Follow browser arrows'}</span>
                </div>
             </div>

             <button 
               onClick={() => { window.open(url, '_blank'); setShowShortcutGuide(false); }}
               className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95"
             >
                <Send size={18} />
                {isRtl ? 'فتح الرابط للبدء' : 'Open Link to Start'}
             </button>
             
             <button onClick={() => setShowShortcutGuide(false)} className="w-full text-center text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-500 transition-colors">
                {isRtl ? 'رجوع لخيارات المشاركة' : 'Back to share options'}
             </button>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
               <div className="flex flex-col">
                  {isNewSave && (
                     <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest mb-2 w-fit">
                        <Check size={10} />
                        {isRtl ? 'تم الحفظ بنجاح' : 'Saved Successfully'}
                     </div>
                  )}
                  <h3 className="text-2xl font-black dark:text-white">
                    {isRtl ? 'مشاركة هويتك' : 'Share Identity'}
                  </h3>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">ID: {data.id}</span>
               </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="relative group">
                <div className="absolute -inset-4 bg-blue-500/10 rounded-[3rem] blur-xl group-hover:bg-blue-500/20 transition-all"></div>
                <div className="relative p-5 bg-white rounded-[2.5rem] shadow-inner border border-gray-50">
                  <img src={qrApiUrl} alt="QR Code" className="w-32 h-32" crossOrigin="anonymous" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => downloadVCard(data)}
                className="w-full py-5 bg-blue-600 text-white rounded-[1.8rem] font-black text-xs uppercase flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <UserPlus size={18} />
                {t('saveContact')}
              </button>

              <button 
                onClick={handleImageShare}
                disabled={isCapturing}
                className="w-full py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/10 hover:brightness-110 active:scale-95 transition-all disabled:opacity-70"
              >
                {isCapturing ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                {isRtl ? 'مشاركة كصورة (واتساب)' : 'Share as Image'}
              </button>

              <div className="flex gap-2">
                <button 
                  onClick={() => setShowShortcutGuide(true)}
                  className="flex-1 py-4 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-[1.5rem] font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all border border-indigo-100 dark:border-indigo-800/30"
                >
                  <Smartphone size={14} />
                  {t('addShortcut')}
                </button>
                <button 
                  onClick={handleNativeShare}
                  className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-[1.5rem] font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                >
                  <Send size={14} />
                  {isRtl ? 'رابط مباشر' : 'Direct Link'}
                </button>
              </div>

              <button 
                onClick={copyToClipboard}
                className={`w-full py-3.5 rounded-[1.5rem] font-black text-[10px] uppercase flex items-center justify-center gap-2 transition-all border ${copied ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-100 dark:border-gray-700'}`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? (isRtl ? 'تم النسخ بنجاح' : 'Copied!') : (isRtl ? 'نسخ رابط البطاقة' : 'Copy Card URL')}
              </button>
            </div>
            
            <p className="text-[9px] font-bold text-gray-400 text-center mt-6 uppercase tracking-[0.2em] opacity-60">
               {isRtl ? 'هويتك الرقمية جاهزة للمشاركة' : 'Your identity is ready to share'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
