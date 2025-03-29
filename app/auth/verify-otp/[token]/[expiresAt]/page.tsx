// app/auth/verify-otp/[token]/[expiresAt]/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/lib/authService";
import { ApiError } from "@/lib/apiService";
import { getOrCreateDeviceId } from "@/components/auth/utilities/authValidation";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import OTPVerificationForm from "@/components/auth/forms/OTPVerificationForm";
import { ErrorMessage } from "@/components/auth/AlertBox";
import ExpiredOTPAlert from "@/components/auth/ExpiredOTPAlert";
import { Loader2 } from "lucide-react";

export default function VerifyOTPPage() {
  const router = useRouter();
  const params = useParams();
  const { login } = useAuth();
  
  const token = params.token as string;
  const expiresAtStr = params.expiresAt as string;
  const expiresAt = parseInt(expiresAtStr, 10);
  
  const [otp, setOTP] = useState("");
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenChecking, setIsTokenChecking] = useState(true);
  const [showExpiredAlert, setShowExpiredAlert] = useState(false);
  const [isTokenRedirecting, setIsTokenRedirecting] = useState(false);
  
  // Function to verify if token is still valid
  const verifyTempToken = async (token: string) => {
    try {
      const response = await authService.verifyTempToken(token);
      return response.success;
    } catch (error) {
      console.error("Error verifying temp token:", error);
      return false;
    }
  };
  
  useEffect(() => {
    // Check if token is valid and not revoked
    const checkToken = async () => {
      setIsTokenChecking(true);

      if (token && token !== 'undefined' && token !== 'null' && token.length > 10) {
        // Verify token with backend
        const isValid = await verifyTempToken(token);
        
        if (!isValid) {
          console.log("Token is invalid or has been replaced");
          setTokenError(true);
          setIsTokenChecking(false);
          return;
        }
        
        // If token is valid, use token from URL
        console.log("Using token from URL");
        sessionStorage.setItem('tempToken', token);
        
        // Handle expiresAt
        if (expiresAt && !isNaN(expiresAt)) {
          sessionStorage.setItem('expiresAt', expiresAt.toString());
        } else {
          // If no valid expiresAt, use default expiry
          const newExpiry = Date.now() + (10 * 60 * 1000); // 10 minutes
          sessionStorage.setItem('expiresAt', newExpiry.toString());
        }
        
        setTokenError(false);
      } else {
        // If token from URL is invalid
        setTokenError(true);
      }
      
      setIsTokenChecking(false);
    };

    checkToken();
    
    // Ensure deviceId exists
    getOrCreateDeviceId();
  }, [token, expiresAt]);
  
  // Function for going back to login when countdown expires
  const handleCountdownExpire = useCallback(() => {
    // แสดงกล่องข้อความเมื่อเวลาหมด แทนการใช้ alert
    setShowExpiredAlert(true);
  }, []);
  
  // Function for going back to login
  const handleBackToLogin = useCallback(() => {
    sessionStorage.removeItem('tempToken');
    sessionStorage.removeItem('expiresAt');
    router.push('/auth/login');
  }, [router]);

  const handleSubmit = async (data: { otp: string; rememberDevice: boolean }) => {
    if (tokenError) {
      setError("มีปัญหากับรหัสยืนยัน กรุณากลับไปเข้าสู่ระบบอีกครั้ง");
      return;
    }
    
    if (!data.otp) {
      setError("กรุณากรอกรหัส OTP");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      // Get deviceId from localStorage
      const deviceId = getOrCreateDeviceId();
      
      const response = await authService.verifyOTP({
        otp: data.otp,
        tempToken: token,
        rememberDevice: data.rememberDevice,
        deviceId
      });
      
      if (response.success && response.token && response.user) {
        // Clear session storage data
        sessionStorage.removeItem('tempToken');
        sessionStorage.removeItem('expiresAt');
        
        // Login with real token
        login(response.token, response.user);
        
        // Navigate to jobs page
        router.push("/jobs");
      } else {
        setError(response.message || "รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      } else {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
      }
      console.error("OTP verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // If checking token
  if (isTokenChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">กำลังตรวจสอบข้อมูลยืนยันตัวตน...</p>
        </div>
      </div>
    );
  }
  
  // If redirecting to correct URL
  if (isTokenRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">กำลังนำคุณไปยังหน้ายืนยัน OTP...</p>
        </div>
      </div>
    );
  }
  
  // If token has an error
  if (tokenError) {
    return (
      <AuthLayout showLogo={true} title="มีข้อผิดพลาด">
        <AuthCard
          title="มีข้อผิดพลาด"
          description="ไม่พบข้อมูลการยืนยันตัวตนที่ถูกต้อง"
          footer={
            <button
              onClick={handleBackToLogin}
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
            >
              กลับไปเข้าสู่ระบบ
            </button>
          }
        >
          <ErrorMessage
            title="ลิงก์ยืนยันตัวตนไม่ถูกต้อง"
            message="ลิงก์ยืนยันตัวตนไม่ถูกต้อง ถูกยกเลิก หรือหมดอายุแล้ว"
            details={`กำลังนำคุณกลับไปหน้าเข้าสู่ระบบอัตโนมัติ`}
          />
        </AuthCard>
      </AuthLayout>
    );
  }
  
  // Main OTP verification UI
  return (
    <AuthLayout 
      showLogo={true} 
      title="การยืนยันตัวตนแบบสองขั้นตอน"
      logoIcon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      }
    >
      {/* กล่องข้อความแจ้งเตือน OTP หมดอายุ */}
      {showExpiredAlert && (
        <ExpiredOTPAlert 
          onClose={() => setShowExpiredAlert(false)}
          autoRedirectDelay={5000}
        />
      )}

      <AuthCard
        title="ยืนยันรหัส OTP"
        description="กรอกรหัส OTP ที่ส่งไปยังอีเมลของคุณ"
      >
        <OTPVerificationForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          expiryTimestamp={expiresAt}
          onCountdownExpire={handleCountdownExpire}
        />
      </AuthCard>
    </AuthLayout>
  );
}