export type AuthMethod = 'email' | 'phone' | 'both';
export type OtpMode = 'standalone' | 'post-login';

export const authConfig = {
  method: (import.meta.env.VITE_AUTH_METHOD as AuthMethod) || 'email',
  otpMode: (import.meta.env.VITE_OTP_MODE as OtpMode) || 'standalone',
  
  get allowEmail(): boolean {
    return this.method === 'email' || this.method === 'both';
  },
  
  get allowPhone(): boolean {
    return this.method === 'phone' || this.method === 'both';
  },
  
  get showMethodSelector(): boolean {
    return this.method === 'both';
  },
  
  get isOtpStandalone(): boolean {
    return this.otpMode === 'standalone';
  },
  
  get isOtpPostLogin(): boolean {
    return this.otpMode === 'post-login';
  },
  
  get showOtpInAuth(): boolean {
    return this.allowPhone && this.isOtpStandalone;
  },
};
