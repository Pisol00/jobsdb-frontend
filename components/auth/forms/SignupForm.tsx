// components/auth/forms/SignupForm.tsx
import { useState, useEffect } from "react";
import { User, Mail, XCircle, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AlertBox from "../AlertBox";
import PasswordInput from "../PasswordInput";
import PasswordStrengthMeter from "../PasswordStrengthMeter";
import SocialLoginButton from "../SocialLoginButton";

interface SignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<void>;
  isLoading: boolean;
  error?: string;
  apiBaseUrl: string;
}

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
}

export default function SignupForm({
  onSubmit,
  isLoading,
  error,
  apiBaseUrl,
}: SignupFormProps) {
  const [formData, setFormData] = useState<SignupFormData & { confirmPassword: string }>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [usernameError, setUsernameError] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check password match
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(null);
    }
    
    // Validate username format
    if (formData.username) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(formData.username)) {
        setUsernameError("ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมาย _ เท่านั้น");
      } else {
        setUsernameError("");
      }
    } else {
      setUsernameError("");
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handlePasswordStrengthChange = (isValid: boolean) => {
    setPasswordValid(isValid);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (usernameError) {
      return;
    }
    
    if (!passwordValid) {
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }
    
    const { username, email, password } = formData;
    await onSubmit({ username, email, password });
  };

  const isFormValid = () => {
    return (
      !usernameError &&
      passwordValid &&
      formData.password === formData.confirmPassword &&
      formData.username &&
      formData.email
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-gray-700 font-medium">
          ชื่อผู้ใช้
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="ชื่อผู้ใช้"
            value={formData.username}
            onChange={handleChange}
            className={`pl-10 bg-white/70 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all ${
              usernameError ? "border-red-300" : ""
            }`}
            required
            disabled={isLoading}
          />
        </div>
        {usernameError ? (
          <p className="text-xs text-red-600 ml-1">{usernameError}</p>
        ) : (
          <p className="text-xs text-gray-500 ml-1">
            ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมาย _ เท่านั้น
          </p>
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email" className="text-gray-700 font-medium">
          อีเมล
        </Label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="your.email@example.com"
            value={formData.email}
            onChange={handleChange}
            className="pl-10 bg-white/70 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
            required
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700 font-medium">
          รหัสผ่าน
        </Label>
        <PasswordInput
          id="password"
          name="password"
          label=""
          value={formData.password}
          onChange={handleChange}
          placeholder="รหัสผ่านที่ปลอดภัย"
          required
          disabled={isLoading}
        />
        
        {/* Password strength meter */}
        {formData.password && (
          <PasswordStrengthMeter 
            password={formData.password}
            onChange={handlePasswordStrengthChange}
          />
        )}
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
          ยืนยันรหัสผ่าน
        </Label>
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label=""
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="ยืนยันรหัสผ่านอีกครั้ง"
          required
          disabled={isLoading}
        />
        
        {/* Password match indicator */}
        {passwordMatch !== null && (
          <div className="flex items-center mt-1">
            {passwordMatch ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
                <span className="text-xs text-green-700">รหัสผ่านตรงกัน</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500 mr-1.5" />
                <span className="text-xs text-red-700">รหัสผ่านไม่ตรงกัน</span>
              </>
            )}
          </div>
        )}
      </div>
      
      {error && <AlertBox type="error" message={error} />}
      
      <Button
        type="submit"
        className="w-full py-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        disabled={isLoading || !isFormValid()}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            กำลังสมัครสมาชิก...
          </span>
        ) : (
          "สมัครสมาชิก"
        )}
      </Button>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 py-1 text-gray-500 rounded-full border border-gray-200">
              หรือสมัครด้วย
            </span>
          </div>
        </div>

        <div className="mt-6">
          <SocialLoginButton
            provider="google"
            href={`${apiBaseUrl}/auth/google`}
            label="สมัครด้วย Google"
          />
        </div>
      </div>
    </form>
  );
}