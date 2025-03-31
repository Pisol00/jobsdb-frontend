"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import authService, { UserData, LoginResponse } from '@/lib/authService';
import { ApiError } from '@/lib/apiService';

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserData | null;
  loading: boolean;
  login: (token: string, userData: UserData) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  handleLoginResponse: (data: LoginResponse) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check auth status using token
  const checkAuth = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        setLoading(false);
        return false;
      }
      
      // Try to load user info from localStorage first
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const userData = JSON.parse(userInfo);
          setUser(userData);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Failed to parse user info:', error);
        }
      }
      
      // Verify token by fetching user data from API
      try {
        const response = await authService.getCurrentUser();
        
        if (response.success && response.user) {
          // Update user data
          localStorage.setItem('userInfo', JSON.stringify(response.user));
          setUser(response.user);
          setIsLoggedIn(true);
          setLoading(false);
          return true;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle expired token
        if (error instanceof ApiError && error.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userInfo');
          setUser(null);
          setIsLoggedIn(false);
        }
        setLoading(false);
        return false;
      }
      
      setLoading(false);
      return isLoggedIn;
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoggedIn(false);
      setUser(null);
      setLoading(false);
      return false;
    }
  }, [isLoggedIn]);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };
    
    initAuth();
  }, [checkAuth]);

  // Login function
  const login = useCallback((token: string, userData: UserData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  }, []);

  // Logout function
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsLoggedIn(false);
    
    // Clear session storage as well
    sessionStorage.removeItem('tempToken');
    sessionStorage.removeItem('expiresAt');
    sessionStorage.removeItem('rememberMe');
    
    router.push('/auth/login');
  }, [router]);

  // Handle login response, including 2FA and email verification
  const handleLoginResponse = useCallback((data: LoginResponse) => {
    if (data.requireTwoFactor) {
      // 2FA is required - redirect to OTP verification
      
      // Store temp token and expiration for 2FA
      sessionStorage.setItem('tempToken', data.tempToken || '');
      
      // Store rememberMe preference for after OTP verification
      if (data.rememberMe !== undefined) {
        sessionStorage.setItem('rememberMe', data.rememberMe.toString());
      }
      
      // Calculate expiration time if not provided
      let expiresAtTimestamp: number;
      
      // Store expiration time if provided
      if (data.expiresAt) {
        expiresAtTimestamp = data.expiresAt;
        sessionStorage.setItem('expiresAt', data.expiresAt.toString());
        console.log("Saved expiresAt to sessionStorage:", data.expiresAt);
      } else {
        // Calculate expiration time (10 minutes)
        expiresAtTimestamp = Date.now() + (10 * 60 * 1000);
        sessionStorage.setItem('expiresAt', expiresAtTimestamp.toString());
        console.log("Calculated and saved expiresAt:", expiresAtTimestamp);
      }
      
      // แก้ไข: ส่ง expiresAt ไปกับ URL เพื่อให้ route ทำงานถูกต้อง
      router.push(`/auth/verify-otp/${data.tempToken}?expiresAt=${expiresAtTimestamp}`);
    } else if (data.requireEmailVerification) {
      // Email verification is required
      if (data.tempToken) {
        router.push(`/auth/verify-email/${data.tempToken}?email=${encodeURIComponent(data.user?.email || '')}`);
      } else {
        router.push(`/auth/verify-email?email=${encodeURIComponent(data.user?.email || '')}`);
      }
    } else {
      // Standard login (no 2FA or email verification needed)
      login(data.token || '', data.user as UserData);
      router.push('/jobs');
    }
  }, [login, router]);

  const contextValue = {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    checkAuth,
    handleLoginResponse
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};