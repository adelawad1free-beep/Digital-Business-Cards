
import React from 'react';
import { CardData, Language } from '../types';
import { Mail, Phone, Globe, MapPin, MessageCircle, User, UserPlus } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { downloadVCard } from '../utils/vcard';
import SocialIcon from './SocialIcon';

interface CardPreviewProps {
  data: CardData;
  lang: Language;
}

const CardPreview: React.FC<CardPreviewProps> = ({ data, lang }) => {
  const isRtl = lang === 'ar';
  const isDark = data.isDark;
  const t = (key: string) => TRANSLATIONS[key][lang];

  const defaultImage = (
    <div className={`w-full h-full flex flex-col items-center justify-end ${isDark ? 'bg-gray-800 text-gray-600' : 'bg-gray-200 text-gray-400'}`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full opacity-80 translate-y-2">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    </div>
  );

  return (
    <div className={`w-full max-w-sm mx-auto rounded-[3rem] shadow-2xl overflow-hidden border transition-all duration-300 ${isDark ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'} ${isRtl ? 'rtl' : 'ltr'}`}>
      
      {/* 1. خلفية السمة */}
      <div 
        className="h-36 w-full relative transition-colors duration-500" 
        style={{ 
          backgroundColor: data.themeColor,
          backgroundImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)'
        }}
      />

      {/* 2. الصورة الشخصية */}
      <div className="relative px-6 -mt-20 text-center z-10">
        <div className="inline-block relative">
          <div className={`w-40 h-40 rounded-[2.5rem] overflow-hidden border-[10px] shadow-2xl transition-all duration-300 hover:scale-105 ${isDark ? 'border-gray-950 bg-gray-800' : 'border-white bg-gray-100'}`}>
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

      {/* 3. الاسم والمسمى الوظيفي */}
      <div className="px-6 mt-6 text-center space-y-1">
        <h2 className="text-2xl md:text-3xl font-black truncate leading-tight">
          {data.name || (lang === 'en' ? 'Your Name' : 'اسمك هنا')}
        </h2>
        <p className={`font-bold text-sm tracking-wide uppercase ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {data.title || (lang === 'en' ? 'Professional Title' : 'المسمى الوظيفي')}
        </p>
      </div>

      {/* 4. النبذة التعريفية */}
      <div className="px-8 mt-4 text-center">
        {data.bio && (
          <p className={`text-sm leading-relaxed italic font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            "{data.bio}"
          </p>
        )}
      </div>

      {/* 5. أزرار التواصل السريع */}
      <div className="px-6 mt-8 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          {data.phone && (
            <a 
              href={`tel:${data.phone}`}
              className="flex items-center justify-center gap-2 py-4 rounded-[1.5rem] text-white font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-wider"
              style={{ backgroundColor: data.themeColor }}
            >
              <Phone size={18} />
              <span>{t('call')}</span>
            </a>
          )}
          {data.whatsapp && (
            <a 
              href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-4 rounded-[1.5rem] bg-emerald-500 text-white font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-xs uppercase tracking-wider"
            >
              <MessageCircle size={18} />
              <span>{t('whatsappBtn')}</span>
            </a>
          )}
        </div>
        
        <button 
          onClick={() => downloadVCard(data)}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-black shadow-md transition-all hover:scale-[1.01] active:scale-95 text-xs uppercase tracking-wider border ${isDark ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700' : 'bg-slate-900 border-transparent text-white hover:bg-slate-800'}`}
        >
          <UserPlus size={18} />
          <span>{t('saveContact')}</span>
        </button>
      </div>

      {/* 6. معلومات التواصل الأخرى */}
      <div className="px-6 space-y-3 mt-8 pb-4">
        {data.email && (
          <div className={`flex items-center p-4 rounded-[1.5rem] border ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-transparent'}`}>
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-gray-950 text-blue-400' : 'bg-white text-blue-600 shadow-sm'}`}>
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
            className={`flex items-center p-4 rounded-[1.5rem] border transition-all hover:bg-opacity-80 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-transparent'}`}
          >
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-gray-950 text-blue-400' : 'bg-white text-blue-600 shadow-sm'}`}>
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
            className={`flex items-center p-4 rounded-[1.5rem] border transition-all hover:bg-opacity-80 ${isDark ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50 border-transparent'}`}
          >
            <div className={`p-2.5 rounded-xl ${isDark ? 'bg-gray-950 text-blue-400' : 'bg-white text-blue-600 shadow-sm'}`}>
              <MapPin size={16} />
            </div>
            <div className={`flex flex-col ${isRtl ? 'mr-3' : 'ml-3'}`}>
              <span className={`text-xs font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{data.location}</span>
              {data.locationUrl && <span className="text-[10px] text-blue-500 font-bold">{lang === 'en' ? 'View on Maps' : 'عرض الخريطة'}</span>}
            </div>
          </a>
        )}
      </div>

      {/* 7. روابط التواصل الاجتماعي */}
      <div className={`flex flex-wrap justify-center gap-4 py-8 mt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
        {data.socialLinks.map((link, idx) => (
          <a 
            key={idx}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-12 h-12 flex items-center justify-center rounded-2xl hover:scale-110 hover:shadow-xl transition-all border ${isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
            title={link.platform}
          >
            <SocialIcon 
              platformId={link.platformId} 
              size={24} 
              color={isDark ? "white" : "#1f2937"} 
            />
          </a>
        ))}
      </div>
    </div>
  );
};

export default CardPreview;
