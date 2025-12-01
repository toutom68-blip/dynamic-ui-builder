import { useEffect } from 'react';
import { useLoading } from '@/contexts/LoadingContext';
import { setLoadingCallbacks } from '@/lib/axios';

/**
 * Hook to integrate the loading context with axios interceptors
 * Should be called once at the app level
 */
export const useLoadingIntegration = () => {
  const { startLoading, stopLoading } = useLoading();

  useEffect(() => {
    setLoadingCallbacks({
      start: startLoading,
      stop: stopLoading,
    });
  }, [startLoading, stopLoading]);
};
