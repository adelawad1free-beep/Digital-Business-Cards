
import React from 'react';
import { CardData, Language } from '../types';
import { Mail, Phone, Globe, MapPin, MessageCircle, User, UserPlus, ExternalLink, Zap, Star, ShieldCheck, Heart } from 'lucide-react';
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
  const t = (key: string) => TRANSLATIONS[key][lang] || TRANSLATIONS[key]['en'];

  const getThemeStyles = () => {
    if (data.themeType === 'image' && data.backgroundImage) return { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    if (data.themeType === 'gradient') return { background: data.themeGradient };
    return { backgroundColor: data.themeColor };
  };

  const getThemeColor = () => data.themeType === 'gradient' ? { background: data.themeGradient } : { backgroundColor: data.themeColor };

  const ProfileImage = ({ className = "w-32 h-32", circle = false }) => {
    // تحديد لون الإطار المتحرك بناءً على لون الهوية المختارة
    const accentColor = data.themeType === 'color' ? data.themeColor : (data.themeType === 'gradient' ? data.themeColor : '#3b82f6');
    
    return (
      <div className={`${className} relative p-[2px] ${circle ? 'rounded-full' : 'rounded-[2.5rem]'} overflow-hidden group shadow-2xl`}>
        {/* الطبقة المتحركة (إطار الهوية السحري) */}
        <div 
          className="absolute inset-[-100%] animate-[spin_5s_linear_infinite] opacity-60 group-hover:opacity-100 group-hover:animate-[spin_2s_linear_infinite] transition-all duration-700"
          style={{ 
            background: `conic-gradient(from 0deg, transparent, ${accentColor}, transparent 30%, ${accentColor}, transparent)` 
          }}
        />
        
        {/* الحاوية الداخلية للصورة (لضمان رقة الإطار بـ 2 بكسل فقط) */}
        <div className={`relative w-full h-full ${circle ? 'rounded-full' : 'rounded-[2.4rem]'} overflow-hidden bg-white dark:bg-gray-950 z-10 flex items-center justify-center`}>
          {data.profileImage ? (
            <img src={data.profileImage} className="w-full h-full object-cover scale-[1.01]" alt={data.name} />
          ) : (
            <User className="w-full h-full p-6 text-gray-300" />
          )}
        </div>
      </div>
    );
  };

  const ContactButtons = ({ grid = false, compact = false }) => (
    <div className={`mt-6 ${grid ? 'grid grid-cols-2 gap-3' : 'space-y-3'}`}>
      {data.phone && (
        <a href={`tel:${data.phone}`} className={`flex items-center justify-center gap-2 rounded-2xl text-white font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-[10px] uppercase ${compact ? 'py-3' : 'py-4'}`} style={getThemeColor()}>
          <Phone size={compact ? 14 : 16} /> <span>{t('call')}</span>
        </a>
      )}
      {data.whatsapp && (
        <a href={`https://wa.me/${data.whatsapp.replace(/\D/g, '')}`} target="_blank" className={`flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 text-white font-black shadow-lg transition-all hover:scale-[1.02] active:scale-95 text-[10px] uppercase ${compact ? 'py-3' : 'py-4'}`}>
          <MessageCircle size={compact ? 14 : 16} /> <span>{t('whatsappBtn')}</span>
        </a>
      )}
    </div>
  );

  const SocialLinks = ({ justify = "center" }) => (
    <div className={`flex flex-wrap justify-${justify} gap-3 mt-8`}>
      {data.socialLinks.map((link, i) => (
        <a key={i} href={link.url} target="_blank" className={`w-11 h-11 flex items-center justify-center rounded-2xl border transition-all hover:scale-110 hover:-translate-y-1 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-gray-100 shadow-sm'}`}>
          <SocialIcon platformId={link.platformId} size={18} color={isDark ? "white" : "#1f2937"} />
        </a>
      ))}
    </div>
  );

  const renderTemplate = () => {
    switch (data.templateId) {
      case 'bento': // Modern Bento Grid
        return (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-12 gap-4">
               <div className="col-span-8 bg-blue-600 p-6 rounded-[2.5rem] flex flex-col justify-between text-white shadow-xl shadow-blue-500/20" style={getThemeColor()}>
                  <Zap size={20} className="mb-4 opacity-50" />
                  <div>
                    <h2 className="text-xl font-black leading-tight">{data.name}</h2>
                    <p className="text-[10px] font-bold opacity-80 mt-1 uppercase tracking-wider">{data.title}</p>
                  </div>
               </div>
               <div className="col-span-4">
                  <ProfileImage className="w-full h-full aspect-square" />
               </div>
            </div>
            <div className={`p-6 rounded-[2.5rem] ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50'}`}>
               <p className="text-sm font-medium leading-relaxed opacity-80">{data.bio}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className={`p-5 rounded-[2rem] ${isDark ? 'bg-white/5' : 'bg-white shadow-sm border border-gray-100'}`}>
                  <Mail className="text-blue-500 mb-2" size={18} />
                  <p className="text-[9px] font-black truncate opacity-60">{data.email}</p>
               </div>
               <div className={`p-5 rounded-[2rem] ${isDark ? 'bg-white/5' : 'bg-white shadow-sm border border-gray-100'}`}>
                  <Globe className="text-emerald-500 mb-2" size={18} />
                  <p className="text-[9px] font-black truncate opacity-60">{data.website}</p>
               </div>
            </div>
            <ContactButtons grid compact />
            <SocialLinks />
          </div>
        );

      case 'split': // Vertical Bold Split
        return (
          <div className="flex flex-col h-full min-h-[600px]">
            <div className="h-[45%] relative overflow-hidden" style={getThemeStyles()}>
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div className="flex-1 -mt-20 px-8 pb-8 relative z-10">
               <div className="flex items-end gap-6 mb-8">
                  <ProfileImage className="w-36 h-36" />
                  <div className="pb-4">
                     <h2 className={`text-2xl font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{data.name}</h2>
                     <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{data.company}</p>
                  </div>
               </div>
               <div className="space-y-6">
                  <p className="text-base font-medium opacity-80 italic leading-relaxed">"{data.bio}"</p>
                  <div className="h-px bg-gray-100 dark:bg-gray-800" />
                  <ContactButtons grid />
                  <SocialLinks justify={isRtl ? 'end' : 'start'} />
               </div>
            </div>
          </div>
        );

      case 'glass': // Ultra Futuristic Glass
        return (
          <div className="min-h-[650px] p-6 relative flex items-center justify-center overflow-hidden" style={getThemeStyles()}>
             <div className="absolute top-0 left-0 w-full h-full bg-black/10 backdrop-blur-[2px]" />
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-3xl" />
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/20 rounded-full blur-3xl" />
             
             <div className="relative w-full bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-[3.5rem] p-10 shadow-2xl">
                <div className="flex flex-col items-center text-center">
                   <div className="relative mb-8">
                      <ProfileImage className="w-32 h-32" circle />
                   </div>
                   <h2 className="text-2xl font-black text-white drop-shadow-md">{data.name}</h2>
                   <p className="text-[10px] font-bold text-white/70 mt-2 uppercase tracking-[0.3em]">{data.title}</p>
                   
                   <div className="w-full mt-10 space-y-3">
                      {data.phone && <a href={`tel:${data.phone}`} className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white text-[10px] font-black transition-all border border-white/5"><Phone size={14} className="opacity-50"/> {data.phone}</a>}
                      {data.email && <a href={`mailto:${data.email}`} className="flex items-center gap-4 p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white text-[10px] font-black transition-all border border-white/5"><Mail size={14} className="opacity-50"/> {data.email}</a>}
                   </div>
                   <div className="mt-8 h-px w-1/2 bg-white/20" />
                   <SocialLinks />
                </div>
             </div>
          </div>
        );

      case 'minimal': // Swiss Typography Style
        return (
          <div className="p-12 space-y-12">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mb-4">Identity Portfolio</p>
                  <h2 className="text-4xl font-black dark:text-white leading-[1.1] tracking-tighter">{data.name}</h2>
                  <div className="mt-4 flex items-center gap-3">
                     <div className="h-1 w-12 bg-gray-900 dark:bg-white" />
                     <p className="text-sm font-bold opacity-60 uppercase tracking-widest">{data.title}</p>
                  </div>
               </div>
               <ProfileImage className="w-24 h-24" />
            </div>
            <div className="grid grid-cols-1 gap-12">
               <p className="text-lg font-medium leading-relaxed opacity-90 border-l-4 border-gray-100 dark:border-gray-800 pl-6">{data.bio}</p>
               <div className="space-y-6 text-xs font-black uppercase tracking-widest">
                  {data.email && <div className="flex items-center gap-6"><span className="opacity-40 w-12 text-[8px]">EML</span> {data.email}</div>}
                  {data.phone && <div className="flex items-center gap-6"><span className="opacity-40 w-12 text-[8px]">PHN</span> {data.phone}</div>}
                  {data.website && <div className="flex items-center gap-6"><span className="opacity-40 w-12 text-[8px]">WEB</span> {data.website}</div>}
               </div>
            </div>
            <button onClick={() => downloadVCard(data)} className="w-full py-5 bg-gray-950 dark:bg-white dark:text-black text-white rounded-none font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:bg-gray-800 active:scale-95 shadow-xl">{t('saveContact')}</button>
            <SocialLinks justify="start" />
          </div>
        );

      case 'neo': // Neo-Brutalist
        return (
          <div className="p-8 space-y-6">
            <div className={`border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
               <div className="flex items-center gap-6">
                  <ProfileImage className="w-24 h-24 shadow-none" />
                  <div>
                     <h2 className="text-2xl font-black uppercase tracking-tight">{data.name}</h2>
                     <span className="inline-block bg-yellow-400 border-2 border-black px-2 py-0.5 text-[9px] font-black uppercase mt-2">{data.title}</span>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <a href={`tel:${data.phone}`} className="bg-blue-400 border-4 border-black p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center font-black uppercase text-xs hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  {t('call')}
               </a>
               <a href={`https://wa.me/${data.whatsapp}`} className="bg-emerald-400 border-4 border-black p-4 rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center font-black uppercase text-xs hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                  {t('whatsappBtn')}
               </a>
            </div>
            <div className={`border-4 border-black p-6 rounded-none shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${isDark ? 'bg-zinc-900' : 'bg-white'}`}>
               <p className="font-bold text-sm leading-snug">{data.bio}</p>
            </div>
            <div className="flex flex-wrap gap-4 pt-4">
               {data.socialLinks.map((link, i) => (
                  <a key={i} href={link.url} className="w-12 h-12 border-4 border-black bg-white flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
                     <SocialIcon platformId={link.platformId} size={20} color="black" />
                  </a>
               ))}
            </div>
          </div>
        );

      case 'mosaic': // Influencer Mosaic Hub
        return (
          <div className="p-4 space-y-4">
             <div className="bg-gray-900 text-white rounded-[3rem] p-8 text-center relative overflow-hidden" style={getThemeColor()}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl" />
                <ProfileImage className="w-32 h-32 mx-auto" />
                <h2 className="text-2xl font-black mt-6 leading-tight">{data.name}</h2>
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mt-1">{data.company}</p>
             </div>
             <div className="grid grid-cols-4 gap-3">
                {data.socialLinks.map((link, i) => (
                   <a key={i} href={link.url} className={`aspect-square flex flex-col items-center justify-center rounded-[1.8rem] transition-all border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white shadow-sm border-gray-100 hover:bg-gray-50'}`}>
                      <SocialIcon platformId={link.platformId} size={24} color={isDark ? "white" : "#3b82f6"} />
                   </a>
                ))}
             </div>
             <div className={`p-8 rounded-[3rem] ${isDark ? 'bg-white/5' : 'bg-gray-50'} text-center`}>
                <p className="text-sm font-bold opacity-70 leading-relaxed italic">"{data.bio}"</p>
                <ContactButtons grid />
             </div>
          </div>
        );

      case 'zen': // Zen Focus
        return (
          <div className="p-8 h-full min-h-[600px] flex flex-col items-center justify-center text-center space-y-12">
             <div className="space-y-6">
                <ProfileImage className="w-44 h-44 mx-auto" circle />
                <h2 className="text-4xl font-light dark:text-white tracking-tighter">{data.name}</h2>
                <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-800 mx-auto" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.6em]">{data.title}</p>
             </div>
             <p className="max-w-[280px] text-base font-medium leading-relaxed opacity-50">{data.bio}</p>
             <div className="flex gap-10">
                {data.phone && <a href={`tel:${data.phone}`} className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 text-blue-500 hover:scale-110 transition-all shadow-sm"><Phone size={24}/></a>}
                {data.email && <a href={`mailto:${data.email}`} className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 text-emerald-500 hover:scale-110 transition-all shadow-sm"><Mail size={24}/></a>}
                {data.website && <a href={data.website} target="_blank" className="p-4 rounded-full bg-gray-50 dark:bg-gray-900 text-amber-500 hover:scale-110 transition-all shadow-sm"><Globe size={24}/></a>}
             </div>
             <div className="h-px w-24 bg-gray-100 dark:bg-gray-800" />
             <SocialLinks />
          </div>
        );

      default: // Modern Classic 2.0
        return (
          <div className="flex flex-col h-full">
            <div className="h-48 w-full relative overflow-hidden" style={getThemeStyles()}>
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />
            </div>
            <div className="relative px-8 -mt-24 text-center z-10 pb-12">
              <div className="inline-block relative">
                 <ProfileImage className="w-40 h-40" />
              </div>
              <div className="mt-8 space-y-2">
                <h2 className="text-3xl font-black truncate leading-tight tracking-tight dark:text-white">{data.name || 'Your Name'}</h2>
                <p className={`font-black text-[11px] tracking-[0.2em] uppercase ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{data.title}</p>
                <div className="flex items-center justify-center gap-2 mt-2 opacity-50">
                   <ShieldCheck size={14} className="text-blue-500" />
                   <span className="text-[9px] font-black uppercase tracking-widest">{data.company}</span>
                </div>
              </div>
              <div className={`mt-8 p-6 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50/50 border-gray-100'}`}>
                <p className="text-sm font-medium leading-relaxed italic opacity-80 italic">"{data.bio}"</p>
              </div>
              <ContactButtons grid />
              <button onClick={() => downloadVCard(data)} className={`w-full mt-4 py-5 rounded-2xl font-black shadow-lg text-[10px] uppercase transition-all hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-3 ${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
                 <UserPlus size={18} /> {t('saveContact')}
              </button>
              <SocialLinks />
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`w-full max-w-sm mx-auto rounded-[3.5rem] shadow-[0_35px_80px_-15px_rgba(0,0,0,0.3)] overflow-hidden border-4 transition-all duration-500 ease-in-out transform hover:scale-[1.01] ${isDark ? 'bg-gray-950 border-gray-800 text-white' : 'bg-white border-gray-100 text-gray-900'} ${isRtl ? 'rtl' : 'ltr'}`}>
      {renderTemplate()}
      <div className="pb-6"></div>
    </div>
  );
};

export default CardPreview;
