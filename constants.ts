
import { TranslationStrings, CardData, Language } from './types';

export const LANGUAGES_CONFIG: Record<Language, { name: string, native: string, dir: 'rtl' | 'ltr', flag: string }> = {
  ar: { name: 'Arabic', native: 'العربية', dir: 'rtl', flag: '🇸🇦' },
  en: { name: 'English', native: 'English', dir: 'ltr', flag: '🇺🇸' },
  es: { name: 'Spanish', native: 'Español', dir: 'ltr', flag: '🇪🇸' },
  fr: { name: 'French', native: 'Français', dir: 'ltr', flag: '🇫🇷' },
  de: { name: 'German', native: 'Deutsch', dir: 'ltr', flag: '🇩🇪' },
  zh: { name: 'Chinese', native: '中文', dir: 'ltr', flag: '🇨🇳' },
  ja: { name: 'Japanese', native: '日本語', dir: 'ltr', flag: '🇯🇵' },
  pt: { name: 'Portuguese', native: 'Português', dir: 'ltr', flag: '🇵🇹' },
  ru: { name: 'Russian', native: 'Русский', dir: 'ltr', flag: '🇷🇺' },
  hi: { name: 'Hindi', native: 'हिन्दी', dir: 'ltr', flag: '🇮🇳' },
};

export const TEMPLATES = [
  { id: 'classic', nameAr: 'مودرن كلاسيك', nameEn: 'Modern Classic', descAr: 'توازن مثالي وأناقة هادئة', descEn: 'Perfect balance and quiet elegance' },
  { id: 'bento', nameAr: 'بينتو جريد', nameEn: 'Bento Grid', descAr: 'تنظيم شبكي للمحترفين التقنيين', descEn: 'Structured grid for tech pros' },
  { id: 'split', nameAr: 'دايناميك سبليت', nameEn: 'Dynamic Split', descAr: 'جريء، عصري، وملفت للأنظار', descEn: 'Bold, modern, and eye-catching' },
  { id: 'glass', nameAr: 'فيوتشر جلاس', nameEn: 'Future Glass', descAr: 'تأثيرات زجاجية مستقبلية شفافة', descEn: 'Futuristic frosted glass effects' },
  { id: 'minimal', nameAr: 'سويس مينيمال', nameEn: 'Swiss Minimal', descAr: 'الفخامة في البساطة المطلقة', descEn: 'Luxury in absolute simplicity' },
  { id: 'neo', nameAr: 'نيو بروتال', nameEn: 'Neo Brutal', descAr: 'تصميم جريء للأرواح المبدعة', descEn: 'Bold design for creative souls' },
  { id: 'mosaic', nameAr: 'سوشيال هب', nameEn: 'Social Hub', descAr: 'تركيز مكثف على الروابط والانتشار', descEn: 'Intense focus on social reach' },
  { id: 'zen', nameAr: 'زين فوكس', nameEn: 'Zen Focus', descAr: 'هدوء بصري وتركيز على الجوهر', descEn: 'Visual calm and essence focus' }
];

export const TRANSLATIONS: TranslationStrings = {
  appName: { en: 'NextID', ar: 'هويتي' },
  home: { en: 'Home', ar: 'الرئيسية' },
  myCards: { en: 'My Cards', ar: 'بطاقاتي' },
  admin: { en: 'Admin', ar: 'الإدارة' },
  account: { en: 'Account', ar: 'الحساب' },
  login: { en: 'Login', ar: 'دخول' },
  logout: { en: 'Logout', ar: 'خروج' },
  saveChanges: { en: 'Save Changes', ar: 'حفظ التعديلات' },
  fullName: { en: 'Full Name', ar: 'الاسم الكامل' },
  placeholderName: { en: 'Enter your name', ar: 'أدخل اسمك الكامل' },
  theme: { en: 'Theme', ar: 'السمة' },
  saveContact: { en: 'Save Contact', ar: 'حفظ جهة الاتصال' },
  call: { en: 'Call', ar: 'اتصال' },
  whatsappBtn: { en: 'WhatsApp', ar: 'واتساب' },
  heroBadge: { en: 'Create your digital identity', ar: 'أنشئ هويتك الرقمية الآن' },
  heroTitle: { en: 'Professional Digital Business Cards', ar: 'بطاقات أعمال رقمية احترافية' },
  heroDesc: { en: 'The easiest way to share your professional profile with the world.', ar: 'الطريقة الأسهل لمشاركة ملفك المهني مع العالم.' },
  createBtn: { en: 'Create Now', ar: 'ابدأ الآن' },
  template: { en: 'Layout Template', ar: 'قالب التوزيع', es: 'Plantilla', fr: 'Modèle' },
  selectTemplate: { en: 'Select Style', ar: 'اختر النمط الهيكلي', es: 'Seleccionar estilo' },
  bio: { en: 'Professional Bio', ar: 'النبذة المهنية' },
  email: { en: 'Email Address', ar: 'البريد الإلكتروني' },
  phone: { en: 'Phone Number', ar: 'رقم الهاتف' },
  whatsapp: { en: 'WhatsApp', ar: 'رقم الواتساب' },
  website: { en: 'Website URL', ar: 'رابط الموقع' },
  socials: { en: 'Social Links', ar: 'روابط التواصل' },
  jobTitle: { en: 'Job Title', ar: 'المسمى الوظيفي' },
  company: { en: 'Company', ar: 'الشركة' }
};

export const THEME_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#0f172a', '#C5A059'];
export const THEME_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
  'linear-gradient(135deg, #c3cfe2 0%, #c3cfe2 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
];

export const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'x', name: 'X' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'whatsapp_social', name: 'WhatsApp' },
  { id: 'telegram', name: 'Telegram' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'github', name: 'GitHub' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'threads', name: 'Threads' },
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'behance', name: 'Behance' },
  { id: 'dribbble', name: 'Dribbble' },
  { id: 'pinterest', name: 'Pinterest' },
  { id: 'discord', name: 'Discord' },
  { id: 'twitch', name: 'Twitch' },
  { id: 'spotify', name: 'Spotify' }
];

export const SAMPLE_DATA: Record<string, Partial<CardData>> = {
  ar: { 
    name: 'عبدالله محمد', 
    title: 'مستشار تطوير أعمال', 
    company: 'هويتي التقنية', 
    bio: 'خبير في استراتيجيات التحول الرقمي مع خبرة تزيد عن 10 سنوات في بناء الهوية الرقمية للشركات والأفراد. أسعى دائماً لتقديم حلول مبتكرة تجمع بين الجمالية والوظيفة.', 
    email: 'abdullah@example.com',
    phone: '+966500000000',
    whatsapp: '966500000000',
    website: 'www.myidentity.sa',
    templateId: 'classic', 
    themeType: 'gradient', 
    themeGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400',
    isDark: false, 
    socialLinks: [
      { platformId: 'linkedin', platform: 'LinkedIn', url: 'https://linkedin.com' },
      { platformId: 'x', platform: 'X', url: 'https://x.com' },
      { platformId: 'instagram', platform: 'Instagram', url: 'https://instagram.com' }
    ] 
  },
  en: { 
    name: 'Alexander Smith', 
    title: 'Senior Solutions Architect', 
    company: 'NextID Global', 
    bio: 'Passionate about crafting seamless digital experiences and architectural solutions. Focused on driving innovation through technology and design thinking for modern businesses.', 
    email: 'alex@example.com',
    phone: '+1 555 123 4567',
    whatsapp: '15551234567',
    website: 'www.nextid.com',
    templateId: 'classic', 
    themeType: 'gradient', 
    themeGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400',
    isDark: false, 
    socialLinks: [
      { platformId: 'linkedin', platform: 'LinkedIn', url: 'https://linkedin.com' },
      { platformId: 'x', platform: 'X', url: 'https://x.com' },
      { platformId: 'github', platform: 'GitHub', url: 'https://github.com' }
    ] 
  }
};
