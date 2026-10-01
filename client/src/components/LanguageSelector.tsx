import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../types';
import { useLanguageStore } from '../stores/languageStore';
import { useAuthStore } from '../stores/authStore';

interface LanguageSelectorProps {
  compact?: boolean;
  className?: string;
  onLanguageSelected?: (lang: LanguageCode) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  compact = false,
  className = '',
  onLanguageSelected
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, setLanguage } = useLanguageStore();
  const { updatePreferredLanguage, isAuthenticated } = useAuthStore();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    if (isAuthenticated) {
      updatePreferredLanguage(code);
    }
    if (onLanguageSelected) {
      onLanguageSelected(code);
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={`flex items-center gap-2 rounded-xl transition-all duration-200 border ${
          compact
            ? 'px-3 py-1.5 text-xs bg-slate-900/80 hover:bg-slate-800 border-white/10 text-slate-200 shadow-sm'
            : 'px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 border-white/10 text-slate-100 font-medium'
        }`}
      >
        <Globe className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-cyan-400`} />
        <span className="font-semibold">{currentOption.nativeName}</span>
        {!compact && <span className="text-slate-400 text-xs">({currentOption.name})</span>}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-2xl bg-slate-900 shadow-2xl ring-1 ring-white/10 border border-white/10 p-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-2 border-b border-white/10 mb-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Platform Language</p>
          </div>
          <div className="max-h-72 overflow-y-auto space-y-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLanguage;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm rounded-xl transition-colors ${
                    isSelected
                      ? 'bg-indigo-600/30 text-indigo-300 font-semibold border border-indigo-500/30'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-white">{lang.nativeName}</span>
                    <span className="text-[10px] text-slate-400">{lang.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
