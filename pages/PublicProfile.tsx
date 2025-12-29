
import React from 'react';
import { CardData, Language } from '../types';
import CardPreview from '../components/CardPreview';
import { LayoutGrid, Plus } from 'lucide-react';

interface PublicProfileProps {
  data: CardData;
  lang: Language;
}

const PublicProfile: React.FC<PublicProfileProps> = ({ data, lang }) => {
  const isRtl = lang === 'ar';
  
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors ${data.isDark ? 'bg-black' : 'bg-gray-50'}`} style={{
      backgroundImage: `radial-gradient(circle at top right, ${data.themeColor}15, transparent), radial-gradient(circle at bottom left, ${data.themeColor}10, transparent)`
    }}>
      <div className="w-full max-w-sm animate-fade-in-up">
        <CardPreview data={data} lang={lang} />
        
        <div className="mt-12 text-center pb-8">
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
            {lang === 'ar' ? 'تم الإنشاء بواسطة كونكت فلو' : 'Created with ConnectFlow'}
          </p>
          <a 
            href={window.location.origin + window.location.pathname}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-full font-black text-sm shadow-xl hover:scale-105 transition-all border border-gray-100 dark:border-gray-800"
          >
            <Plus size={16} className="text-blue-600" />
            {lang === 'ar' ? 'أنشئ بطاقتك الرقمية مجاناً' : 'Create Your Free Digital Card'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
