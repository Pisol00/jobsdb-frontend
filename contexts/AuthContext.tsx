// สำหรับแก้ไขใน src/contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/api'; // เพิ่มการนำเข้าฟังก์ชันจาก api

interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  profileImage?: string;
  twoFactorEnabled?: boolean;
}

// Define the response type from getCurrentUser
interface UserResponse {
  success: boolean;
  user?: User;
  message?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  handleLoginResponse: (data: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // ตรวจสอบสถานะการเข้าสู่ระบบด้วย token
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
      
      // ลองโหลดข้อมูลผู้ใช้จาก localStorage ก่อน
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
      
      // ใช้ฟังก์ชัน getCurrentUser เพื่อตรวจสอบข้อมูลผู้ใช้จาก API
      try {
        const response = await getCurrentUser() as UserResponse; // Cast the response to UserResponse type
        
        if (response.success && response.user) {
          // อัพเดทข้อมูลผู้ใช้
          localStorage.setItem('userInfo', JSON.stringify(response.user));
          setUser(response.user);
          setIsLoggedIn(true);
          setLoading(false);
          return true;
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setUser(null);
        setIsLoggedIn(false);
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

  // ตรวจสอบสถานะการเข้าสู่ระบบเมื่อเริ่มต้น
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
    };
    
    initAuth();
  }, [checkAuth]);

  // ฟังก์ชันเข้าสู่ระบบ
  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    setUser(userData);
    setIsLoggedIn(true);
  }, []);

  // ฟังก์ชันออกจากระบบ
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('tempToken'); // ล้าง tempToken ด้วย
    setUser(null);
    setIsLoggedIn(false);
    router.push('/auth/login');
  }, [router]);

  // ฟังก์ชันสำหรับการจัดการกับ 2FA ที่ใช้ dynamic path
  const handleLoginResponse = useCallback((data: any) => {
    if (data.requireTwoFactor) {
      // ถ้าต้องการ 2FA ให้เก็บ tempToken และ expiresAt (ถ้ามี)
      sessionStorage.setItem('tempToken', data.tempToken);
      
      // ถ้ามี expiresAt ให้จัดเก็บไว้ด้วย
      if (data.expiresAt) {
        sessionStorage.setItem('expiresAt', data.expiresAt.toString());
        console.log("Saved expiresAt to sessionStorage:", data.expiresAt);
      } else {
        // กรณีที่ API ไม่ส่ง expiresAt มา ให้คำนวณเองโดยปกติคือ 10 นาที
        const calculatedExpiresAt = Date.now() + (10 * 60 * 1000);
        sessionStorage.setItem('expiresAt', calculatedExpiresAt.toString());
        console.log("Calculated and saved expiresAt:", calculatedExpiresAt);
      }
      
      // นำทางไปยังหน้ายืนยัน OTP พร้อม token ใน URL เพื่อให้สามารถใช้ลิงก์ในอีเมลได้
      router.push(`/auth/verify-otp/${data.tempToken}`);
    } else {
      // ถ้าไม่ต้องการ 2FA ให้เข้าสู่ระบบตามปกติ
      login(data.token, data.user);
      router.push('/jobs');
    }
  }, [login, router]);

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    checkAuth,
    handleLoginResponse
  };

  return (
    <AuthContext.Provider value={value}>
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