
import { TranslationStrings, CardData } from './types';

export const TRANSLATIONS: TranslationStrings = {
  appName: { en: 'ConnectFlow', ar: 'كونكت فلو' },
  tagline: { en: 'Share your professional identity instantly.', ar: 'شارك هويتك المهنية بلحظة.' },
  createBtn: { en: 'Create Card', ar: 'إنشاء بطاقة' },
  preview: { en: 'Preview', ar: 'معاينة' },
  edit: { en: 'Edit Card', ar: 'تعديل البطاقة' },
  save: { en: 'Save & Publish', ar: 'حفظ ونشر' },
  fullName: { en: 'Full Name', ar: 'الاسم الكامل' },
  jobTitle: { en: 'Job Title', ar: 'المسمى الوظيفي' },
  company: { en: 'Company', ar: 'الشركة' },
  bio: { en: 'Short Bio', ar: 'نبذة قصيرة' },
  email: { en: 'Email Address', ar: 'البريد الإلكتروني' },
  phone: { en: 'Phone Number', ar: 'رقم الهاتف' },
  whatsapp: { en: 'WhatsApp', ar: 'واتساب' },
  website: { en: 'Website', ar: 'الموقع الإلكتروني' },
  location: { en: 'Address', ar: 'العنوان' },
  locationUrl: { en: 'Google Maps Link', ar: 'رابط خرائط Google' },
  socials: { en: 'Social Links', ar: 'روابط التواصل' },
  theme: { en: 'Theme Color', ar: 'لون السمة' },
  cardTheme: { en: 'Card Theme', ar: 'ثيم البطاقة' },
  lightMode: { en: 'Light', ar: 'نهاري' },
  darkMode: { en: 'Dark', ar: 'ليلي' },
  magicBio: { en: 'Magic Bio (AI)', ar: 'النبذة الذكية (ذكاء اصطناعي)' },
  share: { en: 'Share Profile', ar: 'مشاركة الملف' },
  downloadQR: { en: 'Download QR Code', ar: 'تحميل رمز QR' },
  placeholderName: { en: 'John Doe', ar: 'أحمد محمد' },
  placeholderTitle: { en: 'Software Engineer', ar: 'مهندس برمجيات' },
  aiLoading: { en: 'Crafting...', ar: 'جاري الكتابة...' },
  backToHome: { en: 'Back to Home', ar: 'العودة للرئيسية' },
  call: { en: 'Call Now', ar: 'اتصال مباشر' },
  whatsappBtn: { en: 'WhatsApp', ar: 'واتساب مباشر' }
};

export const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'x', name: 'X' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'github', name: 'GitHub' }
];

export const THEME_COLORS = [
  '#2563eb', // Blue
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#059669', // Emerald
  '#d97706', // Amber
  '#1f2937', // Gray
];

export const SAMPLE_DATA: Record<'ar' | 'en', Partial<CardData>> = {
  ar: {
    name: 'أحمد العتيبي',
    title: 'مدير إبداعي أول',
    company: 'شركة حلول التقنية',
    bio: 'شغوف ببناء تجارب رقمية تربط الناس ببعضهم البعض. خبرة أكثر من 10 سنوات في تصميم واجهات المستخدم والهوية البصرية.',
    email: 'ahmed@example.com',
    phone: '+966500000000',
    whatsapp: '+966500000000',
    website: 'https://ahmed-creative.me',
    location: 'الرياض، المملكة العربية السعودية',
    locationUrl: 'https://maps.google.com',
    profileImage: '', // تم حذف صورة العينة
    themeColor: '#2563eb',
    isDark: false,
    socialLinks: [
      { platform: 'LinkedIn', url: '#', platformId: 'linkedin' },
      { platform: 'X', url: '#', platformId: 'x' },
      { platform: 'Instagram', url: '#', platformId: 'instagram' }
    ]
  },
  en: {
    name: 'John Doe',
    title: 'Senior Creative Director',
    company: 'Tech Solutions Inc.',
    bio: 'Passionate about building digital experiences that connect people. 10+ years of experience in UI/UX and Brand Identity.',
    email: 'john@example.com',
    phone: '+1234567890',
    whatsapp: '+1234567890',
    website: 'https://johndoe.design',
    location: 'Silicon Valley, California',
    locationUrl: 'https://maps.google.com',
    profileImage: '', // تم حذف صورة العينة
    themeColor: '#7c3aed',
    isDark: false,
    socialLinks: [
      { platform: 'LinkedIn', url: '#', platformId: 'linkedin' },
      { platform: 'X', url: '#', platformId: 'x' },
      { platform: 'GitHub', url: '#', platformId: 'github' }
    ]
  }
};
