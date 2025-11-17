import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PolishFlagIcon, UKFlagIcon } from './icons/Icons';

const LanguageSwitcher: React.FC = () => {
    const { locale, setLocale } = useLanguage();

    return (
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setLocale('pl')}
                className={`transition-all duration-300 rounded-sm ${locale === 'pl' ? 'opacity-100 ring-2 ring-[#F0C38E]' : 'opacity-60 hover:opacity-100'}`}
                aria-label="Change language to Polish"
            >
                <PolishFlagIcon className="h-6 w-6" />
            </button>
            <button 
                onClick={() => setLocale('en')}
                className={`transition-all duration-300 rounded-sm ${locale === 'en' ? 'opacity-100 ring-2 ring-[#F0C38E]' : 'opacity-60 hover:opacity-100'}`}
                aria-label="Change language to English"
            >
                <UKFlagIcon className="h-6 w-6" />
            </button>
        </div>
    );
};

const Header: React.FC = () => {
  return (
    <header className="p-4 bg-[#2B273A]/80 backdrop-blur-sm shadow-[0_5px_15px_rgba(0,0,0,0.2)] sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-center relative">
        <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#F0F0F0] opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
                <path d="M12 22V12"></path>
                <path d="M18.5 4.5l-5 2.5"></path>
            </svg>
            <h1 className="text-2xl font-bold tracking-tighter text-[#F0F0F0]">
              Prompt <span className="text-[#F0C38E]">Wizard</span>
            </h1>
        </div>
        <div className="absolute right-0">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
};

export default Header;