// components/auth/forms/ForgotPasswordForm.tsx
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AlertBox from "../AlertBox";
import { SuccessMessage } from "../AlertBox";

interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
  isSuccess?: boolean;
}

export default function ForgotPasswordForm({
  onSubmit,
  isLoading,
  error,
  isSuccess,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(email);
  };

  if (isSuccess) {
    return (
      <SuccessMessage
        title="ส่งลิงก์สำเร็จ"
        message={`เราได้ส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมล ${email} ของคุณแล้ว`}
        details="กรุณาตรวจสอบกล่องข้อความหรือโฟลเดอร์สแปมในอีเมลของคุณ"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="กรอกอีเมลที่ใช้ลงทะเบียน"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-white/70 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
            required
          />
        </div>
      </div>

      {error && <AlertBox type="error" message={error} />}

      <Button
        type="submit"
        className="w-full py-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            กำลังส่งลิงก์...
          </span>
        ) : (
          "ส่งลิงก์รีเซ็ตรหัสผ่าน"
        )}
      </Button>
    </form>
  );
}