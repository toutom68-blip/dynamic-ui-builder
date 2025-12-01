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
};
