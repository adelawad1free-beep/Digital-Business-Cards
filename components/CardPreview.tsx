
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

  // استخدام سمات القالب إذا لم يقم المستخدم بتخصيصها، أو إذا كان القالب يفرض هوية معينة
  const themeType = customConfig?.defaultThemeType || data.themeType;
  const themeColor = customConfig?.defaultThemeColor || data.themeColor;
  const themeGradient = customConfig?.defaultThemeGradient || data.themeGradient;
  const backgroundImage = customConfig?.defaultBackgroundImage || data.backgroundImage;
  const isDark = customConfig?.defaultIsDark !== undefined ? customConfig.defaultIsDark : data.isDark;

  const getThemeStyles = () => {
    if (themeType === 'image' && backgroundImage) return { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    if (themeType === 'gradient') return { background: themeGradient };
    return { backgroundColor: themeColor };
  };

  const getAccentBackground = () => themeType === 'gradient' ? { background: themeGradient } : { backgroundColor: themeColor };

  const ProfileImage = ({ size = 128, circle = false, squircle = false, offsetY = 0, offsetX = 0 }) => {
    const accentColor = themeColor || '#3b82f6';
    const borderRadius = circle ? 'rounded-full' : (squircle ? 'rounded-[20%]' : 'rounded-[25%]');
    
    return (
      <div 
        className={`relative p-[2px] ${borderRadius} overflow-hidden group shadow-2xl z-20`}
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

  const SocialLinks = ({ justify = "center", offsetY = 0 }) => (
    <div 
      className={`flex flex-wrap justify-${justify} gap-3 mt-8`}
      style={{ transform: `translateY(${offsetY}px)` }}
    >
      {data.socialLinks.map((link, i) => (
        <a key={i} href={link.url} target="_blank" className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all hover:scale-110 hover:-translate-y-1 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-100 shadow-sm'}`}>
          <SocialIcon platformId={link.platformId} size={18} color={isDark ? "white" : "#1f2937"} />
        </a>
      ))}
    </div>
  );

  const renderCustomTemplate = (cfg: TemplateConfig) => {
    const alignClass = cfg.contentAlign === 'center' ? 'text-center items-center' : (cfg.contentAlign === 'end' ? (isRtl ? 'text-left items-start' : 'text-right items-end') : (isRtl ? 'text-right items-end' : 'text-left items-start'));
    const spacingClass = cfg.spacing === 'compact' ? 'space-y-4' : (cfg.spacing === 'relaxed' ? 'space-y-10' : 'space-y-6');

    return (
      <div className={`flex flex-col h-full min-h-[600px] ${spacingClass}`}>
        {cfg.headerType !== 'minimal' && (
           <div 
             className="w-full relative shrink-0" 
             style={{ ...getThemeStyles(), height: `${cfg.headerHeight || 160}px` }} 
           />
        )}
        
        <div className={`px-8 flex-1 flex flex-col ${alignClass} relative z-10`} style={{ marginTop: cfg.headerType === 'minimal' ? '40px' : '-60px' }}>
           {cfg.avatarStyle !== 'none' && (
              <ProfileImage 
                size={cfg.avatarSize || 120}
                offsetY={cfg.avatarOffsetY || 0}
                offsetX={cfg.avatarOffsetX || 0}
                circle={cfg.avatarStyle === 'circle'} 
                squircle={cfg.avatarStyle === 'squircle'} 
              />
           )}
           
           <div 
             className={`w-full ${alignClass} space-y-2 mt-4`}
             style={{ transform: `translateY(${cfg.nameOffsetY || 0}px)` }}
           >
              <h2 className={`font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontSize: `${cfg.nameSize || 24}px` }}>{data.name}</h2>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{data.title} • {data.company}</p>
           </div>

           <div 
             className={`mt-6 w-full ${isDark ? 'bg-white/5' : 'bg-gray-50'} p-5 rounded-[2rem] border ${isDark ? 'border-white/10' : 'border-gray-100'} ${alignClass}`}
             style={{ transform: `translateY(${cfg.bioOffsetY || 0}px)` }}
           >
              <p className="font-medium leading-relaxed opacity-70 italic text-center" style={{ fontSize: `${cfg.bioSize || 12}px` }}>"{data.bio}"</p>
           </div>

           <div className={`w-full flex flex-col gap-2 mt-4 ${alignClass}`}>
              {data.email && (
                <a href={`mailto:${data.email}`} className="flex items-center gap-2 text-[11px] font-black text-blue-500" style={{ transform: `translateY(${cfg.emailOffsetY || 0}px)` }}>
                  <Mail size={14} /> {data.email}
                </a>
              )}
              {data.website && (
                <a href={data.website.startsWith('http') ? data.website : `https://${data.website}`} target="_blank" className="flex items-center gap-2 text-[11px] font-black text-gray-500" style={{ transform: `translateY(${cfg.websiteOffsetY || 0}px)` }}>
                  <Globe size={14} /> {data.website.replace(/(^\w+:|^)\/\//, '')}
                </a>
              )}
           </div>

           <div className="w-full">
              <ContactButtons grid style={cfg.buttonStyle} offsetY={cfg.contactButtonsOffsetY || 0} />
           </div>

           <SocialLinks justify={cfg.contentAlign} offsetY={cfg.socialLinksOffsetY || 0} />
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full max-w-sm mx-auto rounded-[3.5rem] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden border-4 transition-all duration-500 transform hover:scale-[1.01] ${isDark ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'} ${isRtl ? 'rtl' : 'ltr'}`}>
      {customConfig ? renderCustomTemplate(customConfig) : (
        <div className="flex flex-col h-full">
          <div className="h-48 w-full relative overflow-hidden" style={getThemeStyles()} />
          <div className="relative px-8 -mt-24 text-center z-10 pb-12">
            <ProfileImage />
            <div className="mt-8 space-y-2">
              <h2 className="text-3xl font-black truncate dark:text-white">{data.name}</h2>
              <p className="font-black text-[11px] tracking-[0.2em] uppercase text-blue-600">{data.title}</p>
            </div>
            <div className={`mt-8 p-6 rounded-[2.5rem] border ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
              <p className="text-sm font-medium leading-relaxed opacity-80 italic">"{data.bio}"</p>
            </div>
            <ContactButtons grid />
            <button onClick={() => downloadVCard(data)} className="w-full mt-4 py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg flex items-center justify-center gap-3">
               <UserPlus size={18} /> {t('saveContact')}
            </button>
            <SocialLinks />
          </div>
        </div>
      )}
      <div className="pb-6"></div>
    </div>
  );
};

export default CardPreview;
