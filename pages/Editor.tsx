
import React, { useState } from 'react';
import { CardData, Language, SocialLink } from '../types';
import { TRANSLATIONS, THEME_COLORS, SOCIAL_PLATFORMS } from '../constants';
import { generateProfessionalBio } from '../services/geminiService';
import CardPreview from '../components/CardPreview';
import { Wand2, Save, Plus, X, Sun, Moon } from 'lucide-react';

interface EditorProps {
  lang: Language;
  onSave: (data: CardData) => void;
  onBack: () => void;
  initialData?: CardData;
  isStandalone?: boolean;
}

const Editor: React.FC<EditorProps> = ({ lang, onSave, onBack, initialData, isStandalone }) => {
  const t = (key: string) => TRANSLATIONS[key][lang];
  const isRtl = lang === 'ar';

  const [formData, setFormData] = useState<CardData>(initialData || {
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    title: '',
    company: '',
    bio: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    profileImage: '',
    themeColor: THEME_COLORS[0],
    isDark: false, // ثيم البطاقة الافتراضي نهاري
    socialLinks: []
  });

  const [aiLoading, setAiLoading] = useState(false);
  const [socialInput, setSocialInput] = useState({ platform: SOCIAL_PLATFORMS[0].id, url: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMagicBio = async () => {
    if (!formData.name || !formData.title) {
      alert(lang === 'en' ? 'Please fill in Name and Title first.' : 'يرجى تعبئة الاسم والمسمى الوظيفي أولاً.');
      return;
    }
    setAiLoading(true);
    const keywords = prompt(lang === 'en' ? 'Add some keywords (e.g., creative, leader, coffee lover)' : 'أضف بعض الكلمات المفتاحية (مثلاً: مبدع، قائد، محب للقهوة)');
    const bio = await generateProfessionalBio(formData.name, formData.title, formData.company, keywords || '', lang);
    if (bio) setFormData(prev => ({ ...prev, bio }));
    setAiLoading(false);
  };

  const addSocialLink = () => {
    if (!socialInput.url) return;
    const platform = SOCIAL_PLATFORMS.find(p => p.id === socialInput.platform);
    if (!platform) return;

    const newLink: SocialLink = {
      platform: platform.name,
      url: socialInput.url,
      icon: platform.icon
    };
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newLink]
    }));
    setSocialInput({ ...socialInput, url: '' });
  };

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  // كلاسات الحقول - تم التأكيد على اللون الأبيض في الوضع النهاري
  const inputClasses = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-all shadow-sm";
  const labelClasses = "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2";

  return (
    <div className={`px-4 transition-colors duration-300 ${isRtl ? 'rtl' : 'ltr'}`}>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 items-start">
        
        {/* لوحة المحرر */}
        <div className="flex-1 w-full space-y-6">
          <div className="mb-6">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">{t('createBtn')}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {lang === 'en' ? 'Build your professional digital presence in minutes.' : 'ابنِ حضورك الرقمي المهني في دقائق معدودة.'}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2.5rem] shadow-xl dark:shadow-2xl border border-gray-100 dark:border-gray-800 space-y-7 transition-all">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>{t('fullName')}</label>
                <input 
                  type="text" name="name" value={formData.name} onChange={handleInputChange}
                  className={inputClasses}
                  placeholder={t('placeholderName')}
                />
              </div>
              <div>
                <label className={labelClasses}>{t('jobTitle')}</label>
                <input 
                  type="text" name="title" value={formData.title} onChange={handleInputChange}
                  className={inputClasses}
                  placeholder={t('placeholderTitle')}
                />
              </div>
            </div>

            <div>
              <label className={labelClasses}>{t('company')}</label>
              <input 
                type="text" name="company" value={formData.company} onChange={handleInputChange}
                className={inputClasses}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={labelClasses}>{t('bio')}</label>
                <button 
                  onClick={handleMagicBio}
                  disabled={aiLoading}
                  className="text-xs flex items-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all disabled:opacity-50 border border-blue-100 dark:border-blue-900/50 shadow-sm"
                >
                  <Wand2 size={12} className={isRtl ? 'ml-1.5' : 'mr-1.5'} />
                  {aiLoading ? t('aiLoading') : t('magicBio')}
                </button>
              </div>
              <textarea 
                name="bio" value={formData.bio} onChange={handleInputChange} rows={3}
                className={`${inputClasses} resize-none`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>{t('email')}</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>{t('phone')}</label>
                <input 
                  type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClasses}>{t('website')}</label>
                <input 
                  type="url" name="website" value={formData.website} onChange={handleInputChange}
                  className={inputClasses}
                />
              </div>
              <div>
                <label className={labelClasses}>{t('location')}</label>
                <input 
                  type="text" name="location" value={formData.location} onChange={handleInputChange}
                  className={inputClasses}
                />
              </div>
            </div>

            {/* خيارات ثيم الموقع وثيم البطاقة */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div>
                <label className={labelClasses}>{t('theme')}</label>
                <div className="flex flex-wrap gap-4">
                  {THEME_COLORS.map(color => (
                    <button 
                      key={color}
                      onClick={() => setFormData(prev => ({ ...prev, themeColor: color }))}
                      className={`w-10 h-10 rounded-2xl border-4 transition-all hover:scale-110 active:scale-90 ${formData.themeColor === color ? 'border-white dark:border-gray-900 ring-4 ring-blue-100 dark:ring-blue-900/30 shadow-lg' : 'border-transparent shadow-sm'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <label className={labelClasses}>{t('cardTheme')}</label>
                <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl w-fit">
                  <button 
                    onClick={() => setFormData(prev => ({ ...prev, isDark: false }))}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all font-bold text-sm ${!formData.isDark ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500'}`}
                  >
                    <Sun size={16} />
                    {t('lightMode')}
                  </button>
                  <button 
                    onClick={() => setFormData(prev => ({ ...prev, isDark: true }))}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl transition-all font-bold text-sm ${formData.isDark ? 'bg-gray-900 text-blue-400 shadow-sm' : 'text-gray-500'}`}
                  >
                    <Moon size={16} />
                    {t('darkMode')}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className={labelClasses}>{t('socials')}</label>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <select 
                  value={socialInput.platform}
                  onChange={(e) => setSocialInput({ ...socialInput, platform: e.target.value })}
                  className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-bold shadow-sm"
                >
                  {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <input 
                  type="text"
                  value={socialInput.url}
                  onChange={(e) => setSocialInput({ ...socialInput, url: e.target.value })}
                  className={`${inputClasses} flex-1`}
                  placeholder="https://..."
                />
                <button 
                  onClick={addSocialLink}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[50px]"
                >
                  <Plus size={24} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.socialLinks.map((link, idx) => (
                  <div key={idx} className="flex items-center bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-xl text-sm font-bold border border-gray-100 dark:border-gray-700 group hover:border-blue-300 dark:hover:border-blue-800 transition-all shadow-sm">
                    <span className={isRtl ? 'ml-2' : 'mr-2'}>{link.icon}</span>
                    <span className="max-w-[120px] truncate">{link.platform}</span>
                    <button onClick={() => removeSocialLink(idx)} className={`${isRtl ? 'mr-3' : 'ml-3'} text-gray-400 hover:text-red-500 transition-colors opacity-60 group-hover:opacity-100`}>
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => onSave(formData)}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-blue-500/20 active:scale-[0.98]"
            >
              <Save size={24} className={isRtl ? 'ml-3' : 'mr-3'} />
              <span>{t('save')}</span>
            </button>
          </div>
        </div>

        {/* لوحة المعاينة - تم جعلها بيضاء بالكامل في الوضع النهاري */}
        <div className="w-full lg:w-[420px] lg:sticky lg:top-28">
          <div className="space-y-6">
            <div className="text-center">
              <span className="px-5 py-2 bg-white dark:bg-gray-900 text-gray-400 dark:text-gray-500 rounded-full text-xs font-black uppercase tracking-widest border border-gray-100 dark:border-gray-800 shadow-sm">
                {t('preview')}
              </span>
            </div>
            <div className="bg-white dark:bg-gray-950 p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-xl transition-all duration-300">
              <CardPreview data={formData} lang={lang} />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Editor;
