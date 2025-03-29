// lib/authService.ts
import ApiService, { ApiResponse } from './apiService';
import { getOrCreateDeviceId } from '@/components/auth/utilities/authValidation';

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
  deviceId?: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName?: string;
}

export interface VerifyOTPRequest {
  otp: string;
  tempToken: string;
  rememberDevice?: boolean;
  deviceId?: string;
}

export interface VerifyEmailRequest {
  otp: string;
  token?: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface UserData {
  id: string;
  username: string;
  fullName: string | null;
  email: string;
  profileImage?: string;
  twoFactorEnabled?: boolean;
  isEmailVerified?: boolean;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  requireTwoFactor?: boolean;
  requireEmailVerification?: boolean;
  tempToken?: string;
  expiresAt?: number;
  message?: string;
  user?: UserData;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
  requireEmailVerification?: boolean;
  tempToken?: string;
  user?: UserData;
}

export interface VerifyOTPResponse {
  success: boolean;
  token?: string;
  user?: UserData;
  message?: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  token?: string;
  user?: UserData;
  message?: string;
}

export interface UserResponse {
  success: boolean;
  user: UserData;
  message?: string;
}

class AuthService extends ApiService {
  private static instance: AuthService;

  private constructor() {
    super();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Login user
  public async login(data: LoginRequest): Promise<LoginResponse> {
    // Ensure deviceId is included
    const deviceId = data.deviceId || getOrCreateDeviceId();
    
    return this.post<LoginResponse>('/auth/login', {
      ...data,
      deviceId
    });
  }

  // Register user
  public async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.post<RegisterResponse>('/auth/register', data);
  }

  // Verify OTP for 2FA
  public async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    // Ensure deviceId is included
    const deviceId = data.deviceId || getOrCreateDeviceId();
    
    return this.post<VerifyOTPResponse>('/auth/verify-otp', {
      ...data,
      deviceId
    });
  }

  // Verify email
  public async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    return this.post<VerifyEmailResponse>('/auth/verify-email', data);
  }
  
  // Verify email token
  public async verifyEmailToken(token: string): Promise<ApiResponse> {
    return this.post<ApiResponse>('/auth/verify-email-token', { token });
  }
  
  // Resend email verification
  public async resendEmailVerification(email: string): Promise<ApiResponse> {
    return this.post<ApiResponse>('/auth/resend-email-verification', { email });
  }

  // Verify temp token
  public async verifyTempToken(token: string): Promise<ApiResponse> {
    return this.post<ApiResponse>('/auth/verify-temp-token', { token });
  }

  // Get current user
  public async getCurrentUser(): Promise<UserResponse> {
    return this.get<UserResponse>('/auth/me');
  }

  // Forgot password request
  public async forgotPassword(email: string): Promise<ApiResponse> {
    return this.post<ApiResponse>('/auth/forgot-password', { email });
  }

  // Verify reset token
  public async verifyResetToken(token: string): Promise<ApiResponse> {
    return this.post<ApiResponse>('/auth/verify-reset-token', { token });
  }

  // Reset password
  public async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return this.post<ApiResponse>('/auth/reset-password', { token, password });
  }

  // Toggle 2FA
  public async toggleTwoFactor(enable: boolean): Promise<ApiResponse> {
    return this.post<ApiResponse>('/auth/toggle-two-factor', { enable });
  }

  // Logout (client-side only)
  public logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('tempToken');
    sessionStorage.removeItem('expiresAt');
  }
}

export default AuthService.getInstance();