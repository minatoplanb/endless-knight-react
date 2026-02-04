import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Locale } from './types';
import { zh } from './zh';
import { en, dataNames } from './en';

const LOCALE_KEY = '@endless_knight_locale';

const getNested = (obj: Record<string, unknown>, key: string): string | undefined => {
  const value = key.split('.').reduce((o: unknown, k) => (o as Record<string, unknown>)?.[k], obj);
  return typeof value === 'string' ? value : undefined;
};

export type DataNameType =
  | 'area'
  | 'enemy'
  | 'boss'
  | 'combatStyle'
  | 'resource'
  | 'worker'
  | 'skill'
  | 'prestige'
  | 'achievement'
  | 'quest'
  | 'consumable'
  | 'craftingCategory'
  | 'equipment';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => Promise<void>;
  t: (key: string) => string;
  getDataName: (type: DataNameType, id: string, fallback: string) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const strings: Record<Locale, Record<string, unknown>> = { zh, en };

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(LOCALE_KEY).then((stored) => {
      if (stored === 'en' || stored === 'zh') {
        setLocaleState(stored);
      }
      setLoaded(true);
    });
  }, []);

  const setLocale = useCallback(async (l: Locale) => {
    setLocaleState(l);
    await AsyncStorage.setItem(LOCALE_KEY, l);
  }, []);

  const t = useCallback(
    (key: string): string => {
      if (!loaded) return key;
      const s = strings[locale];
      return getNested(s as Record<string, unknown>, key) ?? key;
    },
    [locale, loaded]
  );

  const getDataName = useCallback(
    (type: DataNameType, id: string, fallback: string): string => {
      if (locale !== 'en') return fallback;
      const map = dataNames[type];
      return map?.[id] ?? fallback;
    },
    [locale]
  );

  const value: LocaleContextValue = useMemo(
    () => ({ locale, setLocale, t, getDataName }),
    [locale, setLocale, t, getDataName]
  );

  return React.createElement(LocaleContext.Provider, { value }, children);
}

export function useTranslation(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useTranslation must be used within LocaleProvider');
  return ctx;
}
