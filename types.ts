
export type Language = 'en' | 'ar';

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface CardData {
  id: string;
  name: string;
  title: string;
  company: string;
  bio: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  profileImage: string;
  themeColor: string;
  isDark: boolean; // Independent card theme
  socialLinks: SocialLink[];
}

export interface TranslationStrings {
  [key: string]: {
    en: string;
    ar: string;
  };
}
