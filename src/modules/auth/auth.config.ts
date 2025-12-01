export type AuthMethod = 'email' | 'phone' | 'both';

export const authConfig = {
  method: (import.meta.env.VITE_AUTH_METHOD as AuthMethod) || 'email',
  
  get allowEmail(): boolean {
    return this.method === 'email' || this.method === 'both';
  },
  
  get allowPhone(): boolean {
    return this.method === 'phone' || this.method === 'both';
  },
  
  get showMethodSelector(): boolean {
    return this.method === 'both';
  },
};
