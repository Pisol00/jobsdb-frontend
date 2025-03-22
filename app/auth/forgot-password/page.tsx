// app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setIsSuccess(true);
      } else {
        setError(data.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
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