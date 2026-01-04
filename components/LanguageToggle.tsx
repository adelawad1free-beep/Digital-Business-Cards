
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Language } from '../types';
import { LANGUAGES_CONFIG } from '../constants';
import { ChevronDown } from 'lucide-react';

interface LanguageToggleProps {
  currentLang: Language;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      segments[0] = newLang;
      navigate('/' + segments.join('/') + location.search);
    } else {
      navigate(`/${newLang}/`);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700">
        <span className="text-lg">{LANGUAGES_CONFIG[currentLang]?.flag}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-40 bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl shadow-xl z-[500] py-1 overflow-hidden">
          {(Object.keys(LANGUAGES_CONFIG) as Language[]).map((lang) => (
            <button key={lang} onClick={() => handleLanguageChange(lang)} className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 ${currentLang === lang ? 'text-blue-600 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
              <span>{LANGUAGES_CONFIG[lang].flag}</span>
              <span className="text-xs uppercase">{LANGUAGES_CONFIG[lang].native}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
