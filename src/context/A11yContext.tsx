import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type DaltonismType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export interface A11yPrefs {
  isActive: boolean;
  daltonismType: DaltonismType;
  visualPatterns: boolean;
  highContrast: boolean;
}

interface A11yContextType {
  prefs: A11yPrefs;
  update: (patch: Partial<A11yPrefs>) => void;
  isPanelOpen: boolean;
  setIsPanelOpen: (v: boolean) => void;
}

const A11yContext = createContext<A11yContextType | null>(null);

const loadPrefs = (): A11yPrefs => ({
  isActive: localStorage.getItem('a11y_active') === 'true',
  daltonismType: (localStorage.getItem('a11y_type') as DaltonismType) || 'protanopia',
  visualPatterns: localStorage.getItem('a11y_patterns') === 'true',
  highContrast: localStorage.getItem('a11y_contrast') === 'true',
});

export const A11yProvider = ({ children }: { children: ReactNode }) => {
  const [prefs, setPrefs] = useState<A11yPrefs>(loadPrefs);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (prefs.isActive) {
      root.setAttribute('data-daltonism', prefs.daltonismType);
      root.setAttribute('data-accessibility-patterns', prefs.visualPatterns.toString());
      root.setAttribute('data-accessibility-contrast', prefs.highContrast.toString());
    } else {
      root.removeAttribute('data-daltonism');
      root.removeAttribute('data-accessibility-patterns');
      root.removeAttribute('data-accessibility-contrast');
    }
    localStorage.setItem('a11y_active', prefs.isActive.toString());
    localStorage.setItem('a11y_type', prefs.daltonismType);
    localStorage.setItem('a11y_patterns', prefs.visualPatterns.toString());
    localStorage.setItem('a11y_contrast', prefs.highContrast.toString());
  }, [prefs]);

  const update = (patch: Partial<A11yPrefs>) => setPrefs(p => ({ ...p, ...patch }));

  return (
    <A11yContext.Provider value={{ prefs, update, isPanelOpen, setIsPanelOpen }}>
      {children}
    </A11yContext.Provider>
  );
};

export const useA11y = () => {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error('useA11y must be used inside A11yProvider');
  return ctx;
};
