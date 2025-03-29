"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import authService, { LoginRequest } from "@/lib/authService";
import { ApiError } from "@/lib/apiService";
import { CONFIG } from "@/config";

// Imported reusable components
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import LoginForm, { LoginFormData } from "@/components/auth/forms/LoginForm";

// Constants
const MAX_LOGIN_ATTEMPTS = CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS;
const LOCKOUT_DURATION = CONFIG.SECURITY.LOCKOUT_DURATION / 1000; // Convert to seconds

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleLoginResponse } = useAuth();

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // State for brute force protection
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [remainingLockTime, setRemainingLockTime] = useState<number | null>(null);

  // Check for notifications from query parameters that still need handling
  const oauthError = searchParams.get("error");
  const email = searchParams.get("email");

  useEffect(() => {
    // Load login attempts from localStorage
    const storedAttempts = localStorage.getItem("loginAttempts");
    const storedLockoutEndTime = localStorage.getItem("lockoutEndTime");

    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }

    if (storedLockoutEndTime) {
      const endTime = parseInt(storedLockoutEndTime);
      setLockoutEndTime(endTime);

      // Check if lockout is still active
      const now = Date.now();
      if (now < endTime) {
        setIsLocked(true);
        // Calculate remaining time
        const timeRemaining = Math.ceil((endTime - now) / 1000);
        setRemainingLockTime(timeRemaining);
      } else {
        // Reset lockout if time has expired
        resetLockout();
      }
    }

    // Check for session storage success messages
    const registerSuccess = sessionStorage.getItem("registerSuccess");
    const resetSuccess = sessionStorage.getItem("resetSuccess");
    
    if (registerSuccess || resetSuccess) {
      setShowSuccess(true);
      
      // Clear session storage
      if (registerSuccess) sessionStorage.removeItem("registerSuccess");
      if (resetSuccess) sessionStorage.removeItem("resetSuccess");
      
      // Auto-hide success message after 5 seconds
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Countdown timer for lockout
  useEffect(() => {
    if (!isLocked || remainingLockTime === null) return;

    // Update remaining time every second
    const timer = setInterval(() => {
      if (remainingLockTime <= 1) {
        resetLockout();
        clearInterval(timer);
      } else {
        setRemainingLockTime((prev) => (prev !== null ? prev - 1 : null));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, remainingLockTime]);

  // Function to reset lockout
  const resetLockout = () => {
    setIsLocked(false);
    setLoginAttempts(0);
    setLockoutEndTime(null);
    setRemainingLockTime(null);
    localStorage.removeItem("loginAttempts");
    localStorage.removeItem("lockoutEndTime");
  };

  // Function to increment login attempts and lock if exceed limit
  const incrementLoginAttempts = () => {
    const attempts = loginAttempts + 1;
    setLoginAttempts(attempts);
    localStorage.setItem("loginAttempts", attempts.toString());

    // Lock when attempts exceed the limit
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const endTime = Date.now() + LOCKOUT_DURATION * 1000;
      setIsLocked(true);
      setLockoutEndTime(endTime);
      setRemainingLockTime(LOCKOUT_DURATION);
      localStorage.setItem("lockoutEndTime", endTime.toString());
    }
  };

  const handleSubmit = async (formData: LoginFormData) => {
    // Don't proceed if account is locked
    if (isLocked) {
      return;
    }
  
    setError("");
    setIsLoading(true);
  
    try {
      // Create login request
      const loginRequest: LoginRequest = {
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
        deviceId: formData.deviceId,
        rememberMe: formData.rememberMe
      };
  
      const response = await authService.login(loginRequest);
  
      if (response.success) {
        // Reset lockout state since login is successful
        resetLockout();
        setError("");
        
        // If we have "remember me" enabled, save the username for next time
        if (formData.rememberMe) {
          localStorage.setItem("savedUsername", formData.usernameOrEmail);
        }
        
        // Handle login response (supports 2FA)
        handleLoginResponse(response);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        // Check lockout status from API response
        if (err.code === "ACCOUNT_LOCKED" && err.data?.lockoutRemaining) {
          // Account is locked by server
          setIsLocked(true);
          setRemainingLockTime(err.data.lockoutRemaining);
          setError(""); // Clear error when setting isLocked
        } else {
          // Failed login but not locked yet
          setIsLocked(false);
          
          // Display message from API which may include remaining attempts
          setError(err.message || "ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง");
        }
      } else {
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
        console.error("Login error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get success message based on session storage
  const getSuccessMessage = () => {
    if (sessionStorage.getItem("registerSuccess")) {
      return "ลงทะเบียนเรียบร้อยแล้ว! กรุณาเข้าสู่ระบบ";
    }
    if (sessionStorage.getItem("resetSuccess")) {
      return "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว! กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่";
    }
    return "";
  };

  return (
    <AuthLayout>
      <AuthCard
        title="เข้าสู่ระบบ"
        description="เข้าสู่ระบบเพื่อเริ่มต้นค้นหางานที่ใช่สำหรับคุณ"
        footer={
          <p className="text-gray-600">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
            >
              สมัครสมาชิก
            </Link>
          </p>
        }
      >
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          showSuccess={showSuccess}
          successMessage={getSuccessMessage()}
          oauthError={oauthError || undefined}
          apiBaseUrl={CONFIG.API_URL}
          isLocked={isLocked}
          remainingLockTime={remainingLockTime}
        />
      </AuthCard>
    </AuthLayout>
  );
}