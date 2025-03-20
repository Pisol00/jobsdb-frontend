"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface User {
  id: string;
  username: string;  // เพิ่ม username
  fullName: string;
  email: string;
  profileImage?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ตรวจสอบการเข้าสู่ระบบด้วย token และรับข้อมูลผู้ใช้ด้วย API
  const fetchUserData = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // อัพเดทข้อมูลผู้ใช้ใน localStorage
          localStorage.setItem('userInfo', JSON.stringify(data.user));
          setUser(data.user);
          setIsLoggedIn(true);
          return true;
        }
      }
      
      // หากไม่สำเร็จให้ออกจากระบบ
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      setUser(null);
      setIsLoggedIn(false);
      return false;
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      setUser(null);
      setIsLoggedIn(false);
      return false;
    }
  }, []);

  // ตรวจสอบสถานะการเข้าสู่ระบบ
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
          setLoading(false);
          return true;
        } catch (error) {
          console.error('Failed to parse user info:', error);
        }
      }
      
      // ถ้าไม่มีข้อมูลผู้ใช้ใน localStorage หรือข้อมูลไม่ถูกต้อง ให้ดึงข้อมูลจาก API
      const result = await fetchUserData(token);
      setLoading(false);
      return result;
    } catch (error) {
      console.error('Auth check error:', error);
      setIsLoggedIn(false);
      setUser(null);
      setLoading(false);
      return false;
    }
  }, [fetchUserData]);

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
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    checkAuth
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