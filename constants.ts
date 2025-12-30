
import { TranslationStrings, CardData } from './types';

export const TRANSLATIONS: TranslationStrings = {
  appName: { en: 'My Digital Identity', ar: 'هويتي الرقمية' },
  tagline: { en: 'Your professional profile, smarter and faster.', ar: 'هويتك المهنية، بذكاء وسرعة.' },
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
  placeholderName: { en: 'John Doe', ar: 'أحمد محمد' },
  placeholderTitle: { en: 'Project Manager', ar: 'مدير مشاريع' },
  call: { en: 'Call Now', ar: 'اتصال هاتفي' },
  whatsappBtn: { en: 'WhatsApp', ar: 'تواصل واتساب' },
  saveContact: { en: 'Save to Contacts', ar: 'حفظ جهة الاتصال' },
  imageSource: { en: 'Profile Picture', ar: 'صورة الملف الشخصي' },
  socialSync: { en: 'Social Sync', ar: 'مزامنة التواصل' },
  avatarLib: { en: 'Avatars', ar: 'صور تعبيرية' },
  directLink: { en: 'Direct Link', ar: 'رابط مباشر' },
  customLink: { en: 'Personal Link Name', ar: 'اسم الرابط الشخصي' },
  linkHint: { en: 'Your link will be: ', ar: 'سيكون رابطك: ' }
};

export const SOCIAL_PLATFORMS = [
  { id: 'linkedin', name: 'LinkedIn' },
  { id: 'x', name: 'X (Twitter)' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'whatsapp_social', name: 'WhatsApp' },
  { id: 'telegram', name: 'Telegram' },
  { id: 'snapchat', name: 'Snapchat' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'threads', name: 'Threads' },
  { id: 'youtube', name: 'YouTube' },
  { id: 'github', name: 'GitHub' },
  { id: 'behance', name: 'Behance' },
  { id: 'dribbble', name: 'Dribbble' },
  { id: 'pinterest', name: 'Pinterest' },
  { id: 'discord', name: 'Discord' },
  { id: 'twitch', name: 'Twitch' },
  { id: 'spotify', name: 'Spotify' }
];

export const THEME_COLORS = [
  '#2563eb', // Blue
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#059669', // Emerald
  '#d97706', // Amber
  '#0f172a', // Slate
  '#C5A059'  // Luxury Gold
];

export const SAMPLE_DATA: Record<'ar' | 'en', Partial<CardData>> = {
  ar: {
    name: 'أحمد بن محمد',
    title: 'مستشار تطوير أعمال',
    company: 'هويتي الرقمية',
    bio: 'خبير في التحول الرقمي وبناء الهويات المؤسسية.',
    email: 'contact@digital-id.sa',
    phone: '+966500000000',
    whatsapp: '+966500000000',
    themeColor: '#2563eb',
    isDark: false,
    profileImage: '', // فارغة لاستخدام الصورة الرمزية الرسمية
    socialLinks: []
  },
  en: {
    name: 'John Doe',
    title: 'Senior Consultant',
    company: 'My Digital Identity',
    bio: 'Digital transformation expert.',
    email: 'hello@digital-id.io',
    phone: '+1234567890',
    whatsapp: '+1234567890',
    themeColor: '#7c3aed',
    isDark: false,
    profileImage: '', // Empty for default formal silhouette
    socialLinks: []
  }
};
