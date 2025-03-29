"use client";

import { useState, useEffect } from "react";
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
  const [countdown, setCountdown] = useState(600); // 10 minutes (600 seconds)
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
          setCountdown(10);
          setIsTokenChecking(false);
          return;
        }
        
        // If token is valid, use token from URL
        console.log("Using token from URL");
        setTempToken(tokenFromUrl);
        sessionStorage.setItem('tempToken', tokenFromUrl);
        
        // Handle expiresAt
        if (urlExpiresAt) {
          // If expiresAt is in URL, use that value
          const expiresAt = parseInt(urlExpiresAt);
          sessionStorage.setItem('expiresAt', urlExpiresAt);
          
          const now = Date.now();
          const diff = Math.floor((expiresAt - now) / 1000);
          
          if (diff > 0) {
            console.log("Setting countdown from URL expiresAt:", diff);
            setCountdown(diff);
          } else {
            // If already expired
            console.log("URL OTP has expired");
            setCountdown(0);
          }
        } else if (storedExpiresAt) {
          // If no expiresAt in URL but exists in sessionStorage
          const expiresAt = parseInt(storedExpiresAt);
          const now = Date.now();
          const diff = Math.floor((expiresAt - now) / 1000);
          
          if (diff > 0) {
            console.log("Setting countdown from sessionStorage:", diff);
            setCountdown(diff);
          } else {
            // If expired, create new time
            const newExpiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
            sessionStorage.setItem('expiresAt', newExpiresAt.toString());
            console.log("Creating new expiresAt:", newExpiresAt);
            setCountdown(600);
          }
        } else {
          // If no expiresAt in URL or sessionStorage
          const newExpiresAt = Date.now() + (10 * 60 * 1000); // 10 minutes
          sessionStorage.setItem('expiresAt', newExpiresAt.toString());
          console.log("No expiresAt found, creating new one:", newExpiresAt);
          setCountdown(600);
        }
        
        setTokenError(false);
      } else {
        // If token from URL is invalid
        if (storedToken && storedToken !== 'undefined' && storedToken !== 'null' && storedToken.length > 10) {
          // Check if stored token is still valid
          const isStoredTokenValid = await verifyTempToken(storedToken);
          
          if (!isStoredTokenValid) {
            console.log("Stored token is invalid or has been replaced");
            setTokenError(true);
            setCountdown(10);
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
          
          setTokenError(false);
        } else {
          // If no valid token in URL or sessionStorage
          console.log("No valid token found");
          setTokenError(true);
          setCountdown(10);
        }
      }
      
      setIsTokenChecking(false);
    };

    checkToken();
    
    // Ensure deviceId exists
    getOrCreateDeviceId();
  }, [params, router]);
  
  // Effect for redirecting back to login when countdown expires
  useEffect(() => {
    if (countdown === 0 && tokenError) {
      // If countdown expires and there's a token error, go back to login
      router.push('/auth/login');
    }
  }, [countdown, tokenError, router]);
  
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
  
  // Function for going back to login
  const handleBackToLogin = () => {
    sessionStorage.removeItem('tempToken');
    sessionStorage.removeItem('expiresAt');
    router.push('/auth/login');
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
            details={`กำลังนำคุณกลับไปหน้าเข้าสู่ระบบใน ${countdown} วินาที`}
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
          countdownSeconds={countdown}
          onCountdownExpire={() => {
            // Redirect to login after countdown expires
            setTimeout(() => {
              handleBackToLogin();
            }, 2000);
          }}
        />
      </AuthCard>
    </AuthLayout>
  );
}