import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { Loader2, Mail, Phone } from 'lucide-react';
import { authConfig } from './auth.config';
import { authService } from './auth.service';

type SelectedAuthMethod = 'email' | 'phone';

const Auth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  
  // Determine initial method based on config
  const getInitialMethod = (): SelectedAuthMethod => {
    if (authConfig.allowEmail) return 'email';
    if (authConfig.allowPhone) return 'phone';
    return 'email';
  };
  
  const [selectedMethod, setSelectedMethod] = useState<SelectedAuthMethod>(getInitialMethod());
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupIdentifier, setSignupIdentifier] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [phoneForOtp, setPhoneForOtp] = useState('');

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string) => {
    // Basic phone validation - allows various formats
    return /^[\d\s\-+()]{8,20}$/.test(phone.replace(/\s/g, ''));
  };

  const validateIdentifier = (value: string): boolean => {
    if (selectedMethod === 'email') {
      return validateEmail(value);
    }
    return validatePhone(value);
  };

  const getIdentifierError = (): string => {
    if (selectedMethod === 'email') {
      return t('auth.invalidEmail');
    }
    return t('auth.invalidPhone');
  };

  const getIdentifierRequiredError = (): string => {
    if (selectedMethod === 'email') {
      return t('auth.emailRequired');
    }
    return t('auth.phoneRequired');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginIdentifier) {
      toast.error(getIdentifierRequiredError());
      return;
    }
    if (!validateIdentifier(loginIdentifier)) {
      toast.error(getIdentifierError());
      return;
    }

    // If phone number and OTP is enabled, show OTP input
    if (selectedMethod === 'phone') {
      setIsLoading(true);
      try {
        await authService.sendOtp(loginIdentifier);
        setPhoneForOtp(loginIdentifier);
        setShowOtpInput(true);
        toast.success(t('auth.otpSent'));
      } catch (error) {
        toast.error(t('auth.loginError'));
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Email login with password
    if (!loginPassword) {
      toast.error(t('auth.passwordRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await login(loginIdentifier, loginPassword);
      toast.success(t('auth.loginSuccess'));
      navigate('/');
    } catch (error) {
      toast.error(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpValue || otpValue.length !== 6) {
      toast.error(t('auth.otpRequired'));
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyOtp(phoneForOtp, otpValue);
      toast.success(t('auth.loginSuccess'));
      navigate('/');
    } catch (error) {
      toast.error(t('auth.otpInvalid'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      await authService.sendOtp(phoneForOtp);
      toast.success(t('auth.otpResent'));
    } catch (error) {
      toast.error(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    try {
      await authService.loginWithSocial(provider);
      toast.success(t('auth.loginSuccess'));
      navigate('/');
    } catch (error) {
      toast.error(t('auth.loginError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupIdentifier) {
      toast.error(getIdentifierRequiredError());
      return;
    }
    if (!validateIdentifier(signupIdentifier)) {
      toast.error(getIdentifierError());
      return;
    }
    if (!signupPassword) {
      toast.error(t('auth.passwordRequired'));
      return;
    }
    if (signupPassword.length < 8) {
      toast.error(t('auth.passwordMinLength'));
      return;
    }
    if (signupPassword !== confirmPassword) {
      toast.error(t('auth.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      await signup(signupIdentifier, signupPassword);
      toast.success(t('auth.signupSuccess'));
      navigate('/');
    } catch (error) {
      toast.error(t('auth.signupError'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderMethodSelector = () => {
    if (!authConfig.showMethodSelector) return null;

    return (
      <div className="mb-4">
        <Label className="text-sm text-muted-foreground mb-2 block">
          {t('auth.selectMethod')}
        </Label>
        <RadioGroup
          value={selectedMethod}
          onValueChange={(value) => {
            setSelectedMethod(value as SelectedAuthMethod);
            setLoginIdentifier('');
            setSignupIdentifier('');
          }}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="method-email" />
            <Label htmlFor="method-email" className="flex items-center gap-1 cursor-pointer">
              <Mail className="h-4 w-4" />
              {t('auth.email')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="phone" id="method-phone" />
            <Label htmlFor="method-phone" className="flex items-center gap-1 cursor-pointer">
              <Phone className="h-4 w-4" />
              {t('auth.phone')}
            </Label>
          </div>
        </RadioGroup>
      </div>
    );
  };

  const renderIdentifierInput = (
    id: string,
    value: string,
    onChange: (value: string) => void
  ) => {
    const isEmail = selectedMethod === 'email';
    
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>
          {isEmail ? t('auth.email') : t('auth.phone')}
        </Label>
        <div className="relative">
          <Input
            id={id}
            type={isEmail ? 'email' : 'tel'}
            placeholder={isEmail ? 'name@example.com' : '+1 234 567 8900'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isLoading}
            className="pl-10"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {isEmail ? <Mail className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
          </div>
        </div>
      </div>
    );
  };

  const renderSocialButtons = () => {
    const socialProviders = [
      { name: 'google', icon: '🔍', color: 'hover:bg-red-50 hover:border-red-200' },
      { name: 'facebook', icon: '📘', color: 'hover:bg-blue-50 hover:border-blue-200' },
      { name: 'microsoft', icon: '🪟', color: 'hover:bg-blue-50 hover:border-blue-300' },
      { name: 'apple', icon: '🍎', color: 'hover:bg-gray-50 hover:border-gray-200' },
    ];

    return (
      <div className="space-y-3">
        <div className="relative">
          <Separator className="my-4" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-background px-2 text-xs text-muted-foreground">
              {t('auth.socialLogin')}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {socialProviders.map((provider) => (
            <Button
              key={provider.name}
              type="button"
              variant="outline"
              onClick={() => handleSocialLogin(provider.name)}
              disabled={isLoading}
              className={`w-full transition-colors ${provider.color}`}
            >
              <span className="mr-2 text-lg">{provider.icon}</span>
              {t(`auth.${provider.name}`)}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  const renderOtpVerification = () => {
    return (
      <form onSubmit={handleOtpVerification} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="otp-input">{t('auth.enterOtp')}</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otpValue}
              onChange={(value) => setOtpValue(value)}
              disabled={isLoading}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {t('auth.otpSent')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleResendOtp}
            disabled={isLoading}
            className="flex-1"
          >
            {t('auth.resendOtp')}
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('auth.verifyOtp')}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setShowOtpInput(false);
            setOtpValue('');
          }}
          className="w-full"
        >
          {t('common.cancel')}
        </Button>
      </form>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t('common.welcome')}
          </CardTitle>
          <CardDescription className="text-center">
            {t('auth.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('auth.signup')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              {showOtpInput ? (
                renderOtpVerification()
              ) : (
                <>
                  <form onSubmit={handleLogin} className="space-y-4">
                    {renderMethodSelector()}
                    {renderIdentifierInput('login-identifier', loginIdentifier, setLoginIdentifier)}
                    {selectedMethod === 'email' && (
                      <div className="space-y-2">
                        <Label htmlFor="login-password">{t('auth.password')}</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {selectedMethod === 'phone' ? t('auth.verifyOtp') : t('auth.login')}
                    </Button>
                  </form>
                  {renderSocialButtons()}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                {renderMethodSelector()}
                {renderIdentifierInput('signup-identifier', signupIdentifier, setSignupIdentifier)}
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{t('auth.password')}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('auth.signup')}
                </Button>
              </form>
              {renderSocialButtons()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
