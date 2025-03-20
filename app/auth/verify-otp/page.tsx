"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";

export default function VerifyOTPPage() {
  const router = useRouter();
  const { login, handleLoginResponse } = useAuth();
  
  const [otp, setOTP] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 นาที = 600 วินาที
  
  useEffect(() => {
    // ดึง tempToken จาก sessionStorage
    const token = sessionStorage.getItem('tempToken');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    setTempToken(token);
    
    // เริ่มการนับถอยหลัง
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [router]);
  
  // แปลงวินาทีเป็นรูปแบบ MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!otp) {
      setError("กรุณากรอกรหัส OTP");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp, tempToken }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // ลบ tempToken จาก sessionStorage
        sessionStorage.removeItem('tempToken');
        
        // เข้าสู่ระบบด้วย token จริง
        login(data.token, {
          id: data.user.id,
          username: data.user.username,
          fullName: data.user.fullName || "",
          email: data.user.email,
          profileImage: data.user.profileImage,
        });
        
        // นำทางไปหน้า jobs
        router.push("/jobs");
      } else {
        setError(data.message || "รหัส OTP ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
      console.error("OTP verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] opacity-20"></div>
      
      {/* Main content */}
      <div className="relative flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-block bg-blue-600 text-white p-3 rounded-2xl mb-4 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </motion.div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">JobsDB</h1>
              <p className="mt-2 text-gray-600">การยืนยันตัวตนแบบสองขั้นตอน</p>
            </div>
            
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center text-gray-800">ยืนยันรหัส OTP</CardTitle>
                <CardDescription className="text-center text-gray-600">
                  กรอกรหัส OTP ที่ส่งไปยังอีเมลของคุณ
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4">
                <div className="mb-5 text-center">
                  <div className="text-sm text-gray-500 mb-1">รหัสจะหมดอายุใน</div>
                  <div className={`text-xl font-mono font-bold ${countdown < 60 ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatTime(countdown)}
                  </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-gray-700 font-medium">
                      รหัส OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="text-center text-2xl font-mono tracking-widest bg-white/70 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                      required
                      placeholder="••••••"
                    />
                    <p className="text-xs text-gray-500 text-center">
                      กรุณาตรวจสอบกล่องข้อความในอีเมลของคุณ
                    </p>
                  </div>
                  
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center"
                    >
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full py-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    disabled={isLoading || countdown === 0}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        กำลังตรวจสอบ...
                      </span>
                    ) : countdown === 0 ? (
                      "รหัส OTP หมดอายุแล้ว"
                    ) : (
                      "ยืนยันรหัส OTP"
                    )}
                  </Button>
                </form>
              </CardContent>
              
              <CardFooter className="flex justify-center pb-6 pt-2">
                <p className="text-gray-600">
                  ไม่ได้รับรหัส?{" "}
                  <Link 
                    href="/auth/login" 
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  >
                    กลับไปเข้าสู่ระบบอีกครั้ง
                  </Link>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}