"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle, Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import authService from "@/lib/authService";
import { ApiError } from "@/lib/apiService";

/**
 * Component for managing two-factor authentication settings
 */
export default function TwoFactorSettings() {
  const { user } = useAuth();
  const [isEnabled, setIsEnabled] = useState(user?.twoFactorEnabled || false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleToggle = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await authService.toggleTwoFactor(!isEnabled);
      
      if (response.success) {
        setIsEnabled(!isEnabled);
        setSuccess(response.message || 
          !isEnabled 
            ? "เปิดใช้งานการยืนยันตัวตนแบบสองขั้นตอนเรียบร้อยแล้ว" 
            : "ปิดใช้งานการยืนยันตัวตนแบบสองขั้นตอนเรียบร้อยแล้ว"
        );
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      }
      console.error("Toggle 2FA error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center">
          <Shield className="h-5 w-5 text-blue-600 mr-2" />
          <CardTitle>การยืนยันตัวตนแบบสองขั้นตอน (2FA)</CardTitle>
        </div>
        <CardDescription>
          เพิ่มความปลอดภัยให้กับบัญชีของคุณด้วยการยืนยันตัวตนผ่านอีเมล
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <ToggleSection 
            isEnabled={isEnabled} 
            isLoading={isLoading} 
            onToggle={handleToggle} 
          />

          {error && <ErrorMessage message={error} />}
          {success && <SuccessMessage message={success} />}
          
          <InstructionsPanel />
        </div>
      </CardContent>
    </Card>
  );
}

// Subcomponents
interface ToggleSectionProps {
  isEnabled: boolean;
  isLoading: boolean;
  onToggle: () => void;
}

const ToggleSection = ({ isEnabled, isLoading, onToggle }: ToggleSectionProps) => (
  <div className="flex items-center justify-between border-b pb-4">
    <div>
      <h4 className="font-medium text-gray-800">เปิดใช้งานการยืนยันตัวตนแบบสองขั้นตอน</h4>
      <p className="text-sm text-gray-500 mt-1">
        เมื่อเปิดใช้งาน คุณจะต้องกรอกรหัส OTP ที่ส่งไปยังอีเมลของคุณทุกครั้งที่เข้าสู่ระบบ
      </p>
    </div>
    <div className="flex items-center">
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      ) : (
        <Switch
          checked={isEnabled}
          onCheckedChange={onToggle}
          className="data-[state=checked]:bg-blue-600"
        />
      )}
    </div>
  </div>
);

interface MessageProps {
  message: string;
}

const ErrorMessage = ({ message }: MessageProps) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center"
  >
    <AlertCircle className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
    <span>{message}</span>
  </motion.div>
);

const SuccessMessage = ({ message }: MessageProps) => (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center"
  >
    <CheckCircle className="h-5 w-5 mr-2 text-green-500 flex-shrink-0" />
    <span>{message}</span>
  </motion.div>
);

const InstructionsPanel = () => (
  <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-700">
    <h5 className="font-medium mb-2 flex items-center">
      <Shield className="h-4 w-4 mr-1" /> ขั้นตอนการทำงาน
    </h5>
    <ol className="list-decimal pl-5 space-y-1">
      <li>เมื่อคุณเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน ระบบจะส่งรหัส OTP ไปยังอีเมลของคุณ</li>
      <li>กรอกรหัส OTP จากอีเมลเพื่อยืนยันตัวตน</li>
      <li>เมื่อยืนยันสำเร็จ คุณจะสามารถเข้าใช้งานระบบได้ตามปกติ</li>
    </ol>
  </div>
);