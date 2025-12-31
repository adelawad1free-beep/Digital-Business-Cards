
import { Mail, Phone, Globe, MessageCircle, UserPlus, Camera } from 'lucide-react';
import React from 'react';
import { CardData, Language, TemplateConfig } from '../types';
import { TRANSLATIONS } from '../constants';
import { downloadVCard } from '../utils/vcard';
import SocialIcon from './SocialIcon';

interface CardPreviewProps {
  data: CardData;
  lang: Language;
  customConfig?: TemplateConfig; 
}

const CardPreview: React.FC<CardPreviewProps> = ({ data, lang, customConfig }) => {
  const isRtl = lang === 'ar';
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];

  const themeType = data.themeType;
  const themeColor = data.themeColor;
  const themeGradient = data.themeGradient;
  const backgroundImage = data.backgroundImage;
  const isDark = data.isDark;

  const nameColor = data.nameColor || customConfig?.nameColor || (isDark ? '#ffffff' : '#111827');
  const titleColor = data.titleColor || customConfig?.titleColor || '#2563eb';
  const bioTextColor = data.bioTextColor || customConfig?.bioTextColor || (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)');
  const bioBgColor = data.bioBgColor || customConfig?.bioBgColor || (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)');
  const linksColor = data.linksColor || customConfig?.linksColor || '#3b82f6';

  const getThemeStyles = () => {
    if (themeType === 'image' && backgroundImage) return { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    if (themeType === 'gradient') return { background: themeGradient };
    return { backgroundColor: themeColor };
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
          <a href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`} target="_blank" className={`flex items-center justify-center gap-2 bg-emerald-500 text-white font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-[10px] uppercase ${compact ? 'py-3' : 'py-4'} ${radius}`}>
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

  const renderCustomTemplate = (cfg: TemplateConfig) => {
    const alignClass = cfg.contentAlign === 'center' 
      ? 'text-center items-center' 
      : (cfg.contentAlign === 'end' ? 'text-end items-end' : 'text-start items-start');
      
    const spacingClass = cfg.spacing === 'compact' ? 'space-y-4' : (cfg.spacing === 'relaxed' ? 'space-y-10' : 'space-y-6');

    // نمط 1: كلاسيك (Classic) - خلفية بالأعلى، الصورة بالمنتصف
    if (cfg.headerType === 'classic') {
      return (
        <div className={`flex flex-col h-full min-h-[600px] ${spacingClass}`}>
          <div className="w-full shrink-0" style={{ ...getThemeStyles(), height: `${cfg.headerHeight || 160}px` }} />
          <div className={`px-8 flex-1 flex flex-col ${alignClass} relative z-10 -mt-[60px]`}>
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

    // نمط 2: منقسم (Split) - الصورة والمعلومات في صف واحد داخل الترويسة
    if (cfg.headerType === 'split') {
      return (
        <div className={`flex flex-col h-full min-h-[600px] ${spacingClass}`}>
          <div className="w-full shrink-0 flex items-center px-8" style={{ ...getThemeStyles(), height: `${cfg.headerHeight || 200}px` }}>
            <div className={`flex items-center gap-6 w-full ${isRtl ? 'flex-row' : 'flex-row'}`}>
               {cfg.avatarStyle !== 'none' && <ProfileImage size={(cfg.avatarSize || 120) * 0.9} circle={cfg.avatarStyle === 'circle'} squircle={cfg.avatarStyle === 'squircle'} className="shadow-white/20" />}
               <div className="flex flex-col justify-center min-w-0">
                  <h2 className="font-black leading-tight text-white drop-shadow-lg truncate" style={{ fontSize: `${(cfg.nameSize || 24) * 0.9}px` }}>{data.name}</h2>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/90 drop-shadow-sm truncate">{data.title}</p>
               </div>
            </div>
          </div>
          <div className={`px-8 flex-1 flex flex-col ${alignClass} mt-4`}>
            {renderCommonContent(cfg, alignClass)}
          </div>
        </div>
      );
    }

    // نمط 3: متداخل (Overlay) - خلفية كبيرة وبطاقة محتوى عائمة
    if (cfg.headerType === 'overlay') {
      return (
        <div className={`flex flex-col h-full min-h-[600px] relative`}>
          <div className="absolute top-0 left-0 w-full z-0" style={{ ...getThemeStyles(), height: `${cfg.headerHeight || 280}px` }} />
          <div className={`relative z-10 px-5 pt-[100px] pb-10 flex flex-col items-center`}>
            <div className={`w-full bg-white dark:bg-gray-900 rounded-[3rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] p-8 flex flex-col ${alignClass} border border-gray-100 dark:border-gray-800`}>
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

    // نمط 4: البانورامي (Hero) - صورة كبيرة تتوسط الخلفية الملونة
    if (cfg.headerType === 'hero') {
      return (
        <div className={`flex flex-col h-full min-h-[600px] ${spacingClass}`}>
           <div className="w-full shrink-0 flex flex-col items-center justify-center px-8 relative" style={{ ...getThemeStyles(), height: `${cfg.headerHeight || 320}px` }}>
              <div className="absolute inset-0 bg-black/20 z-0"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                 {cfg.avatarStyle !== 'none' && <ProfileImage size={(cfg.avatarSize || 120) * 1.1} circle={cfg.avatarStyle === 'circle'} squircle={cfg.avatarStyle === 'squircle'} className="border-4 border-white/30" />}
                 <div className="mt-6 space-y-1">
                    <h2 className="font-black leading-tight text-white drop-shadow-xl" style={{ fontSize: `${cfg.nameSize || 26}px` }}>{data.name}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/90 drop-shadow-lg">{data.title}</p>
                 </div>
              </div>
           </div>
           <div className={`px-8 flex-1 flex flex-col ${alignClass} mt-6`}>
              {renderCommonContent(cfg, alignClass)}
           </div>
        </div>
      );
    }

    // نمط 5: بسيط (Minimal) - ترويسة نحيفة جداً أو غير موجودة
    return (
      <div className={`flex flex-col h-full min-h-[600px] p-8 ${alignClass} ${spacingClass}`}>
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
      <div 
        className={`mt-6 w-full p-6 rounded-[2.5rem] border ${isDark ? 'border-white/10' : 'border-gray-100'} ${alignClass}`}
        style={{ transform: `translateY(${cfg.bioOffsetY || 0}px)`, backgroundColor: bioBgColor }}
      >
        <p className="font-medium leading-relaxed italic" style={{ fontSize: `${cfg.bioSize || 13}px`, color: bioTextColor }}>"{data.bio}"</p>
      </div>

      <div className={`w-full flex flex-col gap-2 mt-6 ${alignClass}`}>
        {data.email && (
          <a href={`mailto:${data.email}`} className="flex items-center gap-3 text-[11px] font-black" style={{ transform: `translateY(${cfg.emailOffsetY || 0}px)`, color: linksColor }}>
            <Mail size={15} /> {data.email}
          </a>
        )}
        {data.website && (
          <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" className="flex items-center gap-3 text-[11px] font-black" style={{ transform: `translateY(${cfg.websiteOffsetY || 0}px)`, color: linksColor }}>
            <Globe size={15} /> {data.website.replace(/(^\w+:|^)\/\//, '')}
          </a>
        )}
      </div>

      <div className="w-full">
        <ContactButtons grid style={cfg.buttonStyle} offsetY={cfg.contactButtonsOffsetY || 0} />
      </div>

      <SocialLinks justify={cfg.contentAlign} offsetY={cfg.socialLinksOffsetY || 0} />
      
      <button onClick={() => downloadVCard(data)} className="w-full mt-6 py-5 bg-slate-900 dark:bg-white dark:text-gray-950 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all">
          <UserPlus size={18} /> {t('saveContact')}
      </button>
    </React.Fragment>
  );

  return (
    <div className={`w-full max-w-sm mx-auto rounded-[3.5rem] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden border-4 transition-all duration-500 transform hover:scale-[1.01] ${isDark ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'} ${isRtl ? 'rtl' : 'ltr'}`}>
      {renderCustomTemplate(customConfig || {
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
      })}
      <div className="pb-8"></div>
    </div>
  );
};

export default CardPreview;
