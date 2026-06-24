import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const DarkModeContext = createContext(null);

export const DarkModeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem('rs-dark-mode') === 'true';
    } catch {
      return false;
    }
  });

  // Apply class to <html> on mount + change
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    try {
      localStorage.setItem('rs-dark-mode', isDark);
    } catch { /* ignore */ }
  }, [isDark]);

  const toggle = useCallback(() => setIsDark(prev => !prev), []);

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const ctx = useContext(DarkModeContext);
  if (!ctx) throw new Error('useDarkMode must be used inside DarkModeProvider');
  return ctx;
};
