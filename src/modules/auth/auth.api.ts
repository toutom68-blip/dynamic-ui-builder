/**
 * Auth module API endpoints
 */

import { API_BASE } from '@/constants/api.constants';

export const AUTH_API = {
  // Authentication
  LOGIN: `${API_BASE.AUTH}/login`,
  LOGOUT: `${API_BASE.API_AUTH}/logout`,
  REGISTER: `${API_BASE.API_AUTH}/register`,
  REFRESH: `${API_BASE.API_AUTH}/refresh`,
  CHECK: `${API_BASE.API_AUTH}/login`,
  
  // OTP
  SEND_OTP: `${API_BASE.API_AUTH}/send-otp`,
  VERIFY_OTP: `${API_BASE.API_AUTH}/verify-otp`,
  
  // Social login
  SOCIAL: (provider: string) => `${API_BASE.API_AUTH}/social/${provider}`,
  
  // Password reset
  PASSWORD_RESET_SEND: `${API_BASE.API_AUTH}/password-reset/send`,
  PASSWORD_RESET_VERIFY: `${API_BASE.API_AUTH}/password-reset/verify`,
  PASSWORD_RESET_COMPLETE: `${API_BASE.API_AUTH}/password-reset/complete`,
  
  // Email verification
  VERIFICATION_EMAIL_SEND: `${API_BASE.API_AUTH}/verification/email/send`,
  VERIFICATION_EMAIL_RESEND: `${API_BASE.API_AUTH}/verification/email/resend`,
  VERIFICATION_EMAIL_VERIFY: `${API_BASE.API_AUTH}/verification/email/verify`,
  
  // Phone verification
  VERIFICATION_PHONE_SEND: `${API_BASE.API_AUTH}/verification/phone/send`,
  VERIFICATION_PHONE_RESEND: `${API_BASE.API_AUTH}/verification/phone/resend`,
  VERIFICATION_PHONE_VERIFY: `${API_BASE.API_AUTH}/verification/phone/verify`,
  
  // User profile
  USER_LANGUAGE: `${API_BASE.API_USER}/language`,
  USER_AVATAR: `${API_BASE.API_USER}/avatar`,
  USER_PROFILE_COMPLETE: `${API_BASE.API_USER}/profile/complete`,
} as const;
