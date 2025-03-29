// app/auth/reset-password/[token]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import authService from "@/lib/authService";
import { ApiError } from "@/lib/apiService";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import ResetPasswordForm from "@/components/auth/forms/ResetPasswordForm";
import AlertBox, { ErrorMessage } from "@/components/auth/AlertBox";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = useParams();
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);

  useEffect(() => {
    // Verify token when page loads
    if (token) {
      const verifyToken = async () => {
        try {
          setIsVerifyingToken(true);
          const response = await authService.verifyResetToken(token as string);
          
          if (response.success) {
            setTokenValid(true);
          } else {
            setTokenValid(false);
            setError("ลิงก์รีเซ็ตรหัสผ่านหมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่");
          }
        } catch (err) {
          console.error("Token verification error:", err);
          
          if (err instanceof ApiError) {
            setError(err.message || "ลิงก์รีเซ็ตรหัสผ่านหมดอายุหรือไม่ถูกต้อง");
          } else {
            setError("เกิดข้อผิดพลาดในการตรวจสอบลิงก์ กรุณาลองใหม่อีกครั้ง");
          }
          
          setTokenValid(false);
        } finally {
          setIsVerifyingToken(false);
        }
      };

      verifyToken();
    } else {
      setIsVerifyingToken(false);
      setTokenValid(false);
      setError("ไม่พบโทเค็นสำหรับรีเซ็ตรหัสผ่าน");
    }
  }, [token]);

  const handleSubmit = async (password: string) => {
    setError("");
    setIsLoading(true);

    try {
      if (!token) {
        throw new Error("ไม่พบโทเค็นสำหรับรีเซ็ตรหัสผ่าน");
      }
      
      const response = await authService.resetPassword(token as string, password);
      
      if (response.success) {
        setIsSuccess(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/auth/login/reset-success");
        }, 3000);
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      } else {
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      }
      console.error("Reset password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (isVerifyingToken) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!tokenValid) {
      return (
        <ErrorMessage
          title="ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว"
          message={error}
          details="กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่"
        />
      );
    }

    return (
      <ResetPasswordForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        isSuccess={isSuccess}
      />
    );
  };

  const renderFooter = () => {
    if (!isVerifyingToken && tokenValid && !isSuccess) {
      return (
        <p className="text-gray-600">
          จำรหัสผ่านได้แล้ว?{" "}
          <Link 
            href="/auth/login" 
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
          >
            เข้าสู่ระบบ
          </Link>
        </p>
      );
    }
    
    if (!tokenValid) {
      return (
        <p className="text-gray-600">
          <Link 
            href="/auth/forgot-password" 
            className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
          >
            ขอลิงก์รีเซ็ตรหัสผ่านใหม่
          </Link>
        </p>
      );
    }
    
    return null;
  };

  return (
    <AuthLayout showLogo={true} title="ตั้งรหัสผ่านใหม่">
      <AuthCard
        title="ตั้งรหัสผ่านใหม่"
        description="กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ"
        footer={renderFooter()}
      >
        {renderContent()}
      </AuthCard>
    </AuthLayout>
  );
}