// components/auth/ExpiredOTPAlert.tsx
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ExpiredOTPAlertProps {
  onClose?: () => void;
  autoRedirectDelay?: number; // ระยะเวลาก่อนเปลี่ยนหน้าอัตโนมัติ (ms)
}

export default function ExpiredOTPAlert({
  onClose,
  autoRedirectDelay = 5000, // 5 วินาที
}: ExpiredOTPAlertProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(Math.floor(autoRedirectDelay / 1000));
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  // แยก handleGoToLogin ออกมาเพื่อใช้ซ้ำและป้องกันการ redirect หลายครั้ง
  const handleGoToLogin = useCallback(() => {
    if (isRedirecting) return; // ป้องกันการเรียกหลายครั้ง
    
    setIsRedirecting(true);
    
    // ล้าง session storage
    sessionStorage.removeItem('tempToken');
    sessionStorage.removeItem('expiresAt');
    sessionStorage.removeItem('rememberMe');
    
    if (onClose) onClose();
    
    // ใช้ setTimeout เพื่อให้การ animation การปิด alert ทำงานเสร็จก่อน
    setTimeout(() => {
      router.push('/auth/login');
    }, 100);
  }, [router, onClose, isRedirecting]);
  
  useEffect(() => {
    // ตั้งเวลานับถอยหลังเพื่อไปหน้า login อัตโนมัติ
    const redirectTimeout = setTimeout(() => {
      handleGoToLogin();
    }, autoRedirectDelay);
    
    // นับถอยหลังวินาที
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        const newCount = Math.max(0, prev - 1);
        if (newCount === 0) {
          clearInterval(countdownInterval); // หยุดการนับถอยหลังเมื่อเป็น 0
        }
        return newCount;
      });
    }, 1000);
    
    // Clear timeouts/intervals เมื่อ component unmount
    return () => {
      clearTimeout(redirectTimeout);
      clearInterval(countdownInterval);
    };
  }, [autoRedirectDelay, handleGoToLogin]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-11/12 max-w-md mx-auto overflow-hidden"
      >
        <div className="flex items-center justify-between bg-red-50 px-4 py-3 border-b border-red-100">
          <div className="flex items-center">
            <AlertTriangle className="text-red-500 h-6 w-6 mr-2" />
            <h3 className="text-lg font-semibold text-red-800">รหัส OTP หมดอายุแล้ว</h3>
          </div>
          <button 
            onClick={handleGoToLogin}
            className="text-gray-500 hover:text-gray-700"
            disabled={isRedirecting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-5">
          <p className="text-gray-700 mb-4">
            รหัส OTP ของคุณหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้งเพื่อขอรหัสใหม่
          </p>
          
          <p className="text-sm text-gray-500 mb-4">
            คุณจะถูกนำไปยังหน้าเข้าสู่ระบบใน <span className="font-bold text-red-500">{countdown}</span> วินาที
          </p>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleGoToLogin} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isRedirecting}
            >
              {isRedirecting ? "กำลังนำไปยังหน้าเข้าสู่ระบบ..." : "ไปที่หน้าเข้าสู่ระบบ"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}