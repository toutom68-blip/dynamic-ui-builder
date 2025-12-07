import { api } from '@/lib/axios';
import { User, AuthResponse } from './auth.types';
import { AUTH_API } from './auth.api';
import { storeJWT, clearJWT, getStoredJWTData, hasValidStoredJWT, initializeJWTAutoRenewal } from '@/utils/jwt';
import { hashCredentials, hashPassword, hashEmail, hashPhoneNumber } from '@/utils/hash';
import { CONTENT_TYPES } from '@/constants/api.constants';

export const authService = {
  passwordSalt: (import.meta.env.VITE_PASSWORD_SALT as string) || '',
  passwordHash: (import.meta.env.VITE_PASSWORD_HASH as string) || '',
  hashSalt: (import.meta.env.VITE_HASH_SALT as string) || '',

  /**
   * Initialize JWT auto-renewal system
   */
  initAutoRenewal(callbacks?: { onRenewSuccess?: (token: string) => void; onRenewFailure?: (error: Error) => void }) {
    initializeJWTAutoRenewal({
      renewThresholdSeconds: 300, // 5 minutes before expiry
      renewEndpoint: AUTH_API.REFRESH,
      ...callbacks,
    });
  },

  async checkAuth(): Promise<User | null> {
    try {
      // First check if we have a valid stored JWT
      if (hasValidStoredJWT()) {
        const jwtData = getStoredJWTData();
        if (jwtData) {
          // Initialize auto-renewal for existing session
          this.initAutoRenewal();

          // Return user data from stored JWT
          return {
            id: jwtData.sub || '',
            email: jwtData.email || '',
            name: jwtData.name,
            role: jwtData.role,
          } as User;
        }
      }

      // If no valid JWT, try to get fresh auth from server
      const response = await api.get<AuthResponse>(AUTH_API.CHECK);
      if (response.data.access_token) {
        storeJWT(response.data.access_token, response.data.refreshToken);
        this.initAutoRenewal();
      }
      return response.data.user || response.data as unknown as User;
    } catch (error) {
      clearJWT();
      return null;
    }
  },

  /**
   * Legacy password encoding (kept for backward compatibility)
   */
  async encodePassword(password: string) {
    const pwdSalt = JSON.parse(this.passwordSalt);
    let indexHash = 0;
    let indexPswd = 0;
    let pswd = '';
    for (let index = 0; index < pwdSalt.length; index++) {
      const element = pwdSalt[index];
      if (element % 2 === 0) {
        pswd += this.passwordHash?.substring(indexHash, indexHash + element);
        indexHash += element;
      } else {
        if (indexPswd > password.length) {
          break;
        }
        const end =
          indexPswd + element > password.length
            ? password.length
            : indexPswd + element;
        pswd += password.substring(indexPswd, end);
        indexPswd += element;
        if (end >= password.length) {
          break;
        }
      }
    }
    return pswd;
  },

  /**
   * Secure hash for credentials using SHA-256
   */
  async hashCredentialsSecure(identifier: string, password: string) {
    return hashCredentials(identifier, password, this.hashSalt);
  },

  /**
   * Hash password with salt
   */
  async hashPasswordSecure(password: string) {
    return hashPassword(password, this.hashSalt);
  },

  /**
   * Hash email for secure transmission
   */
  async hashEmailSecure(email: string) {
    return hashEmail(email, this.hashSalt);
  },

  /**
   * Hash phone number for secure transmission
   */
  async hashPhoneSecure(phoneNumber: string) {
    return hashPhoneNumber(phoneNumber, this.hashSalt);
  },

  /**
   * Create a secure login payload with hashed credentials
   */
  async createSecureLoginPayload(identifier: string, password: string) {
    const isEmail = identifier.indexOf('@') !== -1;
    const { hashedIdentifier, hashedPassword, combinedHash } = await this.hashCredentialsSecure(identifier, password);

    // Also use legacy encoding for backward compatibility
    const legacyPassword = await this.encodePassword(password);

    return {
      ...(isEmail ? { email: identifier } : { phoneNbr: identifier }),
      password: legacyPassword,
      secureHash: {
        identifier: hashedIdentifier,
        password: hashedPassword,
        combined: combinedHash,
      },
    };
  },

  async login(loginId: string, password: string): Promise<User> {
    if (!loginId || !password) {
      throw new Error('Login ID and password are required');
    }
    const loginPassword = await this.encodePassword(password);
    let data = {};
    if (loginId.indexOf('@') === -1) {
      data = { phoneNbr: loginId, password: loginPassword };
    } else {
      data = { email: loginId, password: loginPassword };
    }
    const response = await api.post<AuthResponse>(AUTH_API.LOGIN, data);

    // Store JWT token if returned
    if (response.data.access_token) {
      storeJWT(response.data.access_token);
    }

    return response.data.user || response.data as unknown as User;
  },

  async signup(email: string, password: string): Promise<User> {
    const response = await api.post<User>(AUTH_API.REGISTER, { email, password });
    return response.data;
  },

  async logout(): Promise<void> {
    clearJWT();
    await api.post(AUTH_API.LOGOUT);
  },

  async updateLanguage(language: string): Promise<void> {
    await api.put(AUTH_API.USER_LANGUAGE, { language });
  },

  async sendOtp(phoneNumber: string): Promise<void> {
    await api.post(AUTH_API.SEND_OTP, { phoneNumber });
  },

  async verifyOtp(phoneNumber: string, otp: string): Promise<User> {
    const response = await api.post<User>(AUTH_API.VERIFY_OTP, { phoneNumber, otp });
    return response.data;
  },

  async loginWithSocial(provider: string): Promise<User> {
    const response = await api.post<User>(AUTH_API.SOCIAL(provider));
    return response.data;
  },

  async sendPasswordResetCode(identifier: string): Promise<void> {
    const isEmail = identifier.indexOf('@') !== -1;
    const data = isEmail ? { email: identifier } : { phoneNbr: identifier };
    await api.post(AUTH_API.PASSWORD_RESET_SEND, data);
  },

  async verifyResetCode(identifier: string, code: string): Promise<{ token: string }> {
    const isEmail = identifier.indexOf('@') !== -1;
    const data = isEmail
      ? { email: identifier, code }
      : { phoneNbr: identifier, code };
    const response = await api.post<{ token: string }>(AUTH_API.PASSWORD_RESET_VERIFY, data);
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const encodedPassword = await this.encodePassword(newPassword);
    await api.post(AUTH_API.PASSWORD_RESET_COMPLETE, {
      token,
      password: encodedPassword
    });
  },

  async sendVerificationEmail(email: string): Promise<void> {
    await api.post(AUTH_API.VERIFICATION_EMAIL_SEND, { email });
  },

  async resendVerificationEmail(email: string): Promise<void> {
    await api.post(AUTH_API.VERIFICATION_EMAIL_RESEND, { email });
  },

  async verifyEmail(email: string, code: string): Promise<void> {
    await api.post(AUTH_API.VERIFICATION_EMAIL_VERIFY, { email, code });
  },

  async sendVerificationOtp(phoneNumber: string): Promise<void> {
    await api.post(AUTH_API.VERIFICATION_PHONE_SEND, { phoneNbr: phoneNumber });
  },

  async resendVerificationOtp(phoneNumber: string): Promise<void> {
    await api.post(AUTH_API.VERIFICATION_PHONE_RESEND, { phoneNbr: phoneNumber });
  },

  async verifyPhone(phoneNumber: string, otp: string): Promise<void> {
    await api.post(AUTH_API.VERIFICATION_PHONE_VERIFY, { phoneNbr: phoneNumber, otp });
  },

  async uploadAvatar(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', file);
    formData.append('userId', userId);
    const response = await api.post<{ url: string }>(AUTH_API.USER_AVATAR, formData, {
      headers: {
        'Content-Type': CONTENT_TYPES.FORM_DATA,
      },
    });
    return response.data.url;
  },

  async completeProfile(userId: string, profileData: Record<string, any>): Promise<void> {
    await api.post(AUTH_API.USER_PROFILE_COMPLETE, { userId, ...profileData });
  },
};
