export interface JWTPayload {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

export interface DecodedJWT {
  header: {
    alg: string;
    typ: string;
  };
  payload: JWTPayload;
  signature: string;
}

export interface JWTRenewalConfig {
  renewThresholdSeconds: number;
  onRenewSuccess?: (newToken: string) => void;
  onRenewFailure?: (error: Error) => void;
  renewEndpoint?: string;
}

const JWT_STORAGE_KEY = 'auth_token';
const JWT_DATA_STORAGE_KEY = 'auth_jwt_data';
const JWT_REFRESH_TOKEN_KEY = 'auth_refresh_token';

const DEFAULT_RENEWAL_CONFIG: JWTRenewalConfig = {
  renewThresholdSeconds: 300,
  renewEndpoint: '/api/auth/refresh',
};

let renewalTimer: ReturnType<typeof setTimeout> | null = null;
let renewalConfig: JWTRenewalConfig = { ...DEFAULT_RENEWAL_CONFIG };

/**
 * Decode a JWT token without verification
 */
export const decodeJWT = (token: string): DecodedJWT | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    const [headerB64, payloadB64, signature] = parts;

    const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')));

    return { header, payload, signature };
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 */
export const isJWTExpired = (token: string): boolean => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.payload.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.payload.exp < currentTime;
};

/**
 * Get time until JWT expiration in seconds
 */
export const getJWTTimeToExpiry = (token: string): number | null => {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.payload.exp) {
    return null;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.payload.exp - currentTime;
};

/**
 * Check if JWT should be renewed based on threshold
 */
export const shouldRenewJWT = (token: string, thresholdSeconds?: number): boolean => {
  const threshold = thresholdSeconds ?? renewalConfig.renewThresholdSeconds;
  const timeToExpiry = getJWTTimeToExpiry(token);
  
  if (timeToExpiry === null) return true;
  return timeToExpiry <= threshold;
};

/**
 * Store JWT token in localStorage
 */
export const storeJWT = (token: string, refreshToken?: string): void => {
  localStorage.setItem(JWT_STORAGE_KEY, token);
  
  if (refreshToken) {
    localStorage.setItem(JWT_REFRESH_TOKEN_KEY, refreshToken);
  }
  
  const decoded = decodeJWT(token);
  if (decoded) {
    localStorage.setItem(JWT_DATA_STORAGE_KEY, JSON.stringify(decoded.payload));
  }
  
  scheduleTokenRenewal(token);
};

/**
 * Get stored JWT token from localStorage
 */
export const getStoredJWT = (): string | null => {
  return localStorage.getItem(JWT_STORAGE_KEY);
};

/**
 * Get stored refresh token from localStorage
 */
export const getStoredRefreshToken = (): string | null => {
  return localStorage.getItem(JWT_REFRESH_TOKEN_KEY);
};

/**
 * Get stored decoded JWT data from localStorage
 */
export const getStoredJWTData = (): JWTPayload | null => {
  const data = localStorage.getItem(JWT_DATA_STORAGE_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

/**
 * Remove JWT token and data from localStorage
 */
export const clearJWT = (): void => {
  localStorage.removeItem(JWT_STORAGE_KEY);
  localStorage.removeItem(JWT_DATA_STORAGE_KEY);
  localStorage.removeItem(JWT_REFRESH_TOKEN_KEY);
  
  if (renewalTimer) {
    clearTimeout(renewalTimer);
    renewalTimer = null;
  }
};

/**
 * Check if there's a valid (non-expired) JWT stored
 */
export const hasValidStoredJWT = (): boolean => {
  const token = getStoredJWT();
  if (!token) return false;
  return !isJWTExpired(token);
};

/**
 * Configure JWT auto-renewal settings
 */
export const configureJWTRenewal = (config: Partial<JWTRenewalConfig>): void => {
  renewalConfig = { ...renewalConfig, ...config };
  
  const token = getStoredJWT();
  if (token && !isJWTExpired(token)) {
    scheduleTokenRenewal(token);
  }
};

/**
 * Schedule automatic token renewal
 */
export const scheduleTokenRenewal = (token: string): void => {
  if (renewalTimer) {
    clearTimeout(renewalTimer);
    renewalTimer = null;
  }
  
  const timeToExpiry = getJWTTimeToExpiry(token);
  if (timeToExpiry === null || timeToExpiry <= 0) return;
  
  const renewalDelay = Math.max(
    (timeToExpiry - renewalConfig.renewThresholdSeconds) * 1000,
    0
  );
  
  if (renewalDelay === 0) {
    renewToken();
    return;
  }
  
  renewalTimer = setTimeout(() => {
    renewToken();
  }, renewalDelay);
};

/**
 * Attempt to renew the JWT token
 */
export const renewToken = async (): Promise<string | null> => {
  const refreshToken = getStoredRefreshToken();
  const currentToken = getStoredJWT();
  
  if (!refreshToken && !currentToken) {
    return null;
  }
  
  try {
    const response = await fetch(renewalConfig.renewEndpoint || '/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken && { 'Authorization': `Bearer ${currentToken}` }),
      },
      body: JSON.stringify({ 
        refreshToken,
        token: currentToken 
      }),
    });
    
    if (!response.ok) {
      throw new Error('Token renewal failed');
    }
    
    const data = await response.json();
    const newToken = data.token || data.accessToken;
    const newRefreshToken = data.refreshToken;
    
    if (newToken) {
      storeJWT(newToken, newRefreshToken);
      renewalConfig.onRenewSuccess?.(newToken);
      return newToken;
    }
    
    throw new Error('No token in response');
  } catch (error) {
    console.error('Token renewal failed:', error);
    renewalConfig.onRenewFailure?.(error as Error);
    return null;
  }
};

/**
 * Initialize auto-renewal on app start
 */
export const initializeJWTAutoRenewal = (config?: Partial<JWTRenewalConfig>): void => {
  if (config) {
    configureJWTRenewal(config);
  }
  
  const token = getStoredJWT();
  if (token && !isJWTExpired(token)) {
    scheduleTokenRenewal(token);
  }
};
