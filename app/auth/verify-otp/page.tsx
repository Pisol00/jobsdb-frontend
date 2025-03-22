// app/auth/verify-otp/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import { ErrorMessage } from "@/components/auth/AlertBox";
import { Button } from "@/components/ui/button";
import CountdownTimer from "@/components/auth/CountdownTimer";

export default function VerifyOTPDefaultPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [countdownFinished, setCountdownFinished] = useState(false);
  
  // Use useRef to prevent duplicate redirects
  const redirectedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to verify token validity
  const verifyTempToken = async (token: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/verify-temp-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      const data = await response.json();
      console.log("Verify temp token response:", data);
      return data.success;
    } catch (error) {
      console.error("Error verifying temp token:", error);
      return false;
    }
  };

  // Function to handle returning to login immediately
  const handleBackToLogin = () => {
    // Clear all OTP-related data
    sessionStorage.removeItem("tempToken");
    sessionStorage.removeItem("expiresAt");
    redirectedRef.current = true;
    router.push("/auth/login");
  };

  // Effect to check token
  useEffect(() => {
    // Check for tempToken and expiresAt in sessionStorage
    const tempToken = sessionStorage.getItem("tempToken");
    const expiresAtStr = sessionStorage.getItem("expiresAt");

    // Add debug log
    console.log("Checking token in default page:", tempToken);
    console.log("ExpiresAt from sessionStorage:", expiresAtStr);

    // Use async function to check token
    const checkToken = async () => {
      // Check if token is valid (has value and isn't 'undefined' or 'null')
      if (
        tempToken &&
        tempToken !== "undefined" &&
        tempToken !== "null" &&
        tempToken.length > 10
      ) {
        try {
          // Check if token is still valid
          const isTokenValid = await verifyTempToken(tempToken);

          if (!isTokenValid) {
            console.log("Token is invalid or has been replaced");
            sessionStorage.removeItem("tempToken");
            sessionStorage.removeItem("expiresAt");
            setHasValidToken(false);
            setIsChecking(false);
            return;
          }

          // Check expiration time
          if (expiresAtStr) {
            const expiresAt = parseInt(expiresAtStr);
            const now = Date.now();

            // If not expired yet
            if (expiresAt > now) {
              setHasValidToken(true);
              setIsChecking(false);
            } else {
              // If already expired
              console.log("OTP has expired, clearing session data");
              sessionStorage.removeItem("tempToken");
              sessionStorage.removeItem("expiresAt");
              setHasValidToken(false);
              setIsChecking(false);
            }
          } else {
            // If token exists but no expiration time
            // Create new expiration time if token exists but no expiration
            const newExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
            sessionStorage.setItem("expiresAt", newExpiresAt.toString());
            console.log("Creating new expiresAt:", newExpiresAt);

            setHasValidToken(true);
            setIsChecking(false);
          }
        } catch (error) {
          console.error("Error in token verification:", error);
          setHasValidToken(false);
          setIsChecking(false);
        }
      } else {
        // If no token or invalid token
        console.log("No valid token found");
        setHasValidToken(false);
        setIsChecking(false);
      }
    };

    checkToken();
    
    // Clean up timer when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Effect for redirect when token is valid
  useEffect(() => {
    if (!isChecking && hasValidToken && !redirectedRef.current) {
      const tempToken = sessionStorage.getItem("tempToken");
      const expiresAtStr = sessionStorage.getItem("expiresAt");

      if (tempToken) {
        redirectedRef.current = true;
        let redirectUrl = `/auth/verify-otp/${tempToken}`;
        if (expiresAtStr) {
          redirectUrl += `?expiresAt=${expiresAtStr}`;
        }
        router.push(redirectUrl);
      }
    }
  }, [isChecking, hasValidToken, router]);

  // Effect for redirect when countdown finishes
  useEffect(() => {
    if (countdownFinished && !hasValidToken && !redirectedRef.current) {
      redirectedRef.current = true;
      router.push("/auth/login");
    }
  }, [countdownFinished, hasValidToken, router]);

  // If checking token
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">กำลังตรวจสอบข้อมูลการยืนยันตัวตน...</p>
        </div>
      </div>
    );
  }

  // If no valid token
  if (!hasValidToken) {
    return (
      <AuthLayout>
        <AuthCard
          title="มีข้อผิดพลาด"
          description="ไม่พบข้อมูลการยืนยันตัวตนหรือข้อมูลหมดอายุแล้ว"
        >
          <div className="text-center mb-6">
            <ErrorMessage
              title="มีข้อผิดพลาด"
              message="ไม่พบข้อมูลการยืนยัน 2FA หรือข้อมูลหมดอายุแล้ว หรือลิงก์ถูกยกเลิกแล้ว"
              details={
                <span>
                  กำลังนำคุณกลับไปหน้าเข้าสู่ระบบใน{" "}
                  <CountdownTimer 
                    initialSeconds={countdown} 
                    onExpire={() => setCountdownFinished(true)}
                    className="font-bold text-red-500"
                  />
                  {" "}วินาที
                </span>
              }
            />
          
            <Button
              onClick={handleBackToLogin}
              className="w-full py-2 h-11 mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              กลับไปหน้าเข้าสู่ระบบ
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  // If valid token but not redirected yet
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
        <p className="text-gray-600">กำลังนำคุณไปยังหน้ายืนยัน OTP...</p>
      </div>
    </div>
  );
}