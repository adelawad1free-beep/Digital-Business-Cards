
export type Language = 'en' | 'ar';

export interface SocialLink {
  platform: string;
  url: string;
  platformId: string;
}

export interface CardData {
  id: string; // المعرف الفريد (اسم المستخدم أو الرقم التسلسلي)
  name: string;
  title: string;
  company: string;
  bio: string;
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  location: string;
  locationUrl: string;
  profileImage: string;
  themeColor: string;
  isDark: boolean;
  socialLinks: SocialLink[];
  // Added ownerId and updatedAt to resolve property access errors and support administrative features
  ownerId?: string;
  updatedAt?: string;
}

export interface TranslationStrings {
  [key: string]: {
    en: string;
    ar: string;
  };
}
