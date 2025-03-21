// app/auth/verify-otp/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function VerifyOTPDefaultPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    // ตรวจสอบว่ามี tempToken และ expiresAt ใน sessionStorage หรือไม่
    const tempToken = sessionStorage.getItem('tempToken');
    const expiresAtStr = sessionStorage.getItem('expiresAt');
    
    // เพิ่ม debug log
    console.log("Checking token in default page:", tempToken);
    console.log("ExpiresAt from sessionStorage:", expiresAtStr);
    
    // ตรวจสอบว่า token ถูกต้องหรือไม่ (มีค่าและไม่ใช่ 'undefined' หรือ 'null')
    if (tempToken && tempToken !== 'undefined' && tempToken !== 'null' && tempToken.length > 10) {
      // ตรวจสอบเวลาหมดอายุ
      if (expiresAtStr) {
        const expiresAt = parseInt(expiresAtStr);
        const now = Date.now();
        
        // ถ้าเวลายังไม่หมดอายุ
        if (expiresAt > now) {
          setHasValidToken(true);
          // ถ้ามี token ที่ดูถูกต้อง ให้ redirect ไปที่หน้าที่มี token ใน URL
          router.push(`/auth/verify-otp/${tempToken}`);
        } else {
          // ถ้าเวลาหมดอายุแล้ว
          console.log("OTP has expired, clearing session data");
          sessionStorage.removeItem('tempToken');
          sessionStorage.removeItem('expiresAt');
          setHasValidToken(false);
          setIsChecking(false);
          startCountdown();
        }
      } else {
        // ถ้ามี token แต่ไม่มีข้อมูลเวลาหมดอายุ
        // สร้างเวลาหมดอายุใหม่ในกรณีที่มี token แต่ไม่มีเวลาหมดอายุ
        const newExpiresAt = Date.now() + (10 * 60 * 1000); // 10 นาที
        sessionStorage.setItem('expiresAt', newExpiresAt.toString());
        console.log("Creating new expiresAt:", newExpiresAt);
        
        setHasValidToken(true);
        router.push(`/auth/verify-otp/${tempToken}`);
      }
    } else {
      // ถ้าไม่มี token หรือ token ไม่ถูกต้อง
      console.log("No valid token found");
      setHasValidToken(false);
      setIsChecking(false);
      startCountdown();
    }
  }, [router]);
  
  // ฟังก์ชันเริ่มนับถอยหลัง
  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/auth/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  };
  
  // ฟังก์ชันสำหรับกลับไปหน้า login ทันที
  const handleBackToLogin = () => {
    // ล้างข้อมูลทั้งหมดที่เกี่ยวข้องกับ OTP
    sessionStorage.removeItem('tempToken');
    sessionStorage.removeItem('expiresAt');
    router.push('/auth/login');
  };
  
  // ถ้าอยู่ในขั้นตอนตรวจสอบ token
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">กำลังตรวจสอบข้อมูลการยืนยันตัวตน...</p>
        </div>
      </div>
    );
  }
  
  // ถ้าไม่มี token ที่ถูกต้อง
  if (!hasValidToken) {
    return (
      <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] opacity-20"></div>
        
        <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-center text-gray-800">มีข้อผิดพลาด</CardTitle>
                  <CardDescription className="text-center text-gray-600">
                    ไม่พบข้อมูลการยืนยันตัวตนหรือข้อมูลหมดอายุแล้ว
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="text-center mb-6">
                    <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-700 mb-4">
                      ไม่พบข้อมูลการยืนยัน 2FA หรือข้อมูลหมดอายุแล้ว
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      กำลังนำคุณกลับไปหน้าเข้าสู่ระบบใน <span className="font-bold text-red-500">{countdown}</span> วินาที
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleBackToLogin}
                    className="w-full py-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    กลับไปหน้าเข้าสู่ระบบ
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }
  
  // ในกรณีที่มี token ที่ถูกต้อง แต่ยังไม่ได้ redirect
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
        <p className="text-gray-600">กำลังนำคุณไปยังหน้ายืนยัน OTP...</p>
      </div>
    </div>
  );
}