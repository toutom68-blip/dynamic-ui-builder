import { useState, useEffect, useCallback } from 'react';
import {
  JWTPayload,
  decodeJWT,
  isJWTExpired,
  getJWTTimeToExpiry,
  storeJWT,
  getStoredJWT,
  getStoredJWTData,
  clearJWT,
  hasValidStoredJWT,
} from '@/utils/jwt';

export interface UseJWTReturn {
  token: string | null;
  payload: JWTPayload | null;
  isExpired: boolean;
  timeToExpiry: number | null;
  setToken: (token: string) => void;
  clear: () => void;
  refresh: () => void;
}

export const useJWT = (): UseJWTReturn => {
  const [token, setTokenState] = useState<string | null>(null);
  const [payload, setPayload] = useState<JWTPayload | null>(null);
  const [isExpired, setIsExpired] = useState<boolean>(true);
  const [timeToExpiry, setTimeToExpiry] = useState<number | null>(null);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = getStoredJWT();
    const storedData = getStoredJWTData();
    
    if (storedToken && hasValidStoredJWT()) {
      setTokenState(storedToken);
      setPayload(storedData);
      setIsExpired(false);
      setTimeToExpiry(getJWTTimeToExpiry(storedToken));
    } else if (storedToken) {
      // Token exists but is expired
      clearJWT();
      setIsExpired(true);
    }
  }, []);

  // Auto-check expiration
  useEffect(() => {
    if (!token) return;

    const checkExpiration = () => {
      const expired = isJWTExpired(token);
      setIsExpired(expired);
      setTimeToExpiry(getJWTTimeToExpiry(token));
      
      if (expired) {
        clearJWT();
        setTokenState(null);
        setPayload(null);
      }
    };

    // Check immediately
    checkExpiration();

    // Check every minute
    const interval = setInterval(checkExpiration, 60000);

    return () => clearInterval(interval);
  }, [token]);

  const setToken = useCallback((newToken: string) => {
    storeJWT(newToken);
    setTokenState(newToken);
    
    const decoded = decodeJWT(newToken);
    if (decoded) {
      setPayload(decoded.payload);
      setIsExpired(isJWTExpired(newToken));
      setTimeToExpiry(getJWTTimeToExpiry(newToken));
    }
  }, []);

  const clear = useCallback(() => {
    clearJWT();
    setTokenState(null);
    setPayload(null);
    setIsExpired(true);
    setTimeToExpiry(null);
  }, []);

  const refresh = useCallback(() => {
    const storedToken = getStoredJWT();
    if (storedToken && !isJWTExpired(storedToken)) {
      setTokenState(storedToken);
      const decoded = decodeJWT(storedToken);
      if (decoded) {
        setPayload(decoded.payload);
        setIsExpired(false);
        setTimeToExpiry(getJWTTimeToExpiry(storedToken));
      }
    } else {
      clear();
    }
  }, [clear]);

  return {
    token,
    payload,
    isExpired,
    timeToExpiry,
    setToken,
    clear,
    refresh,
  };
};
