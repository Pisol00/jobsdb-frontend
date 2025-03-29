"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/lib/authService";
import { ApiError } from "@/lib/apiService";
import { getOrCreateDeviceId } from "@/components/auth/utilities/authValidation";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import OTPVerificationForm from "@/components/auth/forms/OTPVerificationForm";
import { ErrorMessage } from "@/components/auth/AlertBox";
import { Loader2 } from "lucide-react";

export default function VerifyOTPPage() {
  const router = useRouter();
  const params = useParams();
  const { login } = useAuth();
  
  const [otp, setOTP] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenChecking, setIsTokenChecking] = useState(true);
  const [expiryTimestamp, setExpiryTimestamp] = useState<number | null>(null);
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
    // Get token from URL parameters
    const tokenFromUrl = params.token as string;
    
    // Get expiresAt from URL query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const urlExpiresAt = searchParams.get('expiresAt');
    
    // Get expiration time and token from sessionStorage
    const storedExpiresAt = sessionStorage.getItem('expiresAt');
    const storedToken = sessionStorage.getItem('tempToken');
    
    // Check if token is valid and not revoked
    const checkToken = async () => {
      setIsTokenChecking(true);

      if (tokenFromUrl && tokenFromUrl !== 'undefined' && tokenFromUrl !== 'null' && tokenFromUrl.length > 10) {
        // Verify token with backend
        const isValid = await verifyTempToken(tokenFromUrl);
        
        if (!isValid) {
          console.log("Token is invalid or has been replaced");
          setTokenError(true);
          setExpiryTimestamp(Date.now() + 10 * 1000); // 10 seconds countdown before redirect
          setIsTokenChecking(false);
          return;
        }
        
        // If token is valid, use token from URL
        console.log("Using token from URL");
        setTempToken(tokenFromUrl);
        sessionStorage.setItem('tempToken', tokenFromUrl);
        
        // Handle expiresAt - timestamp approach
        let expiry: number;
        
        if (urlExpiresAt) {
          // If expiresAt is in URL, use that value
          expiry = parseInt(urlExpiresAt);
          sessionStorage.setItem('expiresAt', urlExpiresAt);
        } else if (storedExpiresAt) {
          // If no expiresAt in URL but exists in sessionStorage
          expiry = parseInt(storedExpiresAt);
        } else {
          // If no expiresAt in URL or sessionStorage
          expiry = Date.now() + (10 * 60 * 1000); // 10 minutes
          sessionStorage.setItem('expiresAt', expiry.toString());
        }
        
        setExpiryTimestamp(expiry);
        setTokenError(false);
      } else {
        // If token from URL is invalid
        if (storedToken && storedToken !== 'undefined' && storedToken !== 'null' && storedToken.length > 10) {
          // Check if stored token is still valid
          const isStoredTokenValid = await verifyTempToken(storedToken);
          
          if (!isStoredTokenValid) {
            console.log("Stored token is invalid or has been replaced");
            setTokenError(true);
            setExpiryTimestamp(Date.now() + 10 * 1000);
            setIsTokenChecking(false);
            return;
          }
          
          // If there's a valid token in sessionStorage
          console.log("Using token from sessionStorage");
          setTempToken(storedToken);
          
          // If URL doesn't match valid token, redirect to correct URL
          if (tokenFromUrl !== storedToken) {
            setIsTokenRedirecting(true);
            console.log("Redirecting to correct token URL");
            
            // Create new URL with expiresAt if available
            let redirectUrl = `/auth/verify-otp/${storedToken}`;
            if (storedExpiresAt) {
              redirectUrl += `?expiresAt=${storedExpiresAt}`;
            }
            
            router.replace(redirectUrl);
            return;
          }
          
          // Set expiryTimestamp
          if (storedExpiresAt) {
            setExpiryTimestamp(parseInt(storedExpiresAt));
          } else {
            const newExpiry = Date.now() + (10 * 60 * 1000);
            setExpiryTimestamp(newExpiry);
            sessionStorage.setItem('expiresAt', newExpiry.toString());
          }
          
          setTokenError(false);
        } else {
          // If no valid token in URL or sessionStorage
          console.log("No valid token found");
          setTokenError(true);
          setExpiryTimestamp(Date.now() + 10 * 1000);
        }
      }
      
      setIsTokenChecking(false);
    };

    checkToken();
    
    // Ensure deviceId exists
    getOrCreateDeviceId();
  }, [params, router]);
  
  // Function for going back to login when countdown expires
  const handleCountdownExpire = useCallback(() => {
    if (tokenError) {
      // If countdown expires and there's a token error, go back to login
      handleBackToLogin();
    }
  }, [tokenError]);
  
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
        tempToken,
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
      <AuthCard
        title="ยืนยันรหัส OTP"
        description="กรอกรหัส OTP ที่ส่งไปยังอีเมลของคุณ"
      >
        <OTPVerificationForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          expiryTimestamp={expiryTimestamp || undefined}
          onCountdownExpire={handleCountdownExpire}
        />
      </AuthCard>
    </AuthLayout>
  );
}