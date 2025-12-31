
export type Language = 'en' | 'ar' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt' | 'ru' | 'hi';

export interface SocialLink {
  platform: string;
  url: string;
  platformId: string;
}

export type ThemeType = 'color' | 'gradient' | 'image';

export interface CardData {
  id: string;
  templateId: string; // القالب المختار
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
  themeType: ThemeType;
  themeColor: string;
  themeGradient: string;
  backgroundImage: string;
  isDark: boolean;
  socialLinks: SocialLink[];
  ownerId?: string;
  updatedAt?: string;
}

export interface TranslationStrings {
  [key: string]: {
    [key in Language]?: string;
  };
}
