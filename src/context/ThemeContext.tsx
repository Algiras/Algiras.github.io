import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  setTheme: (t: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Detect theme from localStorage or prefers-color-scheme
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* ignore */
    }
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  });

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    const readScheme = () =>
      root.getAttribute('data-mantine-color-scheme') === 'dark'
        ? 'dark'
        : 'light';

    // Initial sync from Mantine attribute if present
    setTheme(readScheme());

    // Observe Mantine attribute changes
    const observer = new MutationObserver(() => {
      const next = readScheme();
      setTheme(prev => (prev !== next ? next : prev));
    });
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['data-mantine-color-scheme'],
    });

    // Also react to OS scheme flips
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onMql = () => setTheme(readScheme());
    try {
      mq.addEventListener('change', onMql);
    } catch {
      /* Safari */ mq.addListener?.(onMql as any);
    }

    return () => {
      observer.disconnect();
      try {
        mq.removeEventListener('change', onMql);
      } catch {
        mq.removeListener?.(onMql as any);
      }
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
