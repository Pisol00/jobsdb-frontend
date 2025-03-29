// components/auth/forms/LoginForm.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Mail, Lock, Loader2, Eye, EyeOff, ShieldAlert, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import AlertBox from "../AlertBox";
import PasswordInput from "../PasswordInput";
import GoogleLoginButton from "../GoogleLoginButton";
import AccountLockoutStatus from "../AccountLockoutStatus";
import CountdownTimer from "../CountdownTimer";

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
  error?: string;
  showSuccess?: boolean;
  successMessage?: string;
  oauthError?: string;
  apiBaseUrl: string;
  isLocked?: boolean;
  remainingLockTime?: number | null;
}

export interface LoginFormData {
  usernameOrEmail: string;
  password: string;
  deviceId: string;
  rememberMe: boolean;
}

export default function LoginForm({
  onSubmit,
  isLoading,
  error,
  showSuccess,
  successMessage,
  oauthError,
  apiBaseUrl,
  isLocked = false,
  remainingLockTime = null,
}: LoginFormProps) {
  // เพิ่ม searchParams เพื่อดึงค่า error และ email จาก URL
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error");
  const emailFromURL = searchParams.get("email");

  const [formData, setFormData] = useState<LoginFormData>({
    usernameOrEmail: "",
    password: "",
    deviceId: "",
    rememberMe: false,
  });

  useEffect(() => {
    // Get or create deviceId for 2FA
    let storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      storedDeviceId = crypto.randomUUID(); // Use built-in UUID instead of depending on uuid package
      localStorage.setItem("deviceId", storedDeviceId);
    }
    
    // ดึง username ที่บันทึกไว้ (ถ้ามี)
    const savedUsername = localStorage.getItem("savedUsername");
    
    // ตรวจสอบว่ามี email จาก URL หรือไม่ (กรณีมี error email_exists)
    const initialUsername = emailFromURL || savedUsername || "";
    
    setFormData(prev => ({ 
      ...prev, 
      deviceId: storedDeviceId,
      usernameOrEmail: initialUsername
    }));
  }, [emailFromURL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;
    
    // บันทึก username สำหรับการเข้าสู่ระบบครั้งต่อไป
    if (formData.rememberMe) {
      localStorage.setItem("savedUsername", formData.usernameOrEmail);
    }
    
    await onSubmit(formData);
  };

  // เพิ่มฟังก์ชันสำหรับการแสดงข้อความแจ้งเตือนกรณีมีอีเมลซ้ำ
  const renderEmailExistsWarning = () => {
    if (errorType === "email_exists" && emailFromURL) {
      return (
        <AlertBox 
          type="warning" 
          icon={<AlertCircle className="h-5 w-5 text-amber-500" />}
          message={`อีเมล ${emailFromURL} มีบัญชีในระบบแล้ว กรุณาเข้าสู่ระบบด้วยรหัสผ่าน`} 
        />
      );
    }
    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label
          htmlFor="usernameOrEmail"
          className="text-gray-700 font-medium"
        >
          ชื่อผู้ใช้ หรือ อีเมล
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="usernameOrEmail"
            name="usernameOrEmail"
            type="text"
            placeholder="ชื่อผู้ใช้ หรือ อีเมล"
            value={formData.usernameOrEmail}
            onChange={handleChange}
            className="pl-10 bg-white/70 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
            required
            disabled={isLocked || isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-gray-700 font-medium"
          >
            รหัสผ่าน
          </Label>
          <Link
            href="/auth/forgot-password"
            className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            ลืมรหัสผ่าน?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          label=""
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          required
          disabled={isLocked || isLoading}
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="rememberMe"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          disabled={isLocked || isLoading}
        />
        <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
          จดจำฉันไว้ในระบบ
        </label>
      </div>

      {/* แสดงข้อความแจ้งเตือน email_exists ก่อน */}
      {renderEmailExistsWarning()}

      {/* Success message */}
      {showSuccess && successMessage && (
        <AlertBox 
          type="success" 
          message={successMessage} 
        />
      )}

      {/* OAuth error - แก้ไขเพื่อไม่แสดงซ้ำซ้อนกับ email_exists */}
      {oauthError && errorType !== "email_exists" && (
        <AlertBox 
          type="error" 
          message="เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google กรุณาลองใหม่อีกครั้ง" 
        />
      )}

      {/* แก้ไขส่วนแสดงข้อความ error เพื่อป้องกันการซ้ำซ้อน */}
      {isLocked ? (
        <AccountLockoutStatus 
          isLocked={isLocked} 
          remainingLockTime={remainingLockTime} 
          onExpire={() => setIsLocked && setIsLocked(false)}
        />
      ) : (
        error && <AlertBox type="error" message={error} />
      )}

      <Button
        type="submit"
        className="w-full py-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        disabled={isLoading || isLocked}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            กำลังเข้าสู่ระบบ...
          </span>
        ) : isLocked ? (
          "บัญชีถูกล็อคชั่วคราว"
        ) : (
          "เข้าสู่ระบบ"
        )}
      </Button>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 py-1 text-gray-500 rounded-full border border-gray-200">
              หรือเข้าสู่ระบบด้วย
            </span>
          </div>
        </div>

        <div className="mt-6">
          <GoogleLoginButton href={`${apiBaseUrl}/auth/google`} />
        </div>
      </div>
    </form>
  );
}