
import { Mail, Phone, Globe, MessageCircle, UserPlus, Camera, Download, QrCode, Cpu, Calendar, MapPin, Timer, PartyPopper, Navigation2, Quote, Sparkle, CheckCircle, Star, ExternalLink, Map as MapIcon, Link as LinkIcon, ShoppingCart, ShieldCheck } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { CardData, Language, TemplateConfig, SpecialLinkItem } from '../types';
import { TRANSLATIONS, PATTERN_PRESETS } from '../constants';
import { downloadVCard } from '../utils/vcard';
import { generateShareUrl } from '../utils/share';
import SocialIcon, { BRAND_COLORS } from './SocialIcon';

interface CardPreviewProps {
  data: CardData;
  lang: Language;
  customConfig?: TemplateConfig; 
  hideSaveButton?: boolean; 
  isFullFrame?: boolean; 
  hideHeader?: boolean; 
  bodyOffsetYOverride?: number;
}

const MembershipBar = ({ 
  startDate, 
  expiryDate, 
  title, 
  isDark, 
  isGlassy,
  bgColor,
  borderColor,
  textColor,
  accentColor
}: { 
  startDate?: string, 
  expiryDate?: string, 
  title?: string, 
  isDark: boolean, 
  isGlassy?: boolean,
  bgColor?: string,
  borderColor?: string,
  textColor?: string,
  accentColor?: string
}) => {
  if (!expiryDate) return null;

  const now = new Date();
  const start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const end = new Date(expiryDate);
  
  const total = end.getTime() - start.getTime();
  const remaining = end.getTime() - now.getTime();
  const progress = Math.max(0, Math.min(100, (remaining / total) * 100));
  const daysLeft = Math.ceil(remaining / (1000 * 60 * 60 * 24));

  // Default color logic if no accentColor is provided
  let dynamicColor = accentColor;
  if (!dynamicColor) {
    const r = Math.floor(239 - (239 - 34) * (progress / 100));
    const g = Math.floor(68 + (197 - 68) * (progress / 100));
    const b = Math.floor(68 + (94 - 68) * (progress / 100));
    dynamicColor = `rgb(${r}, ${g}, ${b})`;
  }

  const finalBg = bgColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(249, 250, 251, 1)');
  const finalBorder = borderColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(243, 244, 246, 1)');
  const finalTextColor = textColor || (isDark ? 'rgba(255,255,255,0.6)' : 'rgba(107, 114, 128, 1)');

  return (
    <div 
      className={`w-full p-5 rounded-[2rem] border transition-all duration-500 animate-fade-in-up ${isGlassy ? 'backdrop-blur-xl' : ''}`}
      style={{ 
        backgroundColor: finalBg,
        borderColor: finalBorder
      }}
    >
       <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
             <ShieldCheck size={16} style={{ color: dynamicColor }} />
             <span className="text-[10px] font-black uppercase tracking-widest opacity-80" style={{ color: textColor || undefined }}>{title || (daysLeft > 0 ? 'ACTIVE SUBSCRIPTION' : 'EXPIRED')}</span>
          </div>
          <span className="text-[10px] font-black" style={{ color: dynamicColor }}>{daysLeft > 0 ? `${daysLeft} DAYS LEFT` : 'EXPIRED'}</span>
       </div>
       <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full transition-all duration-1000 ease-out rounded-full shadow-lg"
            style={{ 
              width: `${progress}%`, 
              backgroundColor: dynamicColor,
              boxShadow: `0 0 10px ${dynamicColor}44`
            }}
          />
       </div>
       <div className="flex justify-between mt-2 text-[8px] font-black uppercase tracking-tighter" style={{ color: finalTextColor }}>
          <span>{start.toLocaleDateString()}</span>
          <span>{end.toLocaleDateString()}</span>
       </div>
    </div>
  );
};

const CountdownTimer = ({ targetDate, isDark, primaryColor }: { targetDate: string, isDark: boolean, primaryColor: string }) => {
  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    const calculate = () => {
      if (!targetDate) return;
      const difference = +new Date(targetDate) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          d: Math.floor(difference / (1000 * 60 * 60 * 24)),
          h: Math.floor((difference / (1000 * 60 * 60)) % 24),
          m: Math.floor((difference / 1000 / 60) % 60),
          s: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft(null);
      }
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  const Unit = ({ val, label }: { val: number, label: string }) => (
    <div className={`flex flex-col items-center justify-center flex-1 p-3 rounded-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'} border shadow-sm transition-all duration-500 hover:scale-105`}>
      <span className="text-xl font-black leading-none" style={{ color: primaryColor }}>{val}</span>
      <span className="text-[7px] font-black uppercase tracking-widest opacity-40 mt-1.5">{label}</span>
    </div>
  );

  return (
    <div className="flex gap-2 justify-between w-full mt-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
      <Unit val={timeLeft.s} label="SEC" />
      <Unit val={timeLeft.m} label="MIN" />
      <Unit val={timeLeft.h} label="HRS" />
      <Unit val={timeLeft.d} label="DAYS" />
    </div>
  );
};

const CardPreview: React.FC<CardPreviewProps> = ({ data, lang, customConfig, hideSaveButton = false, isFullFrame = false, hideHeader = false, bodyOffsetYOverride }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key] ? (TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en']) : key;

  const themeType = data.themeType || 'gradient';
  const themeColor = data.themeColor || '#3b82f6';
  const themeGradient = data.themeGradient || 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
  const backgroundImage = data.backgroundImage;
  const isDark = data.isDark;

  const config = customConfig || {} as TemplateConfig;
  const headerType = config.headerType || 'classic';
  const headerHeight = config.headerHeight || 180;

  const nameColor = data.nameColor || config.nameColor || (isDark ? '#ffffff' : '#111827');
  const titleColor = data.titleColor || config.titleColor || '#2563eb';
  const linksColor = data.linksColor || config.linksColor || '#3b82f6';
  const socialIconsColor = data.socialIconsColor || config.socialIconsColor || linksColor;
  const phoneBtnColor = data.contactPhoneColor || config.contactPhoneColor || '#2563eb';
  const whatsappBtnColor = data.contactWhatsappColor || config.contactWhatsappColor || '#10b981';

  const hexToRgb = (hex: string) => {
    hex = (hex || '#000000').replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return { r, g, b, string: `${r}, ${g}, ${b}` };
  };

  // --- Bio Styling Logic ---
  const bTextColor = data.bioTextColor || config.bioTextColor || (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)');
  let bBgColor = data.bioBgColor || config.bioBgColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)');
  const bGlassy = data.bioGlassy ?? config.bioGlassy;
  const bOpacity = (data.bioOpacity ?? config.bioOpacity ?? 100) / 100;
  if (bGlassy && bBgColor.startsWith('#')) {
    const rgb = hexToRgb(bBgColor);
    bBgColor = `rgba(${rgb.string}, ${bOpacity})`;
  } else if (!bBgColor.startsWith('rgba') && bOpacity < 1) {
    const rgb = hexToRgb(bBgColor);
    bBgColor = `rgba(${rgb.string}, ${bOpacity})`;
  }

  const bioStyles: React.CSSProperties = {
    backgroundColor: bBgColor,
    transform: `translateY(${config.bioOffsetY}px)`,
    maxWidth: `${data.bioMaxWidth ?? config.bioMaxWidth ?? 90}%`,
    borderRadius: `${data.bioBorderRadius ?? config.bioBorderRadius ?? 32}px`,
    borderWidth: `${data.bioBorderWidth ?? config.bioBorderWidth ?? 1}px`,
    borderColor: data.bioBorderColor ?? config.bioBorderColor ?? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
    paddingTop: `${data.bioPaddingV ?? config.bioPaddingV ?? 20}px`,
    paddingBottom: `${data.bioPaddingV ?? config.bioPaddingV ?? 20}px`,
    paddingLeft: `${data.bioPaddingH ?? config.bioPaddingH ?? 20}px`,
    paddingRight: `${data.bioPaddingH ?? config.bioPaddingH ?? 20}px`,
    backdropFilter: bGlassy ? 'blur(15px)' : 'none',
    WebkitBackdropFilter: bGlassy ? 'blur(15px)' : 'none',
    textAlign: (data.bioTextAlign ?? config.bioTextAlign ?? 'center') as any
  };

  const isLocGlassy = config.locationGlassy;
  let locBg = config.locationBgColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.05)');
  if (isLocGlassy && locBg.startsWith('#')) {
    const rgb = hexToRgb(locBg);
    locBg = `rgba(${rgb.string}, 0.2)`;
  }
  const locIconColor = config.locationIconColor || themeColor;
  const locTextColor = config.locationTextColor || (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15, 23, 42, 0.8)');
  const locRadius = config.locationBorderRadius ?? 24;
  const locPaddingV = config.locationPaddingV ?? 20; 
  const locAddressSize = config.locationAddressSize ?? 13; 

  const dLinksShowBg = data.linksShowBg ?? config.linksShowBg ?? true;
  const dLinksShowText = data.linksShowText ?? config.linksShowText ?? true;
  const isDLinksGlassy = config.linksSectionGlassy;
  
  let dLinksSectionBg = config.linksSectionBgColor || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)');
  if (isDLinksGlassy && dLinksSectionBg.startsWith('#')) {
    const rgb = hexToRgb(dLinksSectionBg);
    dLinksSectionBg = `rgba(${rgb.string}, 0.2)`;
  }

  const dLinksTextColor = config.linksSectionTextColor || (isDark ? 'rgba(255,255,255,0.8)' : 'rgba(15, 23, 42, 0.8)');
  const dLinksIconColor = config.linksSectionIconColor || themeColor;
  const dLinksRadius = config.linksSectionRadius ?? 24;
  const dLinksVariant = config.linksSectionVariant || 'list';
  const dLinksItemBg = config.linksItemBgColor || (isDark ? 'rgba(255,255,255,0.1)' : '#ffffff');
  const dLinksItemRadius = config.linksItemRadius ?? (dLinksVariant === 'pills' ? 999 : 16);
  const dLinksSectionPaddingV = data.linksSectionPaddingV ?? config.linksSectionPaddingV ?? 24;

  const isVerified = data.isVerified ?? config.isVerifiedByDefault;
  const showStars = data.showStars ?? config.showStarsByDefault;
  const hasGoldenFrame = data.hasGoldenFrame ?? config.hasGoldenFrameByDefault;

  const qrColorVal = (data.qrColor || config.qrColor || themeColor || '#000000').replace('#', '');
  const qrBgColor = data.qrBgColor || config.qrBgColor || (isDark ? '#111115' : '#ffffff');
  const qrSize = data.qrSize || config.qrSize || 90;
  const qrBorderWidth = data.qrBorderWidth ?? config.qrBorderWidth ?? 0;
  const qrBorderColor = data.qrBorderColor || config.qrBorderColor || 'transparent';
  const qrBorderRadius = data.qrBorderRadius ?? config.qrBorderRadius ?? 0;
  const qrOffsetY = data.qrOffsetY || config.qrOffsetY || 0;

  const cardUrl = generateShareUrl(data);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(cardUrl)}&bgcolor=${qrBgColor === 'transparent' ? (isDark ? '0f0f12' : 'ffffff') : qrBgColor.replace('#', '')}&color=${qrColorVal}&margin=0`;

  const isVisible = (dataField: boolean | undefined, configField: boolean | undefined) => {
    if (dataField !== undefined) return dataField;
    return configField !== false; 
  };

  const showName = isVisible(data.showName, config.showNameByDefault);
  const showTitle = isVisible(data.showTitle, config.showTitleByDefault);
  const showCompany = isVisible(data.showCompany, config.showCompanyByDefault);
  const showBio = isVisible(data.showBio, config.showBioByDefault);
  const showEmail = isVisible(data.showEmail, config.showEmailByDefault);
  const showPhone = isVisible(data.showPhone, config.showPhoneByDefault);
  const showWebsite = isVisible(data.showWebsite, config.showWebsiteByDefault);
  const showWhatsapp = isVisible(data.showWhatsapp, config.showWhatsappByDefault);
  const showSocialLinks = isVisible(data.showSocialLinks, config.showSocialLinksByDefault);
  const showButtons = isVisible(data.showButtons, config.showButtonsByDefault);
  const showQrCode = isVisible(data.showQrCode, config.showQrCodeByDefault);
  const showSpecialLinks = isVisible(data.showSpecialLinks, config.showSpecialLinksByDefault);
  const showLocation = isVisible(data.showLocation, config.showLocationByDefault);
  const showMembership = isVisible(data.showMembership, config.showMembershipByDefault);

  const hasContactButtons = (showPhone && data.phone) || 
                           (showWhatsapp && data.whatsapp) || 
                           (!hideSaveButton && showButtons);

  const getHeaderStyles = (): React.CSSProperties => {
    const opacity = (config.headerOpacity ?? 100) / 100;
    const isGlassy = config.headerGlassy;
    let baseStyle: React.CSSProperties = { 
      height: `${headerHeight}px`,
      width: '100%',
      position: headerType === 'overlay' ? 'absolute' : 'relative',
      top: 0,
      left: 0,
      transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      zIndex: 0,
      overflow: 'hidden'
    };
    
    if (config.headerCustomAsset) {
      baseStyle = { ...baseStyle, backgroundImage: `url(${config.headerCustomAsset})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (themeType === 'image' && backgroundImage) {
      baseStyle = { ...baseStyle, backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (themeType === 'gradient' && themeGradient) {
      baseStyle = { ...baseStyle, background: themeGradient };
    } else {
      baseStyle = { ...baseStyle, backgroundColor: themeColor };
    }
    
    if (isGlassy) {
      baseStyle = { 
        ...baseStyle, 
        backgroundColor: isDark ? `rgba(15, 15, 20, ${opacity})` : `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: 'blur(12px)', 
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
      };
    }

    switch(headerType) {
      case 'curved': baseStyle.clipPath = 'ellipse(100% 100% at 50% 0%)'; break;
      case 'diagonal': baseStyle.clipPath = 'polygon(0 0, 100% 0, 100% 85%, 0 100%)'; break;
      case 'split-left': baseStyle.clipPath = 'polygon(0 0, 100% 0, 100% 60%, 0 100%)'; break;
      case 'split-right': baseStyle.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 60%)'; break;
      case 'wave': baseStyle.clipPath = 'polygon(0% 0%, 100% 0%, 100% 85%, 90% 88%, 80% 90%, 70% 89%, 60% 86%, 50% 84%, 40% 83%, 30% 85%, 20% 88%, 10% 90%, 0% 88%)'; break;
      case 'side-left': baseStyle.width = '25%'; baseStyle.height = '100%'; baseStyle.position = 'absolute'; baseStyle.left = '0'; break;
      case 'side-right': baseStyle.width = '25%'; baseStyle.height = '100%'; baseStyle.position = 'absolute'; baseStyle.right = '0'; break;
      case 'floating': baseStyle.width = 'calc(100% - 32px)'; baseStyle.margin = '16px auto'; baseStyle.borderRadius = '32px'; break;
      case 'glass-card': baseStyle.width = 'calc(100% - 48px)'; baseStyle.margin = '24px auto'; baseStyle.borderRadius = '40px'; baseStyle.backdropFilter = 'blur(20px)'; break;
      case 'modern-split': baseStyle.clipPath = 'polygon(0 0, 100% 0, 75% 100%, 0 100%)'; break;
      case 'top-bar': baseStyle.height = '12px'; break;
      case 'minimal': baseStyle.height = '4px'; break;
      case 'hero': baseStyle.height = '350px'; break;
    }

    return baseStyle;
  };

  const isBodyGlassy = data.bodyGlassy ?? config.bodyGlassy;
  const bodyOpacity = (data.bodyOpacity ?? config.bodyOpacity ?? 100) / 100;
  
  const bodyBaseColor = data.cardBodyColor || config.cardBodyColor || (isDark ? '#1a1a20' : '#ffffff');
  const rgbBody = hexToRgb(bodyBaseColor);

  const needsSideMargins = headerType.startsWith('side') || isBodyGlassy || bodyOpacity < 1 || config.headerType === 'floating' || hideHeader;

  const finalBodyOffsetY = bodyOffsetYOverride !== undefined ? bodyOffsetYOverride : (config.bodyOffsetY || 0);

  const bodyContentStyles: React.CSSProperties = {
    marginTop: hideHeader ? '0px' : (headerType === 'overlay' ? `${headerHeight * 0.4}px` : (headerType.startsWith('side') ? '40px' : '-60px')),
    transform: `translateY(${finalBodyOffsetY}px)`, 
    backgroundColor: `rgba(${rgbBody.string}, ${bodyOpacity})`,
    borderRadius: `${config.bodyBorderRadius ?? 48}px`,
    paddingTop: '24px',
    position: 'relative',
    zIndex: 20,
    width: needsSideMargins ? 'calc(100% - 32px)' : '100%',
    margin: needsSideMargins ? '0 auto' : '0',
    backdropFilter: isBodyGlassy ? 'blur(20px)' : 'none',
    WebkitBackdropFilter: isBodyGlassy ? 'blur(20px)' : 'none',
    border: needsSideMargins ? (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)') : 'none',
    textAlign: config.contentAlign || 'center',
    marginLeft: headerType === 'side-left' ? '28%' : (headerType === 'side-right' ? '2%' : (needsSideMargins ? 'auto' : '0')),
    marginRight: headerType === 'side-right' ? '28%' : (headerType === 'side-left' ? '2%' : (needsSideMargins ? 'auto' : '0')),
    minHeight: '400px',
    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: needsSideMargins ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' : 'none'
  };

  const finalCardBaseGroundColor = hideHeader ? 'transparent' : (data.cardBgColor || config.cardBgColor || (isDark ? '#0f0f12' : '#f1f5f9'));

  const showAnimatedBorder = config.avatarAnimatedBorder;
  const borderClr1 = config.avatarAnimatedBorderColor1 || themeColor;
  const borderClr2 = config.avatarAnimatedBorderColor2 || '#ffffff';
  const borderSpeed = config.avatarAnimatedBorderSpeed || 3;

  const showBodyFeature = isVisible(data.showBodyFeature, config.showBodyFeatureByDefault);
  const featureContent = data.bodyFeatureText || (isRtl ? config.bodyFeatureTextAr : config.bodyFeatureTextEn) || '';
  const featurePaddingX = config.bodyFeaturePaddingX ?? 0;
  const featureBg = config.bodyFeatureBgColor || themeColor;
  const featureTextColor = config.bodyFeatureTextColor || '#ffffff';
  const isFeatureGlassy = config.bodyFeatureGlassy;
  const featureHeight = config.bodyFeatureHeight || 45;
  const featureRadius = config.bodyFeatureBorderRadius ?? 16;
  const featureOffsetY = config.bodyFeatureOffsetY || 0;

  const sStyle = config.socialIconStyle || 'rounded';
  const sSize = config.socialIconSize || 22;
  const sPadding = config.socialIconPadding || 14;
  const sGap = config.socialIconGap || 12;
  const sCols = config.socialIconColumns || 0;
  const sVariant = config.socialIconVariant || 'filled';
  const sBg = config.socialIconBgColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)');
  const sColor = config.socialIconColor || socialIconsColor;
  const sBorderWidth = config.socialIconBorderWidth || 1;
  const sBorderColor = config.socialIconBorderColor || (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)');
  
  const useBrandColors = data.useSocialBrandColors !== undefined ? data.useSocialBrandColors : config.useSocialBrandColors;

  const getSocialBtnStyles = (platformId: string): React.CSSProperties => {
    const brandColor = BRAND_COLORS[platformId];
    let style: React.CSSProperties = {
      padding: `${sPadding}px`,
      color: (useBrandColors && brandColor) ? (sVariant === 'filled' ? '#ffffff' : brandColor) : sColor,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    if (sStyle === 'circle') style.borderRadius = '9999px';
    else if (sStyle === 'squircle') style.borderRadius = '28%';
    else if (sStyle === 'rounded') style.borderRadius = '16px';
    else if (sStyle === 'square') style.borderRadius = '0px';

    if (sVariant === 'filled') {
      style.backgroundColor = (useBrandColors && brandColor) ? brandColor : sBg;
      style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)';
    } else if (sVariant === 'outline') {
      style.border = `${sBorderWidth}px solid ${(useBrandColors && brandColor) ? brandColor : sBorderColor}`;
    } else if (sVariant === 'glass') {
      style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.5)';
      style.backdropFilter = 'blur(10px)';
      style.WebkitBackdropFilter = 'blur(10px)';
      style.border = `1px solid ${(useBrandColors && brandColor) ? brandColor + '44' : 'rgba(255,255,255,0.1)'}`;
    }

    return style;
  };

  const getAvatarRadiusClasses = (inner: boolean = false) => {
    if (config.avatarStyle === 'circle') return 'rounded-full';
    if (config.avatarStyle === 'square') return 'rounded-none';
    return inner ? 'rounded-[22%]' : 'rounded-[28%]';
  };

  const slCols = data.specialLinksCols || config.specialLinksCols || 2;
  const slGap = config.specialLinksGap || 12;
  const slRadius = config.specialLinksRadius ?? 24;
  const slAspect = config.specialLinksAspectRatio || 'square';
  const slOffsetY = config.specialLinksAspectRatio === 'video' ? 0 : (config.specialLinksOffsetY || 0);

  const finalEmails = data.emails && data.emails.length > 0 ? data.emails : (data.email ? [data.email] : []);
  const finalWebsites = data.websites && data.websites.length > 0 ? data.websites : (data.website ? [data.website] : []);
  const hasDirectLinks = (showEmail && finalEmails.length > 0) || (showWebsite && finalWebsites.length > 0);

  const finalName = data.name || config.defaultName || '---';
  const finalTitle = data.title || config.defaultTitle || '';
  const finalCompany = data.company || config.defaultCompany || '';
  
  const finalSpecialLinks = (data.specialLinks !== undefined) ? data.specialLinks : (config.defaultSpecialLinks || []);

  const cbRadius = config.contactButtonsRadius ?? 16;
  const cbGap = config.contactButtonsGap ?? 12;
  const cbPaddingV = config.contactButtonsPaddingV ?? 16;
  const cbGlassy = config.contactButtonsGlassy;

  const getContactBtnStyle = (baseColor: string): React.CSSProperties => {
    const style: React.CSSProperties = {
      backgroundColor: cbGlassy ? `rgba(${hexToRgb(baseColor).string}, 0.15)` : baseColor,
      borderRadius: `${cbRadius}px`,
      paddingTop: `${cbPaddingV}px`,
      paddingBottom: `${cbPaddingV}px`,
      backdropFilter: cbGlassy ? 'blur(10px)' : 'none',
      WebkitBackdropFilter: cbGlassy ? 'blur(10px)' : 'none',
      border: cbGlassy ? `1px solid rgba(${hexToRgb(baseColor).string}, 0.3)` : 'none',
      color: cbGlassy ? baseColor : '#ffffff'
    };
    return style;
  };

  const finalBio = data.bio || (isRtl ? config.defaultBioAr : config.defaultBioEn);

  return (
    <div 
      className={`w-full min-h-full flex flex-col transition-all duration-500 relative overflow-hidden ${isFullFrame ? 'rounded-none' : 'rounded-[2.25rem]'} ${isDark ? 'text-white' : 'text-gray-900'} ${hasGoldenFrame ? 'ring-[10px] ring-yellow-500/30 ring-inset shadow-[0_0_50px_rgba(234,179,8,0.3)]' : ''}`}
      style={{ backgroundColor: finalCardBaseGroundColor }}
    >
      
      {!hideHeader && (
        <div className="absolute inset-0 z-[-1] opacity-40">
          {themeType === 'image' && backgroundImage && <img src={backgroundImage} className="w-full h-full object-cover blur-sm scale-110" />}
          {themeType === 'gradient' && <div className="w-full h-full" style={{ background: themeGradient }} />}
        </div>
      )}

      {!hideHeader && (
        <div className="shrink-0 overflow-hidden relative" style={getHeaderStyles()}>
            {headerType === 'custom-asset' && config.headerSvgRaw && (
               <div className="absolute inset-0 flex items-start justify-center overflow-hidden" style={{ color: themeType === 'gradient' ? '#ffffff' : themeColor, opacity: 0.9 }} dangerouslySetInnerHTML={{ __html: config.headerSvgRaw.replace('<svg', `<svg style="width: 100%; height: 100%; display: block;" preserveAspectRatio="none"`) }} />
            )}
            {config.headerPatternId && config.headerPatternId !== 'none' && (
              <div className="absolute inset-0 pointer-events-none opacity-[0.2]" 
                   style={{ 
                     backgroundImage: `url("data:image/svg+xml;base64,${window.btoa((PATTERN_PRESETS.find(p => p.id === config.headerPatternId)?.svg || '').replace('currentColor', isDark ? '#ffffff' : '#000000'))}")`,
                     backgroundSize: `${config.headerPatternScale || 100}%`,
                     opacity: (config.headerPatternOpacity || 20) / 100
                   }} />
            )}
        </div>
      )}

      <div className="flex flex-col flex-1 px-4 sm:px-6" style={bodyContentStyles}>
        {config.avatarStyle !== 'none' && (
          <div className={`relative ${getAvatarRadiusClasses()} z-30 shrink-0 mx-auto transition-all`} 
               style={{ 
                 width: `${config.avatarSize}px`, height: `${config.avatarSize}px`, 
                 transform: `translate(${config.avatarOffsetX || 0}px, ${config.avatarOffsetY || 0}px)`,
                 padding: `${config.avatarBorderWidth ?? 4}px`, 
                 backgroundColor: showAnimatedBorder ? 'transparent' : (config.avatarBorderColor || '#ffffff'),
                 boxShadow: config.avatarAnimatedGlow ? `0 0 20px rgba(${hexToRgb(borderClr1).string}, 0.5)` : '0 20px 40px rgba(0,0,0,0.1)'
               }}>
            
            {showAnimatedBorder && (
              <div className="absolute inset-0 z-[-1] pointer-events-none overflow-hidden" style={{ borderRadius: config.avatarStyle === 'circle' ? '50%' : (config.avatarStyle === 'square' ? '0' : '28%') }}>
                <div 
                  className="absolute inset-[-100%] animate-spin-slow"
                  style={{ 
                    background: `conic-gradient(from 0deg, transparent, ${borderClr1}, ${borderClr2}, transparent 60%)`,
                    animationDuration: `${borderSpeed}s`
                  }}
                />
              </div>
            )}

            <div className={`w-full h-full ${getAvatarRadiusClasses(true)} overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center`}>
              {data.profileImage ? <img src={data.profileImage} className="w-full h-full object-cover" /> : <Camera size={40} className="text-gray-200" />}
            </div>
          </div>
        )}

        <div className={`w-full ${config.spacing === 'relaxed' ? 'space-y-6' : config.spacing === 'compact' ? 'space-y-2' : 'space-y-4'} relative z-10`} style={{ marginTop: hideHeader ? '20px' : (headerType === 'overlay' ? '20px' : '24px') }}>
           
           {showName && (
             <div className="flex flex-col items-center justify-center gap-1">
                <div className="flex items-center justify-center gap-2">
                  <h2 className="font-black leading-tight" style={{ color: nameColor, transform: `translateY(${config.nameOffsetY}px)`, fontSize: `${config.nameSize}px` }}>
                    {finalName}
                  </h2>
                  {isVerified && <CheckCircle size={config.nameSize * 0.7} className="text-blue-500 animate-pulse" />}
                </div>
                {showStars && (
                   <div className="flex items-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="#fbbf24" className="text-yellow-400" />)}
                   </div>
                )}
             </div>
           )}

           {(showTitle || showCompany) && (
             <p className="font-bold opacity-80" style={{ color: titleColor, transform: `translateY(${config.titleOffsetY || 0}px)`, fontSize: '14px' }}>
               {showTitle && finalTitle}
               {(showTitle && showCompany) && finalTitle && finalCompany && ' • '}
               {showCompany && finalCompany}
             </p>
           )}

           {showBodyFeature && featureContent && (
             <div 
               className={`py-3 px-4 shadow-xl flex items-center justify-center gap-3 transition-all duration-500 animate-fade-in-up relative z-40`}
               style={{ 
                 color: featureTextColor,
                 transform: `translateY(${featureOffsetY}px)`,
                 marginLeft: `-${featurePaddingX}px`,
                 marginRight: `-${featurePaddingX}px`,
                 borderRadius: `${featureRadius}px`,
                 minHeight: `${featureHeight}px`,
                 backdropFilter: isFeatureGlassy ? 'blur(10px)' : 'none',
                 WebkitBackdropFilter: isFeatureGlassy ? 'blur(10px)' : 'none',
                 border: isFeatureGlassy ? `1px solid rgba(${hexToRgb(featureBg).string}, 0.3)` : 'none',
                 background: isFeatureGlassy 
                    ? `rgba(${hexToRgb(featureBg).string}, 0.15)` 
                    : featureBg
               }}
             >
                <Sparkle size={14} className="animate-pulse shrink-0" />
                <span className="text-xs font-black uppercase tracking-tight text-center">{featureContent}</span>
                <Sparkle size={14} className="animate-pulse shrink-0" />
             </div>
           )}

           {showBio && finalBio && (
             <div className="mx-auto relative group overflow-hidden" style={bioStyles}>
                <Quote size={12} className="absolute top-3 left-4 opacity-20 text-blue-500" />
               <p className="font-bold leading-relaxed italic" style={{ color: bTextColor, fontSize: `${config.bioSize}px` }}>
                 {finalBio}
               </p>
             </div>
           )}

           {hasDirectLinks ? (
              <div 
                className={`w-full px-2 animate-fade-in-up flex flex-col items-center gap-3`}
                style={{ 
                  transform: `translateY(${config.linksSectionOffsetY || 0}px)`,
                  padding: `${config.linksSectionPadding || 0}px`
                }}
              >
                <div 
                  className={`w-full transition-all duration-500 flex flex-col items-center ${dLinksShowBg ? 'shadow-xl' : 'shadow-none'}`}
                  style={{ 
                    borderRadius: `${dLinksRadius}px`,
                    backgroundColor: dLinksSectionBg,
                    paddingTop: dLinksShowBg ? `${dLinksSectionPaddingV}px` : '0px',
                    paddingBottom: dLinksShowBg ? `${dLinksSectionPaddingV}px` : '0px',
                    paddingLeft: dLinksShowBg ? '24px' : '0px',
                    paddingRight: dLinksShowBg ? '24px' : '0px',
                    backdropFilter: (dLinksShowBg && isDLinksGlassy) ? 'blur(15px)' : 'none',
                    WebkitBackdropFilter: (dLinksShowBg && isDLinksGlassy) ? 'blur(15px)' : 'none',
                    border: (isDark && dLinksShowBg) ? '1px solid rgba(255,255,255,0.1)' : (!isDark && dLinksShowBg ? '1px solid rgba(0,0,0,0.05)' : 'none')
                  }}
                >
                   <div className={`flex flex-wrap items-center justify-center gap-4 ${!dLinksShowText ? 'flex-row' : (dLinksVariant === 'grid' ? 'grid grid-cols-2' : (dLinksVariant === 'pills' ? 'flex-row' : 'flex-col'))} w-full`}>
                      {showEmail && finalEmails.map((email, idx) => (
                        <a 
                          key={`em-${idx}`}
                          href={`mailto:${email}`} 
                          className={`flex items-center gap-3 text-sm font-bold opacity-80 hover:opacity-100 transition-all hover:scale-[1.03] active:scale-95 justify-center ${!dLinksShowText ? 'w-12 h-12 p-0' : (dLinksVariant === 'pills' ? 'px-6 py-3 shadow-md' : 'w-full px-4 py-2 border border-white/10')}`} 
                          style={{ 
                            color: dLinksTextColor, 
                            backgroundColor: dLinksItemBg,
                            borderRadius: !dLinksShowText ? '999px' : `${dLinksItemRadius}px` 
                          }}
                          title={!dLinksShowText ? email : ''}
                        >
                          <div className={`shrink-0 ${dLinksVariant === 'pills' || !dLinksShowText ? '' : 'p-2 bg-white/10 rounded-xl shadow-sm'}`} style={{ color: dLinksIconColor }}>
                            <Mail size={!dLinksShowText ? 22 : 18} />
                          </div>
                          {dLinksShowText && <span className="break-all text-start leading-tight">{email}</span>}
                        </a>
                      ))}
                      {showWebsite && finalWebsites.map((web, idx) => (
                        <a 
                          key={`web-${idx}`}
                          href={web.startsWith('http') ? web : `https://${web}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 text-sm font-bold opacity-80 hover:opacity-100 transition-all hover:scale-[1.03] active:scale-95 justify-center ${!dLinksShowText ? 'w-12 h-12 p-0' : (dLinksVariant === 'pills' ? 'px-6 py-3 shadow-md' : 'w-full px-4 py-2 border border-white/10')}`} 
                          style={{ 
                            color: dLinksTextColor, 
                            backgroundColor: dLinksItemBg,
                            borderRadius: !dLinksShowText ? '999px' : `${dLinksItemRadius}px`
                          }}
                          title={!dLinksShowText ? web : ''}
                        >
                          <div className={`shrink-0 ${dLinksVariant === 'pills' || !dLinksShowText ? '' : 'p-2 bg-white/10 rounded-xl shadow-sm'}`} style={{ color: dLinksIconColor }}>
                            {config.linksWebsiteIconType === 'store' ? <ShoppingCart size={!dLinksShowText ? 22 : 18} /> : <Globe size={!dLinksShowText ? 22 : 18} />}
                          </div>
                          {dLinksShowText && <span className="break-all text-start leading-tight">{web}</span>}
                        </a>
                      ))}
                   </div>
                </div>
              </div>
           ) : null}

           {hasContactButtons && (
              <div 
                className="flex flex-row items-center justify-center w-full mt-6 px-2" 
                style={{ 
                  transform: `translateY(${config.contactButtonsOffsetY || 0}px)`,
                  gap: `${cbGap}px`
                }}
              >
                {showPhone && data.phone && (
                  <a href={`tel:${data.phone}`} style={getContactBtnStyle(phoneBtnColor)} className="flex-1 flex items-center justify-center gap-2 px-3 text-white font-black text-[10px] shadow-lg hover:brightness-110 transition-all min-w-0">
                    <Phone size={14} className="shrink-0" /> <span className="truncate">{t('call')}</span>
                  </a>
                )}
                {showWhatsapp && data.whatsapp && (
                  <a href={`https://wa.me/${data.whatsapp}`} target="_blank" style={getContactBtnStyle(whatsappBtnColor)} className="flex-1 flex items-center justify-center gap-2 px-3 text-white font-black text-[10px] shadow-lg hover:brightness-110 transition-all min-w-0">
                    <MessageCircle size={14} className="shrink-0" /> <span className="truncate">{t('whatsappBtn')}</span>
                  </a>
                )}
                {!hideSaveButton && showButtons && (
                  <button onClick={() => downloadVCard(data)} className="flex-1 py-4 flex items-center justify-center gap-3 px-3 rounded-2xl bg-gray-900 text-white font-black text-[10px] shadow-lg hover:bg-black transition-all min-w-0">
                    <UserPlus size={14} className="shrink-0" /> <span className="truncate">{t('saveContact')}</span>
                  </button>
                )}
              </div>
           )}

           {showMembership && (data.membershipExpiryDate || config.membershipExpiryDate) && (
              <div 
                className="w-full px-2 mt-4"
                style={{ transform: `translateY(${data.membershipOffsetY ?? config.membershipOffsetY ?? 0}px)` }}
              >
                 <MembershipBar 
                    startDate={data.membershipStartDate || config.membershipStartDate} 
                    expiryDate={data.membershipExpiryDate || config.membershipExpiryDate} 
                    title={isRtl ? (data.membershipTitleAr || config.membershipTitleAr) : (data.membershipTitleEn || config.membershipTitleEn)}
                    isDark={isDark}
                    isGlassy={data.membershipGlassy ?? config.membershipGlassy}
                    bgColor={data.membershipBgColor || config.membershipBgColor}
                    borderColor={data.membershipBorderColor || config.membershipBorderColor}
                    textColor={data.membershipTextColor || config.membershipTextColor}
                    accentColor={data.membershipAccentColor || config.membershipAccentColor}
                 />
              </div>
           )}

           {showSpecialLinks && finalSpecialLinks.length > 0 && (
              <div 
                className={`grid w-full px-2 animate-fade-in-up`}
                style={{ 
                  gridTemplateColumns: `repeat(${slCols}, 1fr)`,
                  gap: `${slGap}px`,
                  transform: `translateY(${slOffsetY}px)`
                }}
              >
                {finalSpecialLinks.map((link) => (
                  <a 
                    key={link.id} 
                    href={link.linkUrl} 
                    target="_blank" 
                    className="group relative overflow-hidden shadow-lg transition-all duration-500 hover:scale-[1.03] active:scale-95"
                    style={{ 
                      borderRadius: `${slRadius}px`,
                      aspectRatio: slAspect === 'square' ? '1/1' : (slAspect === 'video' ? '16/9' : '3/4')
                    }}
                  >
                    <img src={link.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Link Image" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <ExternalLink size={24} className="text-white drop-shadow-lg" />
                    </div>
                    {(isRtl ? link.titleAr : link.titleEn) && (
                       <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <p className="text-[10px] font-black text-white text-center truncate">{isRtl ? link.titleAr : link.titleEn}</p>
                       </div>
                    )}
                  </a>
                ))}
              </div>
           )}

           {showLocation && data.locationUrl && (
             <div className="w-full px-2 animate-fade-in-up" style={{ transform: `translateY(${config.locationOffsetY || 0}px)` }}>
               <a 
                 href={data.locationUrl} 
                 target="_blank" 
                 className={`flex items-center gap-4 transition-all duration-500 hover:scale-[1.02] shadow-xl group relative overflow-hidden`}
                 style={{ 
                   borderRadius: `${locRadius}px`, 
                   backgroundColor: locBg,
                   paddingTop: `${locPaddingV}px`,
                   paddingBottom: `${locPaddingV}px`,
                   paddingLeft: '20px',
                   paddingRight: '20px',
                   backdropFilter: isLocGlassy ? 'blur(15px)' : 'none',
                   WebkitBackdropFilter: isLocGlassy ? 'blur(15px)' : 'none',
                   border: (isDark) ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)'
                 }}
               >
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl shadow-md text-blue-600 transition-transform group-hover:rotate-12" style={{ color: locIconColor }}>
                   <MapIcon size={22} />
                 </div>
                 <div className="flex-1 text-start min-w-0">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1 leading-none">{t('locationSection')}</h4>
                   <p className="font-bold dark:text-white truncate leading-tight" style={{ color: locTextColor, fontSize: `${locAddressSize}px` }}>{data.location || t('visitUs')}</p>
                 </div>
                 <div className="shrink-0 p-2 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-600/20 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0" style={{ backgroundColor: themeColor }}>
                   <Navigation2 size={14} />
                 </div>
               </a>
             </div>
           )}

           {showSocialLinks && data.socialLinks?.length > 0 && (
             <div 
               className={`grid justify-center py-6 mx-auto ${sCols > 0 ? `grid-cols-${sCols}` : 'flex flex-wrap'}`} 
               style={{ 
                 transform: `translateY(${config.socialLinksOffsetY || 0}px)`,
                 gap: `${sGap}px`,
                 maxWidth: '100%'
               }}
             >
               {data.socialLinks.map((link, idx) => (
                 <a 
                   key={idx} 
                   href={link.url} 
                   target="_blank" 
                   className="hover:scale-110 active:scale-95"
                   style={getSocialBtnStyles(link.platformId)}
                 >
                   <SocialIcon 
                    platformId={link.platformId} 
                    size={sSize} 
                    color={(useBrandColors && sVariant === 'filled') ? '#ffffff' : (BRAND_COLORS[link.platformId] && useBrandColors ? BRAND_COLORS[link.platformId] : sColor)} 
                   />
                 </a>
               ))}
             </div>
           )}

           {showQrCode && (
             <div className="pt-12 flex flex-col items-center gap-3" style={{ transform: `translateY(${qrOffsetY}px)` }}>
               <div className="transition-all duration-700 overflow-hidden shadow-2xl p-1 bg-white" 
                    style={{ 
                      border: `${qrBorderWidth}px solid ${qrBorderColor}`, 
                      borderRadius: `${qrBorderRadius}px`, 
                      padding: `${config.qrPadding || 4}px`
                    }}>
                  <img src={qrImageUrl} alt="QR" style={{ width: `${qrSize}px`, height: `${qrSize}px` }} />
               </div>
               <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] opacity-40">{t('showQrCode')}</span>
             </div>
           )}
        </div>
      </div>
      <div className="h-24 shrink-0" />
    </div>
  );
};

export default CardPreview;
