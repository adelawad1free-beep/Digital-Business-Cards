
import { TranslationStrings, CardData } from './types';

export const TRANSLATIONS: TranslationStrings = {
  appName: { en: 'My Digital Identity', ar: 'هويتي الرقمية' },
  tagline: { en: 'Your professional profile, smarter and faster.', ar: 'هويتك المهنية، بذكاء وسرعة.' },
  seoTagline: { 
    en: 'The #1 Digital Business Card platform. Create, share, and connect instantly with QR technology.', 
    ar: 'المنصة الأولى لإنشاء بطاقات الأعمال الرقمية. أنشئ، شارك، وتواصل فوراً بتقنية QR.' 
  },
  createBtn: { en: 'Create My Card', ar: 'ابدأ بإنشاء بطاقتي' },
  preview: { en: 'Live Preview', ar: 'معاينة مباشرة' },
  edit: { en: 'Edit Card', ar: 'تعديل البيانات' },
  save: { en: 'Save & Generate Link', ar: 'حفظ واستخراج الرابط' },
  fullName: { en: 'Full Name', ar: 'الاسم بالكامل' },
  jobTitle: { en: 'Job Title', ar: 'المسمى الوظيفي' },
  company: { en: 'Company', ar: 'جهة العمل / الشركة' },
  bio: { en: 'About Me / Bio', ar: 'نبذة تعريفية' },
  email: { en: 'Email Address', ar: 'البريد الإلكتروني' },
  phone: { en: 'Phone Number', ar: 'رقم الجوال' },
  whatsapp: { en: 'WhatsApp Number', ar: 'رقم الواتساب' },
  website: { en: 'Website / Portfolio', ar: 'الموقع الإلكتروني' },
  location: { en: 'Office Location', ar: 'عنوان المكتب' },
  locationUrl: { en: 'Google Maps Link', ar: 'رابط خرائط جوجل' },
  socials: { en: 'Professional Links', ar: 'روابط التواصل الاجتماعي' },
  theme: { en: 'Brand Color', ar: 'لون الهوية' },
  cardTheme: { en: 'Display Theme', ar: 'نمط العرض' },
  lightMode: { en: 'Light Mode', ar: 'وضع نهاري' },
  darkMode: { en: 'Dark Mode', ar: 'وضع ليلي' },
  magicBio: { en: 'AI Writing Assistant', ar: 'مساعد الكتابة بالذكاء الاصطناعي' },
  share: { en: 'Share My Profile', ar: 'مشاركة الملف الشخصي' },
  downloadQR: { en: 'Get QR Code', ar: 'تحميل كود QR' },
  placeholderName: { en: 'John Doe', ar: 'أحمد محمد' },
  placeholderTitle: { en: 'Project Manager', ar: 'مدير مشاريع' },
  aiLoading: { en: 'AI is thinking...', ar: 'الذكاء الاصطناعي يكتب...' },
  backToHome: { en: 'Home', ar: 'الرئيسية' },
  call: { en: 'Call Now', ar: 'اتصال هاتفي' },
  whatsappBtn: { en: 'WhatsApp', ar: 'تواصل واتساب' }
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
  '#0f172a', // Slate
];

export const SAMPLE_DATA: Record<'ar' | 'en', Partial<CardData>> = {
  ar: {
    name: 'أحمد بن محمد',
    title: 'مستشار تطوير أعمال',
    company: 'هويتي الرقمية',
    bio: 'خبير في التحول الرقمي وبناء الهويات المؤسسية. أساعد الشركات في الانتقال إلى العالم الرقمي بأحدث التقنيات.',
    email: 'contact@digital-id.sa',
    phone: '+966500000000',
    whatsapp: '+966500000000',
    website: 'https://digital-id.sa',
    location: 'الرياض، المملكة العربية السعودية',
    locationUrl: 'https://maps.google.com',
    profileImage: '', 
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
    title: 'Senior Business Consultant',
    company: 'My Digital Identity',
    bio: 'Digital transformation expert helping businesses thrive in the modern era with innovative solutions and smart networking.',
    email: 'hello@digital-id.io',
    phone: '+1234567890',
    whatsapp: '+1234567890',
    website: 'https://digital-id.io',
    location: 'London, UK',
    locationUrl: 'https://maps.google.com',
    profileImage: '', 
    themeColor: '#7c3aed',
    isDark: false,
    socialLinks: [
      { platform: 'LinkedIn', url: '#', platformId: 'linkedin' },
      { platform: 'X', url: '#', platformId: 'x' },
      { platform: 'GitHub', url: '#', platformId: 'github' }
    ]
  }
};
