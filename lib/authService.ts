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
  rememberMe?: boolean;
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
  private csrfToken: string | null = null;

  private constructor() {
    super();
    
    // ตั้งค่า CSRF token ถ้ามี
    this.fetchCsrfToken();
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  // สร้างหรือดึง CSRF token จาก localStorage หรือร้องขอจาก API
  private async fetchCsrfToken(): Promise<string | null> {
    try {
      // ดึง token จาก localStorage ถ้ามี
      const storedToken = localStorage.getItem('csrfToken');
      if (storedToken) {
        this.csrfToken = storedToken;
        return storedToken;
      }
      
      // ถ้าไม่มี token ให้ร้องขอจาก API (ในสภาพแวดล้อมจริง)
      // const response = await this.get<{ token: string }>('/auth/csrf-token');
      // if (response.token) {
      //   localStorage.setItem('csrfToken', response.token);
      //   this.csrfToken = response.token;
      //   return response.token;
      // }
      
      // สร้าง token จำลองขึ้นมาเอง (เพื่อการทดสอบ)
      const mockToken = `csrf-${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('csrfToken', mockToken);
      this.csrfToken = mockToken;
      return mockToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      return null;
    }
  }
  
  // เพิ่ม CSRF token ในทุก request
  private async getRequestOptions(): Promise<RequestInit> {
    // ให้แน่ใจว่ามี CSRF token
    if (!this.csrfToken) {
      await this.fetchCsrfToken();
    }
    
    return {
      headers: {
        'X-CSRF-Token': this.csrfToken || '',
      }
    };
  }

  // Login user
  public async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      // Ensure deviceId is included for device tracking
      const deviceId = data.deviceId || getOrCreateDeviceId();
      
      // Add user agent information for better tracking and security
      const options = await this.getRequestOptions();
      options.headers = {
        ...options.headers,
        'User-Agent': navigator.userAgent || 'Unknown Browser'
      };
      
      // Make the login request to the API
      const response = await this.post<LoginResponse>('/auth/login', {
        ...data,
        deviceId
      }, options);
      
      return response;
    } catch (error) {
      // Let the caller handle specific API errors
      throw error;
    }
  }

  // Register user
  public async register(data: RegisterRequest): Promise<RegisterResponse> {
    const options = await this.getRequestOptions();
    return this.post<RegisterResponse>('/auth/register', data, options);
  }

  // Verify OTP for 2FA
  public async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    // Ensure deviceId is included
    const deviceId = data.deviceId || getOrCreateDeviceId();
    
    const options = await this.getRequestOptions();
    return this.post<VerifyOTPResponse>('/auth/verify-otp', {
      ...data,
      deviceId
    }, options);
  }

  // Verify email
  public async verifyEmail(data: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    const options = await this.getRequestOptions();
    return this.post<VerifyEmailResponse>('/auth/verify-email', data, options);
  }
  
  // Verify email token
  public async verifyEmailToken(token: string): Promise<ApiResponse> {
    const options = await this.getRequestOptions();
    return this.post<ApiResponse>('/auth/verify-email-token', { token }, options);
  }
  
  // Resend email verification
  public async resendEmailVerification(email: string): Promise<ApiResponse> {
    const options = await this.getRequestOptions();
    return this.post<ApiResponse>('/auth/resend-email-verification', { email }, options);
  }

  // Verify temp token
  public async verifyTempToken(token: string): Promise<ApiResponse> {
    const options = await this.getRequestOptions();
    return this.post<ApiResponse>('/auth/verify-temp-token', { token }, options);
  }

  // Get current user
  public async getCurrentUser(): Promise<UserResponse> {
    const options = await this.getRequestOptions();
    return this.get<UserResponse>('/auth/me', options);
  }

  // Forgot password request
  public async forgotPassword(email: string): Promise<ApiResponse> {
    const options = await this.getRequestOptions();
    return this.post<ApiResponse>('/auth/forgot-password', { email }, options);
  }

  // Verify reset token
  public async verifyResetToken(token: string): Promise<ApiResponse> {
    const options = await this.getRequestOptions();
    return this.post<ApiResponse>('/auth/verify-reset-token', { token }, options);
  }

  // Reset password
  public async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const options = await this.getRequestOptions();
    return this.post<ApiResponse>('/auth/reset-password', { token, password }, options);
  }

  // Toggle 2FA
  public async toggleTwoFactor(enable: boolean): Promise<ApiResponse> {
    const options = await this.getRequestOptions();
    return this.post<ApiResponse>('/auth/toggle-two-factor', { enable }, options);
  }

  // Logout (client-side only)
  public logout(): void {
    localStorage.removeItem('token');
    sessionStorage.removeItem('tempToken');
    sessionStorage.removeItem('expiresAt');
    sessionStorage.removeItem('rememberMe');
    
    // ไม่ควรลบ CSRF token เมื่อออกจากระบบ เพื่อป้องกันการโจมตีแบบ CSRF
    // localStorage.removeItem('csrfToken');
  }
}

export default AuthService.getInstance();