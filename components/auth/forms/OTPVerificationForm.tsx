// components/auth/forms/OTPVerificationForm.tsx
import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import AlertBox from "../AlertBox";
import OTPInput from "../OTPInput";
import CountdownTimer from "../CountdownTimer";

interface OTPVerificationFormProps {
  onSubmit: (data: { otp: string; rememberDevice: boolean }) => Promise<void>;
  isLoading: boolean;
  error?: string;
  countdownSeconds?: number;
  expiryTimestamp?: number; // เพิ่มตัวเลือกนี้
  onCountdownExpire?: () => void;
}

export default function OTPVerificationForm({
  onSubmit,
  isLoading,
  error,
  countdownSeconds,
  expiryTimestamp, // รับค่า expiryTimestamp
  onCountdownExpire,
}: OTPVerificationFormProps) {
  const [otp, setOTP] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      return; // Don't submit if OTP is empty
    }
    
    await onSubmit({ otp, rememberDevice });
  };

  // ตรวจสอบว่าเวลาหมดแล้วหรือไม่ - ใช้ expiryTimestamp ถ้ามี
  const isExpired = expiryTimestamp 
    ? Date.now() > expiryTimestamp 
    : countdownSeconds !== undefined && countdownSeconds <= 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-5 text-center">
        <div className="text-sm text-gray-500 mb-1">รหัสจะหมดอายุใน</div>
        <div className="text-xl font-mono font-bold">
          {expiryTimestamp ? (
            // ใช้ expiryTimestamp แทน countdownSeconds
            <CountdownTimer 
              expiryTimestamp={expiryTimestamp}
              onExpire={onCountdownExpire}
              warningThreshold={60}
            />
          ) : (
            // ใช้ initialSeconds เป็น fallback
            <CountdownTimer 
              initialSeconds={countdownSeconds} 
              onExpire={onCountdownExpire}
              warningThreshold={60}
            />
          )}
        </div>
      </div>
      
      <OTPInput
        id="otp"
        value={otp}
        onChange={setOTP}
        helperText="กรุณาตรวจสอบกล่องข้อความในอีเมลของคุณ"
        disabled={isExpired || isLoading}
      />
      
      {/* Remember device checkbox */}
      <div className="flex items-center space-x-2 mt-3">
        <Checkbox 
          id="rememberDevice" 
          checked={rememberDevice}
          onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
          disabled={isExpired || isLoading}
        />
        <Label 
          htmlFor="rememberDevice" 
          className="text-sm text-gray-600 cursor-pointer"
        >
          จดจำอุปกรณ์นี้เป็นเวลา 24 ชั่วโมง
        </Label>
      </div>
      
      {error && <AlertBox type="error" message={error} />}
      
      <Button 
        type="submit" 
        className="w-full py-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        disabled={isLoading || isExpired || !otp}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            กำลังตรวจสอบ...
          </span>
        ) : isExpired ? (
          "รหัส OTP หมดอายุแล้ว"
        ) : (
          "ยืนยันรหัส OTP"
        )}
      </Button>
      
      {/* Footer help text */}
      <div className="text-center text-gray-600 text-sm">
        ไม่ได้รับรหัส?{" "}
        <Link 
          href="/auth/login" 
          className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
        >
          กลับไปเข้าสู่ระบบอีกครั้ง
        </Link>
      </div>
    </form>
  );
}