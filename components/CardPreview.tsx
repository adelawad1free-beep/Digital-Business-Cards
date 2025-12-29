
import React from 'react';
import { CardData, Language } from '../types';
import { Mail, Phone, Globe, MapPin, Share2 } from 'lucide-react';

interface CardPreviewProps {
  data: CardData;
  lang: Language;
}

const CardPreview: React.FC<CardPreviewProps> = ({ data, lang }) => {
  const isRtl = lang === 'ar';
  const isDark = data.isDark;

  return (
    <div className={`w-full max-w-sm mx-auto rounded-[2rem] shadow-2xl overflow-hidden border transition-all duration-300 ${isDark ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'} ${isRtl ? 'rtl' : 'ltr'}`}>
      {/* Header Banner */}
      <div 
        className="h-32 w-full transition-colors duration-500" 
        style={{ backgroundColor: data.themeColor }}
      >
        <div className="w-full h-full bg-black/10 flex items-center justify-center text-white/20 text-4xl font-black select-none">
          {data.company?.charAt(0) || 'C'}
        </div>
      </div>

      {/* Profile Section */}
      <div className="relative px-6 -mt-16 text-center">
        <div className="inline-block relative">
          <img 
            src={data.profileImage || `https://picsum.photos/seed/${data.name || 'default'}/200`} 
            alt={data.name}
            className={`w-32 h-32 rounded-3xl object-cover border-8 shadow-xl transition-all duration-300 hover:scale-105 ${isDark ? 'border-gray-950 bg-gray-800' : 'border-white bg-gray-100'}`}
          />
        </div>
        
        <h2 className={`mt-5 text-2xl font-black truncate px-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {data.name || (lang === 'en' ? 'Your Name' : 'اسمك هنا')}
        </h2>
        <p className="text-blue-500 font-bold text-sm tracking-wide uppercase mt-1">
          {data.title || (lang === 'en' ? 'Professional Title' : 'المسمى الوظيفي')}
        </p>
        <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {data.company || (lang === 'en' ? 'Company' : 'الشركة')}
        </p>
        
        {data.bio && (
          <p className={`text-sm leading-relaxed mt-4 px-2 italic font-medium line-clamp-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            "{data.bio}"
          </p>
        )}
      </div>

      {/* Action Button */}
      <div className="px-6 my-6 flex justify-center">
        <button 
          className="flex items-center justify-center space-x-2 w-full py-3.5 rounded-2xl text-white font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95"
          style={{ backgroundColor: data.themeColor }}
        >
          <Share2 size={20} className={isRtl ? 'ml-2' : 'mr-2'} />
          <span>{lang === 'en' ? 'Add to Contacts' : 'إضافة لجهات الاتصال'}</span>
        </button>
      </div>

      {/* Info List */}
      <div className="px-6 space-y-3.5 pb-8">
        {[
          { icon: Mail, value: data.email, label: 'Email' },
          { icon: Phone, value: data.phone, label: 'Phone' },
          { icon: Globe, value: data.website, label: 'Website' },
          { icon: MapPin, value: data.location, label: 'Location' }
        ].map((item, idx) => item.value && (
          <div key={idx} className={`flex items-center p-3.5 rounded-2xl transition-colors group border ${isDark ? 'bg-gray-900/50 border-gray-800 hover:bg-gray-900' : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}>
            <div className={`p-2.5 rounded-xl shadow-sm transition-colors ${isDark ? 'bg-gray-950 text-gray-500 group-hover:text-blue-400' : 'bg-white text-gray-400 group-hover:text-blue-600'}`}>
              <item.icon size={18} />
            </div>
            <span className={`text-sm font-bold truncate ${isRtl ? 'mr-3' : 'ml-3'} ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
              {item.value}
            </span>
          </div>
        ))}

        {/* Social Links Bar */}
        <div className={`flex flex-wrap justify-center gap-4 mt-8 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}`}>
          {data.socialLinks.map((link, idx) => (
            <a 
              key={idx}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-11 h-11 flex items-center justify-center rounded-2xl hover:scale-110 hover:shadow-lg transition-all border ${isDark ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
              title={link.platform}
            >
              <span className="text-xl">{link.icon}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardPreview;
