import { useState, useEffect } from 'react';

const STORAGE_KEY = 'quiz_app_preferences';
const DEFAULT_PREFS = {
  autoOpenArticle: false, // default: don't auto-open article modal
  lastSearchTerm: '', // remember last search within article
};

export function usePreferences() {
  const [prefs, setPrefs] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_PREFS, ...JSON.parse(stored) } : DEFAULT_PREFS;
    } catch (e) {
      console.warn('Failed to load preferences', e);
      return DEFAULT_PREFS;
    }
  });

  // Save to localStorage whenever prefs change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save preferences', e);
    }
  }, [prefs]);

  const updatePref = (key, value) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
  };

  return [prefs, updatePref];
}