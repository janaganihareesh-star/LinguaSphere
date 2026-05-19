import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    // Check if user is logged in and has a preferred language
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.preferredLanguage) {
      setLang(user.preferredLanguage);
    }
  }, []);

  const t = (key) => {
    // Return translation in current language, fallback to English, then fallback to key
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
