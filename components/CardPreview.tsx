
import React from 'react';
import { CardData, Language } from '../types';
import { Mail, Phone, Globe, MapPin, MessageCircle, User } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import SocialIcon from './SocialIcon';

interface CardPreviewProps {
  data: CardData;
  lang: Language;
}

const CardPreview: React.FC<CardPreviewProps> = ({ data, lang }) => {
  const isRtl = lang === 'ar';
  const isDark = data.isDark;
  const t = (key: string) => TRANSLATIONS[key][lang];

  // الصورة الافتراضية
  const defaultImage = (
    <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
      <User size={56} />
    </div>
  );

  return (
    <div className={`w-full max-w-sm mx-auto rounded-[2.5rem] shadow-2xl overflow-hidden border transition-all duration-300 ${isDark ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'} ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* 1. Header with Name & Title (Top Banner style) */}
      <div 
        className="pt-10 pb-12 px-6 text-center transition-colors duration-500" 
        style={{ backgroundColor: data.themeColor }}
      >
        <h2 className="text-2xl font-black text-white truncate drop-shadow-md">
          {data.name || (lang === 'en' ? 'Your Name' : 'اسمك هنا')}
        </h2>
        <p className="text-white/90 font-bold text-sm tracking-wide uppercase mt-1 drop-shadow-sm">
          {data.title || (lang === 'en' ? 'Professional Title' : 'المسمى الوظيفي')}
        </p>
      </div>

      {/* 2. Logo / Profile Image (Overlapping) */}
      <div className="relative px-6 -mt-10 text-center">
        <div className="inline-block relative">
          <div className={`w-28 h-28 rounded-3xl overflow-hidden border-8 shadow-xl transition-all duration-300 hover:scale-105 ${isDark ? 'border-gray-950 bg-gray-800' : 'border-white bg-gray-100'}`}>
            {data.profileImage ? (
              <img 
                src={data.profileImage} 
                alt={data.name}
                className="w-full h-full object-cover"
              />
            ) : defaultImage}
          </div>
        </div>
      </div>

      {/* 3. Bio Section */}
      <div className="px-6 mt-6 text-center">
        {data.bio && (
          <p className={`text-sm leading-relaxed px-2 italic font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            "{data.bio}"
          </p>
        )}
      </div>

      {/* 4. Action Buttons (Direct Call & Direct WhatsApp) */}
      <div className="px-6 mt-8 grid grid-cols-2 gap-3">
        {data.phone && (
          <a 
            href={`tel:${data.phone}`}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-xs"
            style={{ backgroundColor: data.themeColor }}
          >
            <Phone size={16} />
            <span>{t('call')}</span>
          </a>
        )}
        {data.whatsapp && (
          <a 
            href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-500 text-white font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-xs"
          >
            <MessageCircle size={16} />
            <span>{t('whatsappBtn')}</span>
          </a>
        )}
      </div>

      {/* 5. Contact List (Email, Website, Location) */}
      <div className="px-6 space-y-3.5 mt-8 pb-4">
        {data.email && (
          <div className={`flex items-center p-3.5 rounded-2xl border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-transparent'}`}>
            <div className={`p-2 rounded-xl ${isDark ? 'bg-gray-950 text-blue-400' : 'bg-white text-blue-600'}`}>
              <Mail size={16} />
            </div>
            <span className={`text-xs font-bold truncate ${isRtl ? 'mr-3' : 'ml-3'} ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {data.email}
            </span>
          </div>
        )}
        {data.website && (
          <a 
            href={data.website} target="_blank" rel="noopener noreferrer"
            className={`flex items-center p-3.5 rounded-2xl border transition-all hover:bg-opacity-80 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-transparent'}`}
          >
            <div className={`p-2 rounded-xl ${isDark ? 'bg-gray-950 text-blue-400' : 'bg-white text-blue-600'}`}>
              <Globe size={16} />
            </div>
            <span className={`text-xs font-bold truncate ${isRtl ? 'mr-3' : 'ml-3'} ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {data.website.replace(/^https?:\/\//, '')}
            </span>
          </a>
        )}
        {data.location && (
          <a 
            href={data.locationUrl || '#'} target="_blank" rel="noopener noreferrer"
            className={`flex items-center p-3.5 rounded-2xl border transition-all hover:bg-opacity-80 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-transparent'}`}
          >
            <div className={`p-2 rounded-xl ${isDark ? 'bg-gray-950 text-blue-400' : 'bg-white text-blue-600'}`}>
              <MapPin size={16} />
            </div>
            <div className={`flex flex-col ${isRtl ? 'mr-3' : 'ml-3'}`}>
              <span className={`text-xs font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{data.location}</span>
              {data.locationUrl && <span className="text-[10px] text-blue-500 font-bold">{lang === 'en' ? 'View on Maps' : 'عرض الخريطة'}</span>}
            </div>
          </a>
        )}
      </div>

      {/* 6. Social Links Bar (Bottom) */}
      <div className={`flex flex-wrap justify-center gap-4 py-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        {data.socialLinks.map((link, idx) => (
          <a 
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-11 h-11 flex items-center justify-center rounded-xl hover:scale-110 hover:shadow-lg transition-all border ${isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
            title={link.platform}
          >
            <SocialIcon 
              platformId={link.platformId} 
              size={22} 
              color={isDark ? "white" : "#1f2937"} 
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default CardPreview;
