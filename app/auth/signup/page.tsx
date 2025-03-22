// app/auth/signup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import SignupForm, { SignupFormData } from "@/components/auth/forms/SignupForm";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: SignupFormData) => {
    setError("");
    setIsLoading(true);

    try {
      const { username, email, password } = formData;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        if (data.token) {
          // If API returns a token, login immediately
          login(data.token, {
            id: data.user.id,
            username: data.user.username,
            fullName: data.user.fullName || "",
            email: data.user.email,
            profileImage: data.user.profileImage,
          });
          router.push("/jobs");
        } else {
          // Otherwise, redirect to login page
          router.push("/auth/login?registered=true");
        }
      } else {
        setError(data.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="สมัครสมาชิก"
        description="สร้างบัญชีเพื่อเริ่มต้นค้นหางานที่ใช่สำหรับคุณ"
        footer={
          <p className="text-gray-600">
            มีบัญชีอยู่แล้ว?{" "}
            <Link 
              href="/auth/login" 
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        }
      >
        <SignupForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          apiBaseUrl={process.env.NEXT_PUBLIC_API_URL || ""}
        />
      </AuthCard>
    </AuthLayout>
  );
}