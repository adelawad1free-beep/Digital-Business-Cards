
export type Language = 'en' | 'ar' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt' | 'ru' | 'hi';

export interface SocialLink {
  platform: string;
  url: string;
  platformId: string;
}

export type ThemeType = 'color' | 'gradient' | 'image';

export interface TemplateConfig {
  headerType: 'classic' | 'split' | 'overlay' | 'hero' | 'minimal';
  headerHeight: number;
  avatarStyle: 'circle' | 'squircle' | 'none';
  avatarSize: number;
  avatarOffsetY: number;
  avatarOffsetX: number;
  nameOffsetY: number;
  bioOffsetY: number;
  emailOffsetY: number;
  websiteOffsetY: number;
  contactButtonsOffsetY: number;
  socialLinksOffsetY: number;
  contentAlign: 'start' | 'center' | 'end';
  buttonStyle: 'pill' | 'square' | 'glass';
  animations: 'none' | 'fade' | 'slide' | 'bounce';
  spacing: 'compact' | 'normal' | 'relaxed';
  nameSize: number;
  bioSize: number;
  
  nameColor?: string;
  titleColor?: string;
  bioTextColor?: string;
  bioBgColor?: string;
  linksColor?: string;
  
  defaultThemeType?: ThemeType;
  defaultThemeColor?: string;
  defaultThemeGradient?: string;
  defaultBackgroundImage?: string;
  // Fix: Added missing defaultProfileImage property to TemplateConfig interface
  defaultProfileImage?: string;
  defaultIsDark?: boolean;
  
  customCss?: string;
}

export interface CustomTemplate {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  config: TemplateConfig;
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CardData {
  id: string;
  templateId: string;
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

  nameColor?: string;
  titleColor?: string;
  bioTextColor?: string;
  bioBgColor?: string;
  linksColor?: string;
}

export interface TranslationStrings {
  [key: string]: {
    [key in Language]?: string;
  };
}
