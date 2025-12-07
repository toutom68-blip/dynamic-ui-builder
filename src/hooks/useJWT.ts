import { useState, useEffect, useCallback, useRef } from 'react';
import {
  JWTPayload,
  JWTRenewalConfig,
  decodeJWT,
  isJWTExpired,
  getJWTTimeToExpiry,
  storeJWT,
  getStoredJWT,
  getStoredJWTData,
  clearJWT,
  hasValidStoredJWT,
  shouldRenewJWT,
  renewToken,
  configureJWTRenewal,
  initializeJWTAutoRenewal,
} from '@/utils/jwt';

export interface UseJWTOptions {
  autoRenew?: boolean;
  renewThresholdSeconds?: number;
  onRenewSuccess?: (newToken: string) => void;
  onRenewFailure?: (error: Error) => void;
  onExpired?: () => void;
}

export interface UseJWTReturn {
  token: string | null;
  payload: JWTPayload | null;
  isExpired: boolean;
  isRenewing: boolean;
  timeToExpiry: number | null;
  setToken: (token: string, refreshToken?: string) => void;
  clear: () => void;
  refresh: () => void;
  manualRenew: () => Promise<string | null>;
}

export const useJWT = (options: UseJWTOptions = {}): UseJWTReturn => {
  const {
    autoRenew = true,
    renewThresholdSeconds = 300,
    onRenewSuccess,
    onRenewFailure,
    onExpired,
  } = options;

  const [token, setTokenState] = useState<string | null>(null);
  const [payload, setPayload] = useState<JWTPayload | null>(null);
  const [isExpired, setIsExpired] = useState<boolean>(true);
  const [isRenewing, setIsRenewing] = useState<boolean>(false);
  const [timeToExpiry, setTimeToExpiry] = useState<number | null>(null);
  
  const onExpiredRef = useRef(onExpired);
  onExpiredRef.current = onExpired;

  // Initialize auto-renewal configuration
  useEffect(() => {
    if (autoRenew) {
      const config: Partial<JWTRenewalConfig> = {
        renewThresholdSeconds,
        onRenewSuccess: (newToken) => {
          setTokenState(newToken);
          const decoded = decodeJWT(newToken);
          if (decoded) {
            setPayload(decoded.payload);
            setIsExpired(false);
            setTimeToExpiry(getJWTTimeToExpiry(newToken));
          }
          onRenewSuccess?.(newToken);
        },
        onRenewFailure: (error) => {
          onRenewFailure?.(error);
        },
      };
      
      initializeJWTAutoRenewal(config);
    }
  }, [autoRenew, renewThresholdSeconds, onRenewSuccess, onRenewFailure]);

  // Initialize from localStorage
  useEffect(() => {
    const storedToken = getStoredJWT();
    const storedData = getStoredJWTData();
    
    if (storedToken && hasValidStoredJWT()) {
      setTokenState(storedToken);
      setPayload(storedData);
      setIsExpired(false);
      setTimeToExpiry(getJWTTimeToExpiry(storedToken));
      
      // Check if should renew immediately
      if (autoRenew && shouldRenewJWT(storedToken, renewThresholdSeconds)) {
        manualRenew();
      }
    } else if (storedToken) {
      // Token exists but is expired
      clearJWT();
      setIsExpired(true);
      onExpiredRef.current?.();
    }
  }, [autoRenew, renewThresholdSeconds]);

  // Auto-check expiration
  useEffect(() => {
    if (!token) return;

    const checkExpiration = () => {
      const expired = isJWTExpired(token);
      const ttl = getJWTTimeToExpiry(token);
      
      setIsExpired(expired);
      setTimeToExpiry(ttl);
      
      if (expired) {
        clearJWT();
        setTokenState(null);
        setPayload(null);
        onExpiredRef.current?.();
      }
    };

    // Check immediately
    checkExpiration();

    // Check every 30 seconds for more responsive expiration handling
    const interval = setInterval(checkExpiration, 30000);

    return () => clearInterval(interval);
  }, [token]);

  const setToken = useCallback((newToken: string, refreshToken?: string) => {
    storeJWT(newToken, refreshToken);
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

  const manualRenew = useCallback(async (): Promise<string | null> => {
    setIsRenewing(true);
    try {
      const newToken = await renewToken();
      if (newToken) {
        setTokenState(newToken);
        const decoded = decodeJWT(newToken);
        if (decoded) {
          setPayload(decoded.payload);
          setIsExpired(false);
          setTimeToExpiry(getJWTTimeToExpiry(newToken));
        }
      }
      return newToken;
    } finally {
      setIsRenewing(false);
    }
  }, []);

  return {
    token,
    payload,
    isExpired,
    isRenewing,
    timeToExpiry,
    setToken,
    clear,
    refresh,
    manualRenew,
  };
};
