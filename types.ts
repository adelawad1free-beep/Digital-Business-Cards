
export type Language = 'en' | 'ar';

export interface SocialLink {
  platform: string;
  url: string;
  platformId: string; // Used to identify the correct SVG icon
}

export interface CardData {
  id: string;
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
}

export interface TranslationStrings {
  [key: string]: {
    en: string;
    ar: string;
  };
}
