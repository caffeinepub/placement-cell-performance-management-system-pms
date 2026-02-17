import { useState, useEffect } from 'react';

export type LoginIntent = 'admin' | 'assistant';

const STORAGE_KEY = 'pms_login_intent';

export function useLoginIntent() {
  const [intent, setIntentState] = useState<LoginIntent | null>(() => {
    if (typeof window === 'undefined') return null;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored === 'admin' || stored === 'assistant' ? stored : null;
  });

  const setIntent = (newIntent: LoginIntent) => {
    sessionStorage.setItem(STORAGE_KEY, newIntent);
    setIntentState(newIntent);
  };

  const clearIntent = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIntentState(null);
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      setIntentState(stored === 'admin' || stored === 'assistant' ? stored : null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    intent,
    setIntent,
    clearIntent
  };
}
