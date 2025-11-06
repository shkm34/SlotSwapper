import { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [globalLoading, setGlobalLoading] = useState(false);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const value = {
    refreshTrigger,
    triggerRefresh,
    globalLoading,
    setGlobalLoading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
