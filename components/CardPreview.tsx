
import { Mail, Phone, Globe, MessageCircle, UserPlus, Camera, Download, QrCode, Cpu } from 'lucide-react';
import React from 'react';
import { CardData, Language, TemplateConfig } from '../types';
import { TRANSLATIONS } from '../constants';
import { downloadVCard } from '../utils/vcard';
import { generateShareUrl } from '../utils/share';
import SocialIcon from './SocialIcon';

interface CardPreviewProps {
  data: CardData;
  lang: Language;
  customConfig?: TemplateConfig; 
  hideSaveButton?: boolean; 
}

const CardPreview: React.FC<CardPreviewProps> = ({ data, lang, customConfig, hideSaveButton = false }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];

  // تأمين القيم الافتراضية
  const themeType = data.themeType || 'gradient';
  const themeColor = data.themeColor || '#3b82f6';
  const themeGradient = data.themeGradient || 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
  const backgroundImage = data.backgroundImage;
  const isDark = data.isDark;

  const nameColor = data.nameColor || customConfig?.nameColor || (isDark ? '#ffffff' : '#111827');
  const titleColor = data.titleColor || customConfig?.titleColor || '#2563eb';
  const bioTextColor = data.bioTextColor || customConfig?.bioTextColor || (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)');
  const bioBgColor = data.bioBgColor || customConfig?.bioBgColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)');
  const linksColor = data.linksColor || customConfig?.linksColor || '#3b82f6';

  const cardUrl = generateShareUrl(data);
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(cardUrl)}&bgcolor=${isDark ? '111115' : 'ffffff'}&color=${(themeColor || '#3b82f6').replace('#', '')}&margin=2`;

  const getThemeStyles = () => {
    const opacity = (customConfig?.headerOpacity ?? 100) / 100;
    const isGlassy = customConfig?.headerGlassy;
    
    let baseStyle: React.CSSProperties = {};
    
    if (themeType === 'image' && backgroundImage) {
      baseStyle = { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    } else if (themeType === 'gradient') {
      baseStyle = { background: themeGradient };
    } else {
      baseStyle = { backgroundColor: themeColor };
    }

    if (isGlassy) {
      return {
        ...baseStyle,
        opacity: opacity,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      };
    }

    return baseStyle;
  };

  const getBodyStyles = (): React.CSSProperties => {
    const opacity = (customConfig?.bodyOpacity ?? 100) / 100;
    const isGlassy = customConfig?.bodyGlassy;
    
    if (isGlassy) {
      return {
        backgroundColor: isDark ? `rgba(15, 15, 20, ${opacity})` : `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.3)',
      };
    }
    return {};
  };

  const getAccentBackground = () => themeType === 'gradient' ? { background: themeGradient } : { backgroundColor: themeColor };

  const ProfileImage = ({ size = 128, circle = false, squircle = false, offsetY = 0, offsetX = 0, className = "" }) => {
    const accentColor = themeColor || '#3b82f6';
    const borderRadius = circle ? 'rounded-full' : (squircle ? 'rounded-[20%]' : 'rounded-[25%]');
    
    return (
      <div 
        className={`relative p-[2px] ${borderRadius} overflow-hidden group shadow-2xl z-20 shrink-0 ${className}`}
        style={{ 
          width: `${size}px`, 
          height: `${size}px`,
          transform: `translate(${offsetX}px, ${offsetY}px)`
        }}
      >
        <div 
          className="absolute inset-[-100%] animate-[spin_5s_linear_infinite] opacity-40 group-hover:opacity-100 transition-all duration-700"
          style={{ background: `conic-gradient(from 0deg, transparent, ${accentColor}, transparent 30%, ${accentColor}, transparent)` }}
        />
        <div className={`relative w-full h-full ${borderRadius} overflow-hidden bg-gray-100 dark:bg-gray-800 z-10 flex items-center justify-center`}>
          {data.profileImage ? (
            <img src={data.profileImage} className="w-full h-full object-cover scale-[1.01]" alt={data.name} />
          ) : (
            <Camera className="w-1/2 h-1/2 text-gray-400 opacity-40" />
          )}
        </div>
      </div>
    );
  };

  const ContactButtons = ({ grid = false, compact = false, style = 'pill', offsetY = 0 }) => {
    const radius = style === 'pill' ? 'rounded-full' : (style === 'square' ? 'rounded-xl' : 'rounded-2xl');
    const bg = style === 'glass' ? 'bg-white/10 backdrop-blur-md border border-white/20' : '';
    
    return (
      <div 
        className={`mt-6 ${grid ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}
        style={{ transform: `translateY(${offsetY}px)` }}
      >
        {data.phone && (
          <a href={`tel:${data.phone}`} className={`flex items-center justify-center gap-2 font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-[10px] uppercase ${compact ? 'py-3' : 'py-4'} ${radius} ${bg} ${style !== 'glass' ? 'text-white' : ''}`} style={style !== 'glass' ? getAccentBackground() : {}}>
            <Phone size={compact ? 14 : 16} /> <span>{t('call')}</span>
          </a>
        )}
        {data.whatsapp && (
          <a href={`https://wa.me/${(data.whatsapp || '').replace(/\D/g, '')}`} target="_blank" className={`flex items-center justify-center gap-2 bg-emerald-500 text-white font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-[10px] uppercase ${compact ? 'py-3' : 'py-4'} ${radius}`}>
            <MessageCircle size={compact ? 14 : 16} /> <span>{t('whatsappBtn')}</span>
          </a>
        )}
      </div>
    );
  };

  const SocialLinks = ({ justify = "center", offsetY = 0 }) => {
    const justifyClass = justify === 'center' ? 'justify-center' : (justify === 'end' ? 'justify-end' : 'justify-start');
    
    return (
      <div 
        className={`flex flex-wrap ${justifyClass} gap-3 mt-8`}
        style={{ transform: `translateY(${offsetY}px)` }}
      >
        {data.socialLinks.map((link, i) => (
          <a key={i} href={link.url} target="_blank" className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all hover:scale-110 hover:-translate-y-1 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-100 shadow-sm'}`}>
            <SocialIcon platformId={link.platformId} size={18} color={isDark ? "white" : "#1f2937"} />
          </a>
        ))}
      </div>
    );
  };

  const CompactQRCode = () => {
    const qrSize = customConfig?.qrSize || 90;
    const qrY = customConfig?.qrOffsetY || 0;
    
    return (
      <div 
        className="mt-2 flex flex-col items-center animate-fade-in"
        style={{ transform: `translateY(${qrY}px)` }}
      >
         <div className="relative group cursor-pointer">
            <div className="absolute -inset-2 bg-blue-500/10 dark:bg-blue-400/5 rounded-3xl blur-lg group-hover:blur-xl transition-all"></div>
            <div 
              className={`relative p-2 rounded-2xl border transition-all duration-500 group-hover:scale-105 ${isDark ? 'bg-[#111115] border-white/5' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`}
              style={{ width: `${qrSize}px`, height: `${qrSize}px` }}
            >
               <img src={qrImageUrl} alt="Card QR" className="w-full h-full" />
               <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-lg shadow-lg">
                  <QrCode size={10} />
               </div>
            </div>
         </div>
         <div className="mt-2 flex items-center gap-2 opacity-40 pb-2">
            <Cpu size={10} className="text-blue-500" />
            <span className="text-[7px] font-black uppercase tracking-[0.3em] dark:text-gray-400">
               {isRtl ? 'اتصال ذكي • NFC تدعم' : 'Smart Connect • NFC Support'}
            </span>
         </div>
      </div>
    );
  };

  const renderCustomTemplate = (cfg: TemplateConfig) => {
    const alignClass = cfg.contentAlign === 'center' 
      ? 'text-center items-center' 
      : (cfg.contentAlign === 'end' ? 'text-end items-end' : 'text-start items-start');
      
    const spacingClass = cfg.spacing === 'compact' ? 'space-y-4' : (cfg.spacing === 'relaxed' ? 'space-y-10' : 'space-y-6');

    // منطق الترويسة مع التأكد من وجود ارتفاع
    const headerHeight = cfg.headerHeight || 180;

    if (cfg.headerType === 'classic') {
      return (
        <div className={`flex flex-col h-full min-h-[600px] ${spacingClass}`}>
          <div className="w-full shrink-0" style={{ ...getThemeStyles(), height: `${headerHeight}px` }} />
          <div className={`px-8 flex-1 flex flex-col ${alignClass} relative z-10 -mt-[60px] pb-10`}>
             <div className="absolute inset-0 z-[-1] rounded-t-[3.5rem] bg-white dark:bg-gray-900" style={getBodyStyles()} />
            {cfg.avatarStyle !== 'none' && <ProfileImage size={cfg.avatarSize || 120} offsetY={cfg.avatarOffsetY || 0} offsetX={cfg.avatarOffsetX || 0} circle={cfg.avatarStyle === 'circle'} squircle={cfg.avatarStyle === 'squircle'} />}
            <div className={`w-full ${alignClass} space-y-2 mt-6`} style={{ transform: `translateY(${cfg.nameOffsetY || 0}px)` }}>
               <h2 className="font-black leading-tight" style={{ fontSize: `${cfg.nameSize || 24}px`, color: nameColor }}>{data.name}</h2>
               <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: titleColor }}>{data.title} • {data.company}</p>
            </div>
            {renderCommonContent(cfg, alignClass)}
          </div>
        </div>
      );
    }

    if (cfg.headerType === 'split') {
      return (
        <div className={`flex flex-col h-full min-h-[600px] ${spacingClass}`}>
          <div className="w-full shrink-0 flex items-center px-8" style={{ ...getThemeStyles(), height: `${headerHeight}px` }}>
            <div className={`flex items-center gap-6 w-full ${isRtl ? 'flex-row' : 'flex-row'}`}>
               {cfg.avatarStyle !== 'none' && <ProfileImage size={(cfg.avatarSize || 120) * 0.9} circle={cfg.avatarStyle === 'circle'} squircle={cfg.avatarStyle === 'squircle'} className="shadow-white/20" />}
               <div className="flex flex-col justify-center min-w-0">
                  <h2 className="font-black leading-tight text-white drop-shadow-lg truncate" style={{ fontSize: `${(cfg.nameSize || 24) * 0.9}px` }}>{data.name}</h2>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/90 drop-shadow-sm truncate">{data.title}</p>
               </div>
            </div>
          </div>
          <div className={`px-8 flex-1 flex flex-col ${alignClass} mt-4 pb-10 relative`}>
            <div className="absolute inset-0 z-[-1] bg-white dark:bg-gray-900" style={getBodyStyles()} />
            {renderCommonContent(cfg, alignClass)}
          </div>
        </div>
      );
    }

    if (cfg.headerType === 'overlay') {
      return (
        <div className={`flex flex-col h-full min-h-[600px] relative`}>
          <div className="absolute top-0 left-0 w-full z-0" style={{ ...getThemeStyles(), height: `${headerHeight}px` }} />
          <div className={`relative z-10 px-5 pt-[100px] pb-10 flex flex-col items-center`}>
            <div 
              className={`w-full bg-white dark:bg-gray-900 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] p-8 flex flex-col ${alignClass} border border-gray-100 dark:border-gray-800`}
              style={getBodyStyles()}
            >
              {cfg.avatarStyle !== 'none' && <ProfileImage className="-mt-24 mb-4" size={cfg.avatarSize || 120} circle={cfg.avatarStyle === 'circle'} squircle={cfg.avatarStyle === 'squircle'} />}
              <div className={`w-full ${alignClass} space-y-2 mt-2 text-center`}>
                 <h2 className="font-black leading-tight" style={{ fontSize: `${cfg.nameSize || 24}px`, color: nameColor }}>{data.name}</h2>
                 <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: titleColor }}>{data.title}</p>
              </div>
              {renderCommonContent(cfg, alignClass)}
            </div>
          </div>
        </div>
      );
    }

    if (cfg.headerType === 'hero') {
      return (
        <div className={`flex flex-col h-full min-h-[600px] ${spacingClass}`}>
           <div className="w-full shrink-0 flex flex-col items-center justify-center px-8 relative" style={{ ...getThemeStyles(), height: `${headerHeight}px` }}>
              <div className="absolute inset-0 bg-black/20 z-0"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                 {cfg.avatarStyle !== 'none' && <ProfileImage size={(cfg.avatarSize || 120) * 1.1} circle={cfg.avatarStyle === 'circle'} squircle={cfg.avatarStyle === 'squircle'} className="border-4 border-white/30" />}
                 <div className="mt-6 space-y-1">
                    <h2 className="font-black leading-tight text-white drop-shadow-xl" style={{ fontSize: `${cfg.nameSize || 26}px` }}>{data.name}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/90 drop-shadow-lg">{data.title}</p>
                 </div>
              </div>
           </div>
           <div className={`px-8 flex-1 flex flex-col ${alignClass} mt-6 pb-10 relative`}>
              <div className="absolute inset-0 z-[-1] bg-white dark:bg-gray-900" style={getBodyStyles()} />
              {renderCommonContent(cfg, alignClass)}
           </div>
        </div>
      );
    }

    // Default Minimal
    return (
      <div className={`flex flex-col h-full min-h-[600px] p-8 ${alignClass} ${spacingClass} relative`}>
        <div className="absolute inset-0 z-[-1] bg-white dark:bg-gray-900" style={getBodyStyles()} />
        <div className="pt-6 w-full flex flex-col items-center">
           {cfg.avatarStyle !== 'none' && <ProfileImage size={cfg.avatarSize || 110} circle={cfg.avatarStyle === 'circle'} squircle={cfg.avatarStyle === 'squircle'} />}
           <div className={`w-full ${alignClass} space-y-2 mt-8`}>
              <h2 className="font-black leading-tight" style={{ fontSize: `${cfg.nameSize || 24}px`, color: nameColor }}>{data.name}</h2>
              <div className="h-1 w-10 bg-blue-600 rounded-full my-3 opacity-40"></div>
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: titleColor }}>{data.title} • {data.company}</p>
           </div>
        </div>
        {renderCommonContent(cfg, alignClass)}
      </div>
    );
  };

  const renderCommonContent = (cfg: TemplateConfig, alignClass: string) => (
    <React.Fragment>
      {data.showBio !== false && data.bio && (
        <div 
          className={`mt-6 w-full p-6 rounded-[2.5rem] border ${isDark ? 'border-white/10' : 'border-gray-100'} ${alignClass} animate-fade-in`}
          style={{ transform: `translateY(${cfg.bioOffsetY || 0}px)`, backgroundColor: bioBgColor }}
        >
          <p className="font-medium leading-relaxed italic" style={{ fontSize: `${cfg.bioSize || 13}px`, color: bioTextColor }}>"{data.bio}"</p>
        </div>
      )}

      <div className={`w-full flex flex-col gap-2 mt-6 ${alignClass}`}>
        {data.email && (
          <a href={`mailto:${data.email}`} className="flex items-center gap-3 text-[11px] font-black" style={{ transform: `translateY(${cfg.emailOffsetY || 0}px)`, color: linksColor }}>
            <Mail size={15} /> {data.email}
          </a>
        )}
        {data.website && (
          <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" className="flex items-center gap-3 text-[11px] font-black" style={{ transform: `translateY(${cfg.websiteOffsetY || 0}px)`, color: linksColor }}>
            <Globe size={15} /> {(data.website || '').replace(/(^\w+:|^)\/\//, '')}
          </a>
        )}
      </div>

      <div className="w-full">
        <ContactButtons grid style={cfg.buttonStyle} offsetY={cfg.contactButtonsOffsetY || 0} />
      </div>

      <SocialLinks justify={cfg.contentAlign} offsetY={cfg.socialLinksOffsetY || 0} />
      
      {data.showQrCode !== false && <CompactQRCode />}
      
      {!hideSaveButton && (
        <button 
          onClick={() => downloadVCard(data)} 
          className="group relative w-full mt-8 overflow-hidden rounded-2xl p-[1px] transition-all active:scale-95 shadow-xl"
        >
            <div className="absolute inset-[-100%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.4),transparent_30%,rgba(255,255,255,0.4),transparent)]" />
            <div className="relative flex items-center justify-center gap-3 py-5 bg-gray-900 dark:bg-white dark:text-gray-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-wider transition-colors group-hover:bg-gray-800 dark:group-hover:bg-gray-100">
               <UserPlus size={18} className="group-hover:rotate-12 transition-transform" /> 
               {t('saveContact')}
               <Download size={14} className="opacity-40" />
            </div>
        </button>
      )}
    </React.Fragment>
  );

  const defaultCfg: TemplateConfig = {
    headerType: 'classic',
    headerHeight: 180,
    avatarStyle: 'circle',
    avatarSize: 120,
    avatarOffsetY: 0,
    avatarOffsetX: 0,
    nameOffsetY: 0,
    bioOffsetY: 0,
    emailOffsetY: 0,
    websiteOffsetY: 0,
    contactButtonsOffsetY: 0,
    socialLinksOffsetY: 0,
    contentAlign: 'center',
    buttonStyle: 'pill',
    animations: 'fade',
    spacing: 'normal',
    nameSize: 26,
    bioSize: 13
  };

  return (
    <div className={`w-full max-w-sm mx-auto rounded-[3.5rem] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden border-4 transition-all duration-500 transform hover:scale-[1.01] ${isDark ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'} ${isRtl ? 'rtl' : 'ltr'}`}>
      {renderCustomTemplate(customConfig || defaultCfg)}
      <div className="pb-8"></div>
    </div>
  );
};

export default CardPreview;
