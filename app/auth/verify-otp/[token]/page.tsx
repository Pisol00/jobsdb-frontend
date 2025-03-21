// app/auth/verify-otp/[token]/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { AlertCircle, Loader2, AlertTriangle } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

export default function VerifyOTPPage() {
  const router = useRouter();
  const params = useParams();
  const { login } = useAuth();
  
  const [otp, setOTP] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [error, setError] = useState("");
  const [tokenError, setTokenError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenChecking, setIsTokenChecking] = useState(true); // เพิ่มสถานะการตรวจสอบ token
  const [countdown, setCountdown] = useState(600); // เริ่มต้นที่ 10 นาที (600 วินาที)
  const [rememberDevice, setRememberDevice] = useState(true); // เริ่มต้นเป็น true
  const [isTokenRedirecting, setIsTokenRedirecting] = useState(false);
  
  // เพิ่มฟังก์ชันตรวจสอบว่า token ยังใช้งานได้หรือไม่
  const verifyTempToken = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-temp-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      
      const data = await response.json();
      console.log("Verify temp token response:", data);
      return data.success;
    } catch (error) {
      console.error("Error verifying temp token:", error);
      return false;
    }
  };
  
  useEffect(() => {
    // ดึง token จาก URL parameters
    const tokenFromUrl = params.token as string;
    
    // ดึง expiresAt จาก URL query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const urlExpiresAt = searchParams.get('expiresAt');
    
    // ดึงข้อมูลเวลาหมดอายุและ token จาก sessionStorage
    const storedExpiresAt = sessionStorage.getItem('expiresAt');
    const storedToken = sessionStorage.getItem('tempToken');
    
    // เพิ่ม debug log
    console.log("Token from URL:", tokenFromUrl);
    console.log("ExpiresAt from URL:", urlExpiresAt);
    console.log("Token from sessionStorage:", storedToken);
    console.log("ExpiresAt from sessionStorage:", storedExpiresAt);

    // ตรวจสอบว่า token ถูกต้องและยังไม่ถูกยกเลิก
    const checkToken = async () => {
      setIsTokenChecking(true);

      if (tokenFromUrl && tokenFromUrl !== 'undefined' && tokenFromUrl !== 'null' && tokenFromUrl.length > 10) {
        // ตรวจสอบความถูกต้องของ token กับ backend
        const isValid = await verifyTempToken(tokenFromUrl);
        
        if (!isValid) {
          console.log("Token is invalid or has been replaced");
          setTokenError(true);
          setCountdown(10);
          setIsTokenChecking(false);
          return;
        }
        
        // ถ้า token ถูกต้อง ใช้ token จาก URL
        console.log("Using token from URL");
        setTempToken(tokenFromUrl);
        sessionStorage.setItem('tempToken', tokenFromUrl);
        
        // จัดการกับ expiresAt
        if (urlExpiresAt) {
          // ถ้ามี expiresAt จาก URL ให้ใช้ค่านั้น
          const expiresAt = parseInt(urlExpiresAt);
          sessionStorage.setItem('expiresAt', urlExpiresAt);
          
          const now = Date.now();
          const diff = Math.floor((expiresAt - now) / 1000);
          
          if (diff > 0) {
            console.log("Setting countdown from URL expiresAt:", diff);
            setCountdown(diff);
          } else {
            // ถ้าหมดเวลาแล้ว
            console.log("URL OTP has expired");
            setCountdown(0);
          }
        } else if (storedExpiresAt) {
          // ถ้าไม่มี expiresAt จาก URL แต่มีใน sessionStorage
          const expiresAt = parseInt(storedExpiresAt);
          const now = Date.now();
          const diff = Math.floor((expiresAt - now) / 1000);
          
          if (diff > 0) {
            console.log("Setting countdown from sessionStorage:", diff);
            setCountdown(diff);
          } else {
            // ถ้าหมดเวลาแล้ว สร้างเวลาใหม่
            const newExpiresAt = Date.now() + (10 * 60 * 1000); // 10 นาที
            sessionStorage.setItem('expiresAt', newExpiresAt.toString());
            console.log("Creating new expiresAt:", newExpiresAt);
            setCountdown(600);
          }
        } else {
          // ถ้าไม่มี expiresAt ทั้งจาก URL และ sessionStorage
          const newExpiresAt = Date.now() + (10 * 60 * 1000); // 10 นาที
          sessionStorage.setItem('expiresAt', newExpiresAt.toString());
          console.log("No expiresAt found, creating new one:", newExpiresAt);
          setCountdown(600);
        }
        
        setTokenError(false);
      } else {
        // กรณี token จาก URL ไม่ถูกต้อง
        if (storedToken && storedToken !== 'undefined' && storedToken !== 'null' && storedToken.length > 10) {
          // ตรวจสอบว่า stored token ยังใช้งานได้หรือไม่
          const isStoredTokenValid = await verifyTempToken(storedToken);
          
          if (!isStoredTokenValid) {
            console.log("Stored token is invalid or has been replaced");
            setTokenError(true);
            setCountdown(10);
            setIsTokenChecking(false);
            return;
          }
          
          // ถ้ามี token ที่ถูกต้องใน sessionStorage
          console.log("Using token from sessionStorage");
          setTempToken(storedToken);
          
          // ถ้า URL ไม่ตรงกับ token ที่ถูกต้อง ให้ redirect ไปยัง URL ที่ถูกต้อง
          if (tokenFromUrl !== storedToken) {
            setIsTokenRedirecting(true);
            console.log("Redirecting to correct token URL");
            
            // สร้าง URL ใหม่พร้อม expiresAt ถ้ามี
            let redirectUrl = `/auth/verify-otp/${storedToken}`;
            if (storedExpiresAt) {
              redirectUrl += `?expiresAt=${storedExpiresAt}`;
            }
            
            router.replace(redirectUrl);
            return;
          }
          
          setTokenError(false);
        } else {
          // ถ้าไม่มี token ที่ถูกต้องทั้งใน URL และ sessionStorage
          console.log("No valid token found");
          setTokenError(true);
          setCountdown(10);
        }
      }
      
      setIsTokenChecking(false);
    };

    checkToken();
    
    // ตรวจสอบว่ามี deviceId ใน localStorage หรือไม่
    const deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      // ถ้าไม่มีให้สร้างใหม่และบันทึกลง localStorage
      const newDeviceId = uuidv4();
      localStorage.setItem('deviceId', newDeviceId);
    }
    
    // เริ่มการนับถอยหลังเวลาหมดอายุของ OTP
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
  }, [params, router]);
  
  // เพิ่ม effect สำหรับการ redirect กลับไปหน้า login เมื่อ countdown หมด
  useEffect(() => {
    if (countdown === 0 && tokenError) {
      // ถ้า countdown หมดและมีปัญหากับ token ให้กลับไปหน้า login
      router.push('/auth/login');
    }
  }, [countdown, tokenError, router]);
  
  // แปลงวินาทีเป็นรูปแบบ MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tokenError) {
      setError("มีปัญหากับรหัสยืนยัน กรุณากลับไปเข้าสู่ระบบอีกครั้ง");
      return;
    }
    
    if (!otp) {
      setError("กรุณากรอกรหัส OTP");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      // ดึง deviceId จาก localStorage
      const deviceId = localStorage.getItem('deviceId');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          otp, 
          tempToken,
          rememberDevice,
          deviceId // ส่ง deviceId ไปยัง API
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        // ล้างข้อมูลใน session storage
        sessionStorage.removeItem('tempToken');
        sessionStorage.removeItem('expiresAt');
        
        // เข้าสู่ระบบด้วย token จริง
        login(data.token, {
          id: data.user.id,
          username: data.user.username,
          fullName: data.user.fullName || "",
          email: data.user.email,
          profileImage: data.user.profileImage,
          twoFactorEnabled: data.user.twoFactorEnabled,
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
  
  // เพิ่มฟังก์ชันสำหรับกลับไปหน้า login
  const handleBackToLogin = () => {
    sessionStorage.removeItem('tempToken');
    sessionStorage.removeItem('expiresAt');
    router.push('/auth/login');
  };
  
  // กรณีกำลังตรวจสอบ token
  if (isTokenChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">กำลังตรวจสอบข้อมูลยืนยันตัวตน...</p>
        </div>
      </div>
    );
  }
  
  // กรณีกำลัง redirect ไปยัง URL ที่ถูกต้อง
  if (isTokenRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
          <p className="text-gray-600">กำลังนำคุณไปยังหน้ายืนยัน OTP...</p>
        </div>
      </div>
    );
  }
  
  // UI สำหรับกรณีที่มีปัญหากับ token
  if (tokenError) {
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
                    ไม่พบข้อมูลการยืนยันตัวตนที่ถูกต้อง
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <div className="text-center mb-6">
                    <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                    <p className="text-gray-700 mb-4">
                      ลิงก์ยืนยันตัวตนไม่ถูกต้อง ถูกยกเลิก หรือหมดอายุแล้ว
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
  
  // UI หลักสำหรับกรอก OTP
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
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 text-center">
                      กรุณาตรวจสอบกล่องข้อความในอีเมลของคุณ
                    </p>
                  </div>
                  
                  {/* เพิ่ม checkbox สำหรับจดจำอุปกรณ์ */}
                  <div className="flex items-center space-x-2 mt-3">
                    <Checkbox 
                      id="rememberDevice" 
                      checked={rememberDevice}
                      onCheckedChange={(checked) => setRememberDevice(checked as boolean)}
                    />
                    <Label 
                      htmlFor="rememberDevice" 
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      จดจำอุปกรณ์นี้เป็นเวลา 1 ชั่วโมง
                    </Label>
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