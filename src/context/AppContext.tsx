import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  selectedGroup: any;
  setSelectedGroup: (group: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [selectedGroup, setSelectedGroup] = useState(null);

  return (
    <AppContext.Provider value={{
      selectedGroup,
      setSelectedGroup,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}