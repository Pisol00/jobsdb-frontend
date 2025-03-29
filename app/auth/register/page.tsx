"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import authService, { RegisterRequest } from "@/lib/authService";
import { ApiError } from "@/lib/apiService";
import { CONFIG } from "@/config";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthCard from "@/components/auth/AuthCard";
import SignupForm, { SignupFormData } from "@/components/auth/forms/SignupForm";
import { SuccessMessage } from "@/components/auth/AlertBox";
import { CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [emailVerificationInfo, setEmailVerificationInfo] = useState<{
    email: string;
    tempToken?: string;
  } | null>(null);

  const handleSubmit = async (formData: SignupFormData) => {
    setError("");
    setIsLoading(true);

    try {
      const { username, email, password } = formData;
      
      // Create register request
      const registerRequest: RegisterRequest = {
        username,
        email,
        password
      };
      
      const response = await authService.register(registerRequest);
      
      if (response.success) {
        // Check if email verification is required
        if (response.requireEmailVerification) {
          setIsRegistered(true);
          setEmailVerificationInfo({
            email,
            tempToken: response.tempToken
          });
        } else {
          // If API returns a token, login immediately
          if (response.token && response.user) {
            login(response.token, response.user);
            router.push("/jobs");
          } else {
            // Otherwise, redirect to login page
            router.push("/auth/login?registered=true");
          }
        }
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      } else {
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      }
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToVerificationPage = () => {
    if (emailVerificationInfo?.tempToken) {
      router.push(`/auth/verify-email?token=${emailVerificationInfo.tempToken}&email=${encodeURIComponent(emailVerificationInfo.email)}`);
    } else {
      router.push(`/auth/verify-email?email=${encodeURIComponent(emailVerificationInfo?.email || '')}`);
    }
  };

  // ถ้าลงทะเบียนเสร็จแล้วรอยืนยันอีเมล
  if (isRegistered && emailVerificationInfo) {
    return (
      <AuthLayout>
        <AuthCard
          title="ลงทะเบียนสำเร็จ"
          description="กรุณายืนยันอีเมลเพื่อเปิดใช้งานบัญชีของคุณ"
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
          <div className="space-y-6">
            <SuccessMessage
              title="ลงทะเบียนสำเร็จ!"
              message="ระบบได้ส่งรหัสยืนยันไปยังอีเมลของคุณแล้ว"
              details={`กรุณาตรวจสอบอีเมล ${emailVerificationInfo.email} เพื่อยืนยันบัญชีของคุณ`}
            />
            
            <div className="rounded-lg bg-blue-50 p-4 text-blue-700 flex items-start">
              <Mail className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0 text-blue-500" />
              <div className="text-sm">
                <p>หากคุณไม่ได้รับอีเมล:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>ตรวจสอบในโฟลเดอร์จดหมายขยะ (Spam/Junk)</li>
                  <li>ตรวจสอบว่าพิมพ์อีเมลถูกต้อง</li>
                  <li>รอสักครู่และรีเฟรชกล่องจดหมาย</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-2">
              <Button
                type="button"
                className="w-full py-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                onClick={handleGoToVerificationPage}
              >
                ไปยังหน้ายืนยันอีเมล
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.push('/auth/login')}
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Button>
            </div>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  // หน้าลงทะเบียนปกติ
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
        <div className="space-y-4">
          {/* ข้อความแจ้งเตือนเกี่ยวกับการยืนยันอีเมล */}
          <div className="rounded-lg bg-blue-50 p-3 text-blue-700 flex items-start text-sm mb-4">
            <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 text-blue-500" />
            <span>
              หลังจากสมัครสมาชิกคุณจะต้องยืนยันอีเมลเพื่อเปิดใช้งานบัญชี กรุณาใช้อีเมลที่สามารถเข้าถึงได้
            </span>
          </div>
          
          <SignupForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            apiBaseUrl={CONFIG.API_URL}
          />
        </div>
      </AuthCard>
    </AuthLayout>
  );
}