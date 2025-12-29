
import React, { useState, useEffect, useRef } from 'react';
import { CardData, Language, SocialLink } from '../types';
import { TRANSLATIONS, THEME_COLORS, SOCIAL_PLATFORMS, SAMPLE_DATA } from '../constants';
import { uploadImageToCloud } from '../services/uploadService';
import { generateProfessionalBio } from '../services/geminiService';
import CardPreview from '../components/CardPreview';
import SocialIcon from '../components/SocialIcon';
import { Save, Plus, X, Sun, Moon, Pipette, Camera, CheckCircle2, Loader2, Trash2, CloudUpload, AlertCircle, Sparkles } from 'lucide-react';

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
  const [uploading, setUploading] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);
  const [imageStatus, setImageStatus] = useState<'idle' | 'local' | 'cloud'>(initialData?.profileImage?.startsWith('http') ? 'cloud' : 'idle');

  useEffect(() => {
    if (!isDirty && !initialData) {
      setFormData(getDefaults(lang));
    }
  }, [lang, isDirty, initialData]);

  const [socialInput, setSocialInput] = useState({ platformId: SOCIAL_PLATFORMS[0].id, url: '' });

  const inputClasses = "w-full px-4 py-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1a1a1f] text-gray-900 dark:text-white focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all shadow-sm placeholder:text-gray-300 font-medium";
  const labelClasses = "block text-xs font-black text-gray-400 dark:text-gray-500 mb-2 px-1 uppercase tracking-widest";

  const handleChange = (field: keyof CardData, value: any) => {
    setIsDirty(true);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const processAndSaveImage = (file: File) => {
    setImageProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      handleChange('profileImage', event.target?.result as string);
      setImageProcessing(false);
      setImageStatus('local');
    };
    reader.readAsDataURL(file);
  };

  const handleCloudUpload = async () => {
    if (!formData.profileImage || !formData.profileImage.startsWith('data:')) return;
    setUploading(true);
    const cloudUrl = await uploadImageToCloud(formData.profileImage);
    if (cloudUrl) {
      handleChange('profileImage', cloudUrl);
      setImageStatus('cloud');
    }
    setUploading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processAndSaveImage(file);
  };

  const addSocialLink = () => {
    if (!socialInput.url) return;
    const platform = SOCIAL_PLATFORMS.find(p => p.id === socialInput.platformId);
    if (!platform) return;
    const newLink: SocialLink = { platform: platform.name, url: socialInput.url, platformId: platform.id };
    setIsDirty(true);
    setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, newLink] }));
    setSocialInput({ ...socialInput, url: '' });
  };

  // AI Logic to generate professional bio
  const handleGenerateAIBio = async () => {
    if (!formData.name || !formData.title) {
      alert(lang === 'ar' ? 'يرجى إدخال الاسم والمسمى الوظيفي أولاً' : 'Please fill Name and Title first');
      return;
    }
    setIsGeneratingBio(true);
    try {
      const generatedBio = await generateProfessionalBio(
        formData.name,
        formData.title,
        formData.company,
        formData.bio, // Use existing text as keywords
        lang
      );
      if (generatedBio) {
        handleChange('bio', generatedBio);
      }
    } finally {
      setIsGeneratingBio(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      <div className="flex-1 space-y-10">
        
        {/* مقدمة المحرر */}
        <div className="px-2">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
            {lang === 'ar' ? 'صمم بطاقتك' : 'Design Your Card'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-bold text-sm md:text-lg">
            {lang === 'en' ? 'Build a professional profile that stands out.' : 'أنشئ ملفاً شخصياً احترافياً يميزك عن الآخرين.'}
          </p>
        </div>

        <div className="bg-white dark:bg-[#121215] p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-gray-100 dark:border-gray-800 space-y-10">
          
          {/* الصورة والرفع */}
          <div className="bg-gray-50 dark:bg-gray-900/40 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="relative group">
                <div className={`w-36 h-36 md:w-48 md:h-48 rounded-[2rem] md:rounded-[3rem] overflow-hidden border-8 border-white dark:border-gray-800 shadow-2xl bg-gray-200 dark:bg-gray-700 transition-all ${imageProcessing || uploading ? 'opacity-50 blur-sm' : ''}`}>
                  {formData.profileImage ? (
                    <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                      <Camera size={48} />
                      <span className="text-[10px] font-black uppercase tracking-widest">No Image</span>
                    </div>
                  )}
                </div>
                
                {(imageProcessing || uploading) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 size={40} className="text-blue-600 animate-spin" />
                  </div>
                )}

                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-3 -right-3 p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all z-20"
                >
                  <Plus size={24} strokeWidth={3} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <label className={labelClasses}>{lang === 'ar' ? 'صورة الهوية الرقمية' : 'Digital ID Picture'}</label>
                
                {imageStatus === 'local' && (
                  <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border-2 border-dashed border-amber-200 dark:border-amber-900/30 rounded-3xl animate-pulse">
                    <p className="text-xs font-black text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
                      <AlertCircle size={16} />
                      {lang === 'ar' ? 'تنبيه: يجب تأمين الصورة للمشاركة' : 'Warning: Secure image to enable sharing'}
                    </p>
                    <button 
                      onClick={handleCloudUpload}
                      disabled={uploading}
                      className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-black hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                    >
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />}
                      {lang === 'ar' ? 'ضغط وتأمين الصورة الآن' : 'Compress & Secure Now'}
                    </button>
                  </div>
                )}

                {imageStatus === 'cloud' && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase">
                      {lang === 'ar' ? 'الصورة جاهزة للنشر' : 'Image ready for publishing'}
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <input 
                    type="url" 
                    value={formData.profileImage.startsWith('data:') ? '' : formData.profileImage} 
                    onChange={e => { handleChange('profileImage', e.target.value); setImageStatus('cloud'); }} 
                    className={inputClasses} 
                    placeholder={lang === 'ar' ? 'رابط مباشر لصورتك...' : 'Direct image link...'} 
                  />
                  {formData.profileImage && (
                    <button onClick={() => { handleChange('profileImage', ''); setImageStatus('idle'); }} className="p-4 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl hover:bg-red-100 transition-colors">
                      <Trash2 size={24} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* الحقول الأساسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div>
                  <label className={labelClasses}>{t('fullName')}</label>
                  <input type="text" value={formData.name} onChange={e => handleChange('name', e.target.value)} className={inputClasses} placeholder={t('placeholderName')} />
               </div>
               <div>
                  <label className={labelClasses}>{t('jobTitle')}</label>
                  <input type="text" value={formData.title} onChange={e => handleChange('title', e.target.value)} className={inputClasses} placeholder={t('placeholderTitle')} />
               </div>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <div className="flex items-center justify-between mb-2 px-1">
                  <label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{t('bio')}</label>
                  {/* AI Bio Generator Button */}
                  <button 
                    onClick={handleGenerateAIBio}
                    disabled={isGeneratingBio}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-blue-100 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isGeneratingBio ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {lang === 'ar' ? 'توليد ذكي' : 'AI Magic'}
                  </button>
                </div>
                <textarea 
                  value={formData.bio} 
                  onChange={e => handleChange('bio', e.target.value)} 
                  rows={4} 
                  className={`${inputClasses} resize-none`} 
                  placeholder={lang === 'ar' ? 'اكتب نبذة مختصرة عنك...' : 'Tell the world who you are...'}
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* معلومات الاتصال */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelClasses}>{t('phone')}</label>
              <input type="tel" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} className={inputClasses} placeholder="+966..." />
            </div>
            <div>
              <label className={labelClasses}>{t('whatsapp')}</label>
              <input type="tel" value={formData.whatsapp} onChange={e => handleChange('whatsapp', e.target.value)} className={inputClasses} placeholder="+966..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelClasses}>{t('email')}</label>
              <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} className={inputClasses} placeholder="your@email.com" />
            </div>
            <div>
              <label className={labelClasses}>{t('website')}</label>
              <input type="url" value={formData.website} onChange={e => handleChange('website', e.target.value)} className={inputClasses} placeholder="https://..." />
            </div>
          </div>

          {/* الموقع */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className={labelClasses}>{t('location')}</label>
              <input type="text" value={formData.location} onChange={e => handleChange('location', e.target.value)} className={inputClasses} placeholder={lang === 'ar' ? 'المدينة، الدولة' : 'City, Country'} />
            </div>
            <div>
              <label className={labelClasses}>{t('locationUrl')}</label>
              <input type="url" value={formData.locationUrl} onChange={e => handleChange('locationUrl', e.target.value)} className={inputClasses} placeholder="Google Maps link..." />
            </div>
          </div>

          <hr className="border-gray-100 dark:border-gray-800" />

          {/* روابط التواصل الاجتماعي */}
          <div className="space-y-6">
            <label className={labelClasses}>{t('socials')}</label>
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                value={socialInput.platformId} 
                onChange={e => setSocialInput({...socialInput, platformId: e.target.value})} 
                className="w-full sm:w-48 px-4 py-4 rounded-2xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a1f] font-black text-sm outline-none cursor-pointer"
              >
                {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input type="text" value={socialInput.url} onChange={e => setSocialInput({...socialInput, url: e.target.value})} className={`${inputClasses} flex-1`} placeholder="Link/Username..." />
              <button onClick={addSocialLink} className="py-4 px-8 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>
            <div className="flex flex-wrap gap-4">
              {formData.socialLinks.map((link, i) => (
                <div key={i} className="flex items-center bg-gray-50 dark:bg-gray-800 px-5 py-3 rounded-2xl text-xs font-black border border-gray-100 dark:border-gray-700 shadow-sm group">
                  <span className={isRtl ? 'ml-3' : 'mr-3'}><SocialIcon platformId={link.platformId} size={20} /></span>
                  <span className="truncate max-w-[120px]">{link.platform}</span>
                  <button onClick={() => setFormData({...formData, socialLinks: formData.socialLinks.filter((_, idx) => idx !== i)})} className="mr-3 text-red-500 opacity-60 group-hover:opacity-100 transition-opacity">
                    <X size={18} strokeWidth={3} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* التخصيص البصري */}
          <div className="pt-6 space-y-8">
             <div>
                <label className={labelClasses}>{t('theme')}</label>
                <div className="flex items-center gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar">
                  {THEME_COLORS.map(c => (
                    <button 
                      key={c} 
                      onClick={() => handleChange('themeColor', c)} 
                      className={`flex-shrink-0 w-14 h-14 rounded-3xl border-[6px] transition-all hover:scale-110 ${formData.themeColor.toLowerCase() === c.toLowerCase() ? 'border-blue-500 scale-110 shadow-2xl' : 'border-white dark:border-gray-800 shadow-sm'}`} 
                      style={{backgroundColor: c}} 
                    />
                  ))}
                  <button 
                    onClick={() => colorInputRef.current?.click()}
                    className={`flex-shrink-0 w-14 h-14 rounded-3xl border-[6px] flex items-center justify-center transition-all ${!THEME_COLORS.map(tc => tc.toLowerCase()).includes(formData.themeColor.toLowerCase()) ? 'border-blue-500 scale-110 shadow-2xl' : 'border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800'}`}
                    style={{ backgroundColor: !THEME_COLORS.map(tc => tc.toLowerCase()).includes(formData.themeColor.toLowerCase()) ? formData.themeColor : undefined }}
                  >
                    <Pipette size={24} className={!THEME_COLORS.map(tc => tc.toLowerCase()).includes(formData.themeColor.toLowerCase()) ? 'text-white' : 'text-gray-500'} />
                  </button>
                  <input ref={colorInputRef} type="color" value={formData.themeColor} onChange={(e) => handleChange('themeColor', e.target.value)} className="hidden" />
                </div>
             </div>

             <button 
                onClick={() => {
                  if (imageStatus === 'local') {
                    alert(lang === 'ar' ? 'يرجى تأمين الصورة أولاً قبل الحفظ لضمان ظهورها عند المشاركة.' : 'Please secure the photo first before saving to ensure it shows when shared.');
                    return;
                  }
                  onSave(formData);
                }} 
                className="w-full py-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-4 active:scale-[0.97]"
              >
                <Save size={28} strokeWidth={2.5} />
                <span>{t('save')}</span>
              </button>
          </div>
        </div>
      </div>

      {/* المعاينة الجانبية (فقط لسطح المكتب) */}
      <div className="hidden lg:block w-[420px] sticky top-12 self-start space-y-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div className="text-center">
          <span className="px-6 py-2 bg-white dark:bg-[#121215] text-gray-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border border-gray-100 dark:border-gray-800 shadow-sm">
            {t('preview')}
          </span>
        </div>
        <div className="bg-white dark:bg-[#121215] p-10 rounded-[4rem] border border-gray-100 dark:border-gray-800 shadow-2xl transition-transform hover:rotate-1">
          <CardPreview data={formData} lang={lang} />
        </div>
      </div>
    </div>
  );
};

export default Editor;
