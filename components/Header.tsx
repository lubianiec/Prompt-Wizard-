import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../types';
import { WorldIcon } from './icons/Icons';

const LanguageSwitcher: React.FC = () => {
    const { locale, setLocale } = useLanguage();

    const toggleLanguage = () => {
        setLocale(locale === 'pl' ? 'en' : 'pl');
    };

    return (
        <button 
            onClick={toggleLanguage} 
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors p-2 rounded-md hover:bg-zinc-800"
            aria-label="Change language"
        >
            <WorldIcon className="h-5 w-5" />
            <span>{locale === 'pl' ? Language.PL : Language.EN}</span>
        </button>
    );
};


const Header: React.FC = () => {
  return (
    <header className="p-4 bg-zinc-950/80 backdrop-blur-sm border-b border-zinc-800 sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-12 7 12" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 15c0 2 4 3 9 3s9-1 9-3" />
            </svg>
            <h1 className="text-2xl font-bold tracking-tighter text-gray-200">
              Prompt <span className="text-gray-400">Wizard</span>
            </h1>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;