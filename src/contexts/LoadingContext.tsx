import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LoadingSpinner } from '@/modules/shared/components/LoadingSpinner';

interface LoadingContextType {
  isLoading: boolean;
  loadingText?: string;
  startLoading: (text?: string) => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string | undefined>();
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = (text?: string) => {
    setLoadingCount((prev) => prev + 1);
    setIsLoading(true);
    if (text) {
      setLoadingText(text);
    }
  };

  const stopLoading = () => {
    setLoadingCount((prev) => {
      const newCount = Math.max(0, prev - 1);
      if (newCount === 0) {
        setIsLoading(false);
        setLoadingText(undefined);
      }
      return newCount;
    });
  };

  const value: LoadingContextType = {
    isLoading,
    loadingText,
    startLoading,
    stopLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && <LoadingSpinner fullScreen text={loadingText} size="lg" />}
    </LoadingContext.Provider>
  );
};
