"use client";

import { useState } from "react";
import Link from "next/link";
import authService from "@/lib/authService";
import { ApiError } from "@/lib/apiService";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import ForgotPasswordForm from "@/components/auth/forms/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (email: string) => {
    setEmail(email);
    setError("");
    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(email);

      if (response.success) {
        setIsSuccess(true);
      } else {
        setError(response.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      } else {
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      }
      console.error("Forgot password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="ลืมรหัสผ่าน"
        description="กรอกอีเมลที่ใช้ในการลงทะเบียน เพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่"
        footer={
          <p className="text-gray-600">
            จำรหัสผ่านได้แล้ว?{" "}
            <Link
              href="/auth/login"
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        }
      >
        <ForgotPasswordForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          isSuccess={isSuccess}
        />
      </AuthCard>
    </AuthLayout>
  );
}