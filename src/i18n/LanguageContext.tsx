import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import es from './es.json';
import en from './en.json';

export type Language = 'es' | 'en';

type NestedValue = string | { [key: string]: NestedValue };

function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let current: any = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) {
      return path;
    }
    current = current[key];
  }
  
  return typeof current === 'string' ? current : path;
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LANGUAGE_STORAGE_KEY = '@unpaso_language';

const translations: Record<Language, typeof es> = { es, en };

const LanguageContext = createContext<LanguageContextValue>({
  language: 'es',
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY).then((stored) => {
      if (stored === 'es' || stored === 'en') {
        setLanguageState(stored);
      }
    });
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const value = getNestedValue(translations[language], key);
    if (params) {
      return interpolate(value, params);
    }
    return value;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
