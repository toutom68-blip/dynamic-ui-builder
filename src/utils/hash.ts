/**
 * Secure hashing utilities for credentials
 * Uses Web Crypto API for secure SHA-256 hashing
 */

const HASH_ITERATIONS = 10000;
const HASH_ALGORITHM = 'SHA-256';

/**
 * Convert ArrayBuffer to hex string
 */
const bufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Convert string to Uint8Array
 */
const stringToBuffer = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

/**
 * Generate a cryptographic hash using SHA-256
 */
export const sha256Hash = async (data: string): Promise<string> => {
  const buffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, buffer);
  return bufferToHex(hashBuffer);
};

/**
 * Generate a salted hash with multiple iterations for passwords
 */
export const hashWithSalt = async (
  data: string, 
  salt: string, 
  iterations: number = HASH_ITERATIONS
): Promise<string> => {
  let hash = data + salt;
  
  for (let i = 0; i < iterations; i++) {
    hash = await sha256Hash(hash + salt + i.toString());
  }
  
  return hash;
};

/**
 * Hash credentials (email/phone + password) for secure transmission
 */
export const hashCredentials = async (
  identifier: string, // email or phone
  password: string,
  salt?: string
): Promise<{ hashedIdentifier: string; hashedPassword: string; combinedHash: string }> => {
  const effectiveSalt = salt || generateSalt();
  
  // Hash identifier (email or phone)
  const hashedIdentifier = await hashWithSalt(identifier.toLowerCase().trim(), effectiveSalt, 1000);
  
  // Hash password with more iterations for security
  const hashedPassword = await hashWithSalt(password, effectiveSalt, HASH_ITERATIONS);
  
  // Create combined hash for additional verification
  const combinedHash = await sha256Hash(hashedIdentifier + hashedPassword + effectiveSalt);
  
  return {
    hashedIdentifier,
    hashedPassword,
    combinedHash
  };
};

/**
 * Generate a random salt
 */
export const generateSalt = (length: number = 32): string => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return bufferToHex(array.buffer);
};

/**
 * Hash a password with PBKDF2-like approach
 */
export const hashPassword = async (
  password: string,
  salt?: string
): Promise<{ hash: string; salt: string }> => {
  const effectiveSalt = salt || generateSalt();
  const hash = await hashWithSalt(password, effectiveSalt, HASH_ITERATIONS);
  
  return { hash, salt: effectiveSalt };
};

/**
 * Verify a password against a stored hash
 */
export const verifyPassword = async (
  password: string,
  storedHash: string,
  salt: string
): Promise<boolean> => {
  const { hash } = await hashPassword(password, salt);
  return hash === storedHash;
};

/**
 * Create a login hash combining identifier and password
 */
export const createLoginHash = async (
  identifier: string,
  password: string,
  serverSalt?: string
): Promise<string> => {
  const timestamp = Math.floor(Date.now() / 30000).toString(); // 30-second window
  const { combinedHash } = await hashCredentials(identifier, password, serverSalt);
  
  // Add timestamp to prevent replay attacks (optional, depends on server implementation)
  return await sha256Hash(combinedHash + timestamp);
};

/**
 * Hash email for secure storage/transmission
 */
export const hashEmail = async (email: string, salt?: string): Promise<string> => {
  const normalizedEmail = email.toLowerCase().trim();
  return await hashWithSalt(normalizedEmail, salt || '', 1000);
};

/**
 * Hash phone number for secure storage/transmission
 */
export const hashPhoneNumber = async (phoneNumber: string, salt?: string): Promise<string> => {
  // Remove all non-numeric characters except +
  const normalizedPhone = phoneNumber.replace(/[^\d+]/g, '');
  return await hashWithSalt(normalizedPhone, salt || '', 1000);
};
