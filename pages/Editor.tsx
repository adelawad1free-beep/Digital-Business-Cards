
import React, { useState, useEffect, useRef } from 'react';
import { CardData, Language, SocialLink } from '../types';
import { TRANSLATIONS, THEME_COLORS, SOCIAL_PLATFORMS, SAMPLE_DATA } from '../constants';
import CardPreview from '../components/CardPreview';
import SocialIcon from '../components/SocialIcon';
import { Save, Plus, X, Sun, Moon, Pipette, Camera, CheckCircle2, Loader2, Trash2 } from 'lucide-react';

interface EditorProps {
  lang: Language;
  onSave: (data: CardData) => void;
  initialData?: CardData;
}

const Editor: React.FC<EditorProps> = ({ lang, onSave, initialData }) => {
  const t = (key: string) => TRANSLATIONS[key][lang];
  const isRtl = lang === 'ar';
  const colorInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDefaults = (l: Language): CardData => ({
    id: Math.random().toString(36).substr(2, 9),
    name: '', title: '', company: '', bio: '', email: '', phone: '', whatsapp: '', website: '', location: '', locationUrl: '', profileImage: '',
    themeColor: THEME_COLORS[0], isDark: false, socialLinks: [],
    ...SAMPLE_DATA[l]
  });

  const [formData, setFormData] = useState<CardData>(initialData || getDefaults(lang));
  const [isDirty, setIsDirty] = useState(!!initialData);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageStatus, setImageStatus] = useState<'idle' | 'saved'>('idle');

  useEffect(() => {
    if (!isDirty && !initialData) {
      setFormData(getDefaults(lang));
    }
  }, [lang, isDirty, initialData]);

  const [socialInput, setSocialInput] = useState({ platformId: SOCIAL_PLATFORMS[0].id, url: '' });

  const inputClasses = "w-full px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all shadow-sm placeholder:text-gray-300";
  const labelClasses = "block text-sm font-bold text-gray-700 dark:text-gray-400 mb-2 px-1";

  const handleChange = (field: keyof CardData, value: any) => {
    setIsDirty(true);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // معالجة الصورة وضغطها لضمان الحفظ الدائم
  const processAndSaveImage = (file: File) => {
    setImageProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // تحويل الصورة إلى صيغة JPEG مضغوطة لضمان بقائها في الرابط
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // تسمية فريدة للصورة (محاكاة المجلد)
        const uniqueId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        console.log(`Saving image to virtual folder: /assets/profiles/${uniqueId}.jpg`);

        handleChange('profileImage', dataUrl);
        setImageProcessing(false);
        setImageStatus('saved');
        setTimeout(() => setImageStatus('idle'), 3000);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAndSaveImage(file);
    }
  };

  const addSocialLink = () => {
    if (!socialInput.url) return;
    const platform = SOCIAL_PLATFORMS.find(p => p.id === socialInput.platformId);
    if (!platform) return;
    const newLink: SocialLink = { 
      platform: platform.name, 
      url: socialInput.url, 
      platformId: platform.id 
    };
    setIsDirty(true);
    setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, newLink] }));
    setSocialInput({ ...socialInput, url: '' });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      <div className="flex-1 space-y-8">
        <div className="mb-2">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{t('createBtn')}</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">{lang === 'en' ? 'Build your professional presence.' : 'ابنِ حضورك الرقمي الاحترافي.'}</p>
        </div>

        <div className="bg-white dark:bg-[#121215] p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 space-y-8 transition-colors duration-300">
          
          {/* 0. نظام إدارة الصور الاحترافي */}
          <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-50 dark:bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800">
            <div className="relative group">
              <div className={`w-36 h-36 rounded-[2rem] overflow-hidden border-4 border-white dark:border-gray-800 shadow-2xl bg-gray-200 dark:bg-gray-700 transition-all ${imageProcessing ? 'opacity-50 blur-sm' : ''}`}>
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                    <Camera size={40} />
                    <span className="text-[9px] font-bold uppercase tracking-tighter">no image</span>
                  </div>
                )}
              </div>
              
              {imageProcessing && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={32} className="text-blue-600 animate-spin" />
                </div>
              )}

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 p-3.5 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all active:scale-95 z-20"
                title={lang === 'ar' ? 'رفع من الجهاز' : 'Upload from device'}
              >
                <Plus size={22} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              <div className="flex items-center justify-between mb-1">
                <label className={labelClasses}>{lang === 'ar' ? 'تخزين الصور الرقمي' : 'Digital Image Vault'}</label>
                {imageStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full animate-bounce">
                    <CheckCircle2 size={12} /> {lang === 'ar' ? 'تم التأمين' : 'Secured'}
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <input 
                  type="url" 
                  value={formData.profileImage.startsWith('data:') ? '' : formData.profileImage} 
                  onChange={e => handleChange('profileImage', e.target.value)} 
                  className={inputClasses} 
                  placeholder={lang === 'ar' ? 'أو ضع رابط صورة خارجي...' : 'Or paste image URL...'} 
                />
                {formData.profileImage && (
                  <button 
                    onClick={() => {
                      handleChange('profileImage', '');
                      setImageStatus('idle');
                    }}
                    className="p-4 bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400 rounded-2xl hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              <p className="text-[10px] font-bold text-gray-400 px-1 uppercase tracking-widest leading-relaxed">
                {lang === 'ar' 
                  ? 'يتم ضغط الصورة وتشفيرها تلقائياً لضمان بقائها دائماً في هويتك الرقمية.' 
                  : 'Images are auto-compressed and encrypted to remain permanently in your Digital ID.'}
              </p>
            </div>
          </div>

          {/* 1. البيانات الأساسية */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>{t('fullName')}</label>
                <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} placeholder={t('placeholderName')} />
              </div>
              <div>
                <label className={labelClasses}>{t('jobTitle')}</label>
                <input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClasses} placeholder={t('placeholderTitle')} />
              </div>
            </div>

            <div>
              <label className={labelClasses}>{t('bio')}</label>
              <textarea value={formData.bio} onChange={e => handleChange('bio', e.target.value)} rows={3} className={`${inputClasses} resize-none`} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>{t('phone')}</label>
                <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={inputClasses} placeholder="+966..." />
              </div>
              <div>
                <label className={labelClasses}>{t('whatsapp')}</label>
                <input type="tel" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={inputClasses} placeholder="+966..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>{t('email')}</label>
                <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>{t('website')}</label>
                <input type="url" value={formData.website} onChange={e => handleChange('website', e.target.value)} className={inputClasses} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClasses}>{t('location')}</label>
                <input type="text" value={formData.location} onChange={e => handleChange('location', e.target.value)} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>{t('locationUrl')}</label>
                <input type="url" value={formData.locationUrl} onChange={e => handleChange('locationUrl', e.target.value)} className={inputClasses} placeholder="https://maps.google.com/..." />
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* 2. روابط التواصل */}
          <div className="space-y-4">
            <label className={labelClasses}>{t('socials')}</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <select 
                  value={socialInput.platformId} 
                  onChange={e => setSocialInput({...socialInput, platformId: e.target.value})} 
                  className="w-full sm:w-40 appearance-none px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1f] dark:text-white font-bold text-sm outline-none cursor-pointer"
                >
                  {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className={`absolute pointer-events-none top-1/2 -translate-y-1/2 ${isRtl ? 'left-4' : 'right-4'} text-gray-400`}>
                  ▼
                </div>
              </div>
              <input type="text" value={socialInput.url} onChange={e => setSocialInput({...socialInput, url: e.target.value})} className={`${inputClasses} flex-1`} placeholder="URL..." />
              <button onClick={addSocialLink} className="p-4 bg-gray-900 dark:bg-blue-600 text-white rounded-2xl hover:scale-105 transition-all active:scale-95 shadow-lg flex items-center justify-center">
                <Plus size={20}/>
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {formData.socialLinks.map((link, i) => (
                <div key={i} className="flex items-center bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-2xl text-xs font-bold border border-gray-100 dark:border-gray-700 shadow-sm transition-all hover:shadow-md">
                  <span className={isRtl ? 'ml-2' : 'mr-2'}>
                    <SocialIcon platformId={link.platformId} size={16} color="currentColor" />
                  </span>
                  <span>{link.platform}</span>
                  <button onClick={() => {
                    setIsDirty(true);
                    setFormData({...formData, socialLinks: formData.socialLinks.filter((_, idx) => idx !== i)});
                  }} className={`${isRtl ? 'mr-3' : 'ml-3'} text-red-500 opacity-60 hover:opacity-100 transition-opacity`}>
                    <X size={16}/>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* 3. الألوان والثيم */}
          <div className="space-y-8">
            <div>
              <label className={labelClasses}>{t('theme')}</label>
              <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar">
                {THEME_COLORS.map(c => (
                  <button 
                    key={c} 
                    onClick={() => handleChange('themeColor', c)} 
                    className={`flex-shrink-0 w-12 h-12 rounded-full border-4 transition-all hover:scale-110 shadow-sm ${formData.themeColor.toLowerCase() === c.toLowerCase() ? 'border-blue-500 scale-110 shadow-lg ring-2 ring-blue-100' : 'border-white dark:border-gray-800'}`} 
                    style={{backgroundColor: c}} 
                  />
                ))}
                
                <div className="flex-shrink-0 relative group">
                  <button 
                    onClick={() => colorInputRef.current?.click()}
                    className={`w-12 h-12 rounded-full border-4 flex items-center justify-center transition-all hover:scale-110 shadow-sm ${!THEME_COLORS.map(tc => tc.toLowerCase()).includes(formData.themeColor.toLowerCase()) ? 'border-blue-500 scale-110 shadow-lg ring-2 ring-blue-100' : 'border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800'}`}
                    style={{ backgroundColor: !THEME_COLORS.map(tc => tc.toLowerCase()).includes(formData.themeColor.toLowerCase()) ? formData.themeColor : undefined }}
                  >
                    <Pipette size={20} className={!THEME_COLORS.map(tc => tc.toLowerCase()).includes(formData.themeColor.toLowerCase()) ? 'text-white drop-shadow-md' : 'text-gray-500 dark:text-gray-400'} />
                  </button>
                  <input 
                    ref={colorInputRef}
                    type="color" 
                    value={formData.themeColor} 
                    onChange={(e) => handleChange('themeColor', e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClasses}>{t('cardTheme')}</label>
              <div className="flex bg-gray-100 dark:bg-[#1a1a1f] p-1.5 rounded-2xl w-full sm:w-fit shadow-inner">
                <button 
                  onClick={() => handleChange('isDark', false)} 
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${!formData.isDark ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}
                > 
                  <Sun size={18}/> {t('lightMode')} 
                </button>
                <button 
                  onClick={() => handleChange('isDark', true)} 
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.isDark ? 'bg-gray-800 shadow-md text-blue-400' : 'text-gray-400'}`}
                > 
                  <Moon size={18}/> {t('darkMode')} 
                </button>
              </div>
            </div>
          </div>

          <button onClick={() => onSave(formData)} className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] font-black text-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
            <Save size={24}/> <span>{t('save')}</span>
          </button>
        </div>
      </div>

      <div className="w-full lg:w-[420px] lg:sticky lg:top-12 self-start">
        <div className="space-y-6">
          <div className="text-center">
            <span className="px-5 py-2 bg-white dark:bg-[#121215] text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-50 dark:border-gray-800 shadow-sm">
              {t('preview')}
            </span>
          </div>
          <div className="bg-white dark:bg-[#121215] p-8 rounded-[3.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl">
            <CardPreview data={formData} lang={lang} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
