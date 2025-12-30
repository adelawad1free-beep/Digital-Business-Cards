
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { LANGUAGES_CONFIG } from '../constants';
import { ChevronDown, Globe } from 'lucide-react';

interface LanguageToggleProps {
  currentLang: Language;
  onToggle: (lang: Language) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLang, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-500 transition-all"
      >
        <span className="text-lg">{LANGUAGES_CONFIG[currentLang].flag}</span>
        <span className="hidden sm:block text-xs font-black uppercase text-gray-700 dark:text-gray-200">
          {LANGUAGES_CONFIG[currentLang].native}
        </span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl z-[500] py-2 animate-fade-in overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto no-scrollbar">
            {(Object.keys(LANGUAGES_CONFIG) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  onToggle(lang);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${currentLang === lang ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}
              >
                <span className="text-lg">{LANGUAGES_CONFIG[lang].flag}</span>
                <div className="flex flex-col">
                  <span className="text-xs font-black">{LANGUAGES_CONFIG[lang].native}</span>
                  <span className="text-[10px] opacity-50">{LANGUAGES_CONFIG[lang].name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
