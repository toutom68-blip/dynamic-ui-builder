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

const JWT_STORAGE_KEY = 'auth_token';
const JWT_DATA_STORAGE_KEY = 'auth_jwt_data';

/**
 * Decode a JWT token without verification
 * Note: This only decodes, it does NOT verify the signature
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
 * Store JWT token in localStorage
 */
export const storeJWT = (token: string): void => {
  localStorage.setItem(JWT_STORAGE_KEY, token);
  
  const decoded = decodeJWT(token);
  if (decoded) {
    localStorage.setItem(JWT_DATA_STORAGE_KEY, JSON.stringify(decoded.payload));
  }
};

/**
 * Get stored JWT token from localStorage
 */
export const getStoredJWT = (): string | null => {
  return localStorage.getItem(JWT_STORAGE_KEY);
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
};

/**
 * Check if there's a valid (non-expired) JWT stored
 */
export const hasValidStoredJWT = (): boolean => {
  const token = getStoredJWT();
  if (!token) return false;
  return !isJWTExpired(token);
};
