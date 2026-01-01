
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
  
  // خصائص النمط الزجاجي للترويسة
  headerGlassy?: boolean;
  headerOpacity?: number;

  // خصائص النمط الزجاجي للجسم الأبيض (المحتوى)
  bodyGlassy?: boolean;
  bodyOpacity?: number; // 0 to 100

  // خصائص الـ QR الجديدة في القالب
  qrSize?: number;
  qrColor?: string; // لون الـ QR المخصص
  qrOffsetY?: number;
  showQrCodeByDefault?: boolean;
  showBioByDefault?: boolean; // خاصية جديدة للأدمن

  nameColor?: string;
  titleColor?: string;
  bioTextColor?: string;
  bioBgColor?: string;
  linksColor?: string;
  
  defaultThemeType?: ThemeType;
  defaultThemeColor?: string;
  defaultThemeGradient?: string;
  defaultBackgroundImage?: string;
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
  usageCount?: number;
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
  showBio?: boolean; // خاصية للتحكم في ظهور النبذة
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
  isActive?: boolean;
  viewCount?: number;
  socialLinks: SocialLink[];
  showQrCode?: boolean;
  qrColor?: string; // لون الـ QR المخصص للبطاقة
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
