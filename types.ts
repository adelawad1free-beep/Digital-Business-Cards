
export type Language = 'en' | 'ar' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'pt' | 'ru' | 'hi';

export interface SocialLink {
  platform: string;
  url: string;
  platformId: string;
}

export type ThemeType = 'color' | 'gradient' | 'image';
export type PageBgStrategy = 'solid' | 'mirror-header';

export interface TemplateConfig {
  headerType: 
    | 'classic' | 'split-left' | 'split-right' | 'overlay' 
    | 'hero' | 'minimal' | 'side-left' | 'side-right' 
    | 'curved' | 'diagonal' | 'wave' | 'floating' 
    | 'glass-card' | 'modern-split' | 'top-bar' | 'custom-asset';
  headerHeight: number;
  headerCustomAsset?: string; 
  headerSvgRaw?: string;
  headerPatternId?: string; 
  headerPatternOpacity?: number; 
  headerPatternScale?: number; 
  avatarStyle: 'circle' | 'squircle' | 'square' | 'none'; // تم إضافة square
  avatarStyle_v2?: string;
  avatarSize: number;
  avatarOffsetY: number;
  avatarOffsetX: number;
  avatarBorderWidth?: number;
  avatarBorderColor?: string;
  // Animated Border Settings
  avatarAnimatedBorder?: boolean;
  avatarAnimatedBorderColor1?: string;
  avatarAnimatedBorderColor2?: string;
  avatarAnimatedBorderSpeed?: number;
  avatarAnimatedGlow?: boolean;

  nameOffsetY: number;
  titleOffsetY?: number; 
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
  
  headerGlassy?: boolean;
  headerOpacity?: number;
  bodyGlassy?: boolean;
  bodyOpacity?: number;
  bodyOffsetY?: number;
  bodyBorderRadius?: number;

  // Social Icons Lab
  socialIconStyle?: 'circle' | 'squircle' | 'rounded' | 'square' | 'none';
  socialIconSize?: number;
  socialIconVariant?: 'filled' | 'outline' | 'glass' | 'ghost';
  socialIconBgColor?: string;
  socialIconColor?: string;
  socialIconBorderWidth?: number;
  socialIconBorderColor?: string;
  socialIconGap?: number;
  socialIconColumns?: number;
  socialIconPadding?: number;
  useSocialBrandColors?: boolean;

  qrSize?: number;
  qrColor?: string; 
  qrBgColor?: string;
  qrPadding?: number;
  qrOffsetY?: number;
  qrBorderWidth?: number;
  qrBorderColor?: string;
  qrBorderRadius?: number;
  showQrCodeByDefault?: boolean;
  showBioByDefault?: boolean; 
  showNameByDefault?: boolean;
  showTitleByDefault?: boolean;
  showCompanyByDefault?: boolean;
  showEmailByDefault?: boolean;
  showWebsiteByDefault?: boolean;
  showPhoneByDefault?: boolean;
  showWhatsappByDefault?: boolean;
  showSocialLinksByDefault?: boolean;
  showButtonsByDefault?: boolean;

  showOccasionByDefault?: boolean;
  occasionTitle?: string;
  occasionDesc?: string;
  occasionTitleAr?: string; 
  occasionTitleEn?: string; 
  occasionDate?: string;
  occasionMapUrl?: string;
  occasionOffsetY?: number;
  occasionFloating?: boolean;
  occasionPrimaryColor?: string;
  occasionBgColor?: string;
  occasionTitleColor?: string;
  occasionGlassy?: boolean;
  occasionOpacity?: number;
  showCountdown?: boolean;

  // Special Body Feature (Admin Only Control)
  showBodyFeatureByDefault?: boolean;
  bodyFeatureTextAr?: string;
  bodyFeatureTextEn?: string;
  bodyFeatureBgColor?: string;
  bodyFeatureTextColor?: string;
  bodyFeatureHeight?: number;
  bodyFeaturePaddingX?: number; // Width expansion
  bodyFeatureOffsetY?: number;
  bodyFeatureBorderRadius?: number;
  bodyFeatureGlassy?: boolean;

  // Invitation Texts Colors
  occasionPrefixColor?: string;
  occasionNameColor?: string;
  occasionWelcomeColor?: string;

  // Invitation Texts
  invitationPrefix?: string;
  invitationWelcome?: string;
  invitationYOffset?: number;

  nameColor?: string;
  titleColor?: string;
  bioTextColor?: string;
  bioBgColor?: string;
  linksColor?: string;
  socialIconsColor?: string;
  contactPhoneColor?: string;
  contactWhatsappColor?: string;
  
  defaultThemeType?: ThemeType;
  defaultThemeColor?: string;
  defaultThemeGradient?: string;
  defaultBackgroundImage?: string;
  defaultProfileImage?: string;
  defaultName?: string;
  defaultNameSize?: number;
  defaultIsDark?: boolean;
  cardBgColor?: string; 
  pageBgColor?: string; 
  pageBgStrategy?: PageBgStrategy; 
  
  customCss?: string;
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
  isActive?: boolean;
  viewCount?: number;
  socialLinks: SocialLink[];
  useSocialBrandColors?: boolean; // خيار المستخدم لألوان السوشيال
  ownerId?: string;
  updatedAt?: string;
  showName?: boolean;
  showTitle?: boolean;
  showCompany?: boolean;
  showBio?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showWebsite?: boolean;
  showWhatsapp?: boolean;
  showSocialLinks?: boolean;
  showButtons?: boolean;
  showQrCode?: boolean;
  showOccasion?: boolean;
  occasionTitle?: string;
  occasionDesc?: string;
  occasionTitleAr?: string; 
  occasionTitleEn?: string; 
  occasionDate?: string;
  occasionMapUrl?: string;
  occasionOffsetY?: number;
  occasionFloating?: boolean;
  occasionPrimaryColor?: string;
  occasionBgColor?: string;
  occasionTitleColor?: string;
  occasionGlassy?: boolean;
  occasionOpacity?: number;

  invitationPrefix?: string;
  invitationWelcome?: string;
  invitationYOffset?: number;
  occasionPrefixColor?: string;
  occasionNameColor?: string;
  occasionWelcomeColor?: string;

  showBodyFeature?: boolean;
  bodyFeatureText?: string;

  bodyGlassy?: boolean;
  bodyOpacity?: number;

  nameColor?: string;
  titleColor?: string;
  bioTextColor?: string;
  bioBgColor?: string;
  linksColor?: string;
  socialIconsColor?: string;
  contactPhoneColor?: string;
  contactWhatsappColor?: string;
  qrSize?: number;
  qrColor?: string; 
  qrBgColor?: string;
  qrPadding?: number;
  qrOffsetY?: number;
  qrBorderWidth?: number;
  qrBorderColor?: string;
  qrBorderRadius?: number;
  cardBgColor?: string; 
  pageBgColor?: string;
  pageBgStrategy?: PageBgStrategy;
}

export interface VisualStyle {
  id: string;
  nameAr: string;
  nameEn: string;
  isActive: boolean;
  config: Partial<TemplateConfig>; 
  createdAt: string;
  updatedAt?: string;
}

export interface TemplateCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  order: number;
  isActive: boolean;
}

export interface CustomTemplate {
  id: string;
  categoryId?: string; 
  parentStyleId?: string; 
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

export interface TranslationStrings {
  [key: string]: {
    [key in Language]?: string;
  };
}
