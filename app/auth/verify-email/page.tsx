"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import authService from "@/lib/authService";
import { ApiError } from "@/lib/apiService";
import { useAuth } from "@/contexts/AuthContext";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import OTPInput from "@/components/auth/OTPInput";
import AlertBox, { SuccessMessage, ErrorMessage } from "@/components/auth/AlertBox";

export default function VerifyEmailPage() {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        setTokenValid(false);
        return;
      }
      
      try {
        setIsVerifying(true);
        const response = await authService.verifyEmailToken(token);
        
        if (response.success) {
          setTokenValid(true);
        } else {
          setTokenValid(false);
          setError("ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว");
        }
      } catch (err) {
        console.error("Token verification error:", err);
        setTokenValid(false);
        
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("เกิดข้อผิดพลาดในการตรวจสอบลิงก์ยืนยัน");
        }
      } finally {
        setIsVerifying(false);
      }
    };
    
    verifyToken();
  }, [token]);
  
  const handleVerify = async () => {
    if (!otp) {
      setError("กรุณากรอกรหัส OTP");
      return;
    }
    
    setError("");
    setIsSubmitting(true);
    
    try {
      const response = await authService.verifyEmail({
        otp,
        token: token || undefined
      });
      
      if (response.success) {
        setIsVerified(true);
        
        // ถ้ามี token และ user กลับมา ล็อกอินอัตโนมัติ
        if (response.token && response.user) {
          login(response.token, response.user);
          
          // รอสักครู่ก่อนจะเปลี่ยนหน้า
          setTimeout(() => {
            router.push("/jobs");
          }, 2000);
        } else {
          // ถ้าไม่มี token ให้กลับไปหน้าล็อกอิน
          setTimeout(() => {
            router.push("/auth/login");
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Email verification error:", err);
      
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาดในการยืนยันอีเมล กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleResendVerification = async () => {
    setError("");
    setIsSubmitting(true);
    
    try {
      // ดึงอีเมลจาก URL หรือใช้ state ที่เก็บไว้
      const email = searchParams.get("email");
      
      if (!email) {
        setError("ไม่พบอีเมล กรุณากลับไปหน้าล็อกอิน");
        return;
      }
      
      const response = await authService.resendEmailVerification(email);
      
      if (response.success) {
        setError("");
        alert("ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ");
      }
    } catch (err) {
      console.error("Resend verification error:", err);
      
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("ไม่สามารถส่งอีเมลยืนยันได้ กรุณาลองใหม่อีกครั้ง");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // แสดงตัวโหลดขณะตรวจสอบ token
  if (isVerifying) {
    return (
      <AuthLayout showLogo={true} title="ยืนยันอีเมล">
        <div className="flex justify-center items-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">กำลังตรวจสอบลิงก์ยืนยัน...</span>
        </div>
      </AuthLayout>
    );
  }
  
  // แสดงหน้ายืนยันสำเร็จ
  if (isVerified) {
    return (
      <AuthLayout showLogo={true} title="ยืนยันอีเมลสำเร็จ">
        <AuthCard
          title="ยืนยันอีเมลสำเร็จ"
          description="บัญชีของคุณพร้อมใช้งานแล้ว"
        >
          <SuccessMessage
            title="ยืนยันอีเมลสำเร็จ!"
            message="ขอบคุณสำหรับการยืนยันอีเมลของคุณ"
            details="กำลังนำคุณไปยังหน้าหลัก..."
          />
        </AuthCard>
      </AuthLayout>
    );
  }
  
  // แสดง UI หลัก
  return (
    <AuthLayout showLogo={true} title="ยืนยันอีเมล">
      <AuthCard
        title="ยืนยันอีเมลของคุณ"
        description="กรุณากรอกรหัสยืนยันที่เราส่งไปยังอีเมลของคุณ"
        footer={
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleResendVerification}
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
              disabled={isSubmitting}
            >
              ส่งรหัสยืนยันใหม่
            </button>
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-800">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        }
      >
        {!tokenValid ? (
          <ErrorMessage
            title="ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว"
            message={error || "ลิงก์ยืนยันไม่ถูกต้องหรือหมดอายุแล้ว"}
            details="กรุณาขอรหัสยืนยันใหม่หรือติดต่อฝ่ายสนับสนุน"
          />
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <OTPInput
                id="email-verification-otp"
                value={otp}
                onChange={setOtp}
                label="รหัสยืนยันอีเมล"
                helperText="กรุณาตรวจสอบกล่องข้อความในอีเมลของคุณ"
                disabled={isSubmitting}
              />
              
              {error && <AlertBox type="error" message={error} />}
              
              <Button
                type="button"
                className="w-full py-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                onClick={handleVerify}
                disabled={!otp || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    กำลังตรวจสอบ...
                  </span>
                ) : (
                  "ยืนยันอีเมลของฉัน"
                )}
              </Button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-600">
                <div className="flex items-start mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>รหัสยืนยันถูกส่งไปยังอีเมลที่คุณใช้ลงทะเบียน</span>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>รหัสยืนยันจะหมดอายุภายใน 10 นาที หากไม่พบอีเมล กรุณาตรวจสอบในโฟลเดอร์จดหมายขยะ</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
}