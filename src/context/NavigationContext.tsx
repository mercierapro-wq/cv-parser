'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface NavigationContextType {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  pendingUrl: string | null;
  setPendingUrl: (url: string | null) => void;
  showUnsavedModal: boolean;
  setShowUnsavedModal: (show: boolean) => void;
  handleNavigation: (url: string, routerPush: (url: string) => void) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const handleNavigation = useCallback((url: string, routerPush: (url: string) => void) => {
    if (isDirty) {
      setPendingUrl(url);
      setShowUnsavedModal(true);
    } else {
      routerPush(url);
    }
  }, [isDirty]);

  return (
    <NavigationContext.Provider value={{ 
      isDirty, 
      setIsDirty, 
      pendingUrl, 
      setPendingUrl, 
      showUnsavedModal, 
      setShowUnsavedModal,
      handleNavigation
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation doit être utilisé à l\'intérieur d\'un NavigationProvider');
  }
  return context;
};
