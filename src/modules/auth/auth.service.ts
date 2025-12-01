import { api } from '@/lib/axios';
import { User } from './auth.types';

export const authService = {
  passwordSalt: (import.meta.env.VITE_PASSWORD_SALT as string) || '',
  passwordHash: (import.meta.env.VITE_PASSWORD_HASH as string) || '',
  async checkAuth(): Promise<User | null> {
    try {
      const response = await api.get<User>('/api/auth/login');
      return response.data;
    } catch (error) {
      return null;
    }
  },

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
    const response = await api.post<User>('/api/auth/login', data);
    return response.data;
  },

  async signup(email: string, password: string): Promise<User> {
    const response = await api.post<User>('/api/auth/register', { email, password });
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/api/auth/logout');
  },

  async updateLanguage(language: string): Promise<void> {
    await api.put('/api/user/language', { language });
  },

  async sendOtp(phoneNumber: string): Promise<void> {
    await api.post('/api/auth/send-otp', { phoneNumber });
  },

  async verifyOtp(phoneNumber: string, otp: string): Promise<User> {
    const response = await api.post<User>('/api/auth/verify-otp', { phoneNumber, otp });
    return response.data;
  },

  async loginWithSocial(provider: string): Promise<User> {
    const response = await api.post<User>(`/api/auth/social/${provider}`);
    return response.data;
  },

  async sendPasswordResetCode(identifier: string): Promise<void> {
    // Determine if identifier is email or phone
    const isEmail = identifier.indexOf('@') !== -1;
    const data = isEmail ? { email: identifier } : { phoneNbr: identifier };
    await api.post('/api/auth/password-reset/send', data);
  },

  async verifyResetCode(identifier: string, code: string): Promise<{ token: string }> {
    const isEmail = identifier.indexOf('@') !== -1;
    const data = isEmail 
      ? { email: identifier, code } 
      : { phoneNbr: identifier, code };
    const response = await api.post<{ token: string }>('/api/auth/password-reset/verify', data);
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const encodedPassword = await this.encodePassword(newPassword);
    await api.post('/api/auth/password-reset/complete', { 
      token, 
      password: encodedPassword 
    });
  },
};
