"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { AlertCircle, Lock, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import TokenRequiredRoute from "@/components/TokenRequiredRoute";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(true);

  useEffect(() => {
    // เมื่อมีการเรียกหน้านี้ด้วย token ให้ตรวจสอบความถูกต้องของ token
    if (token) {
      const verifyToken = async () => {
        try {
          setIsVerifyingToken(true);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-reset-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          });
          
          const data = await response.json();
          
          if (response.ok && data.success) {
            setTokenValid(true);
          } else {
            setTokenValid(false);
            setError("ลิงก์รีเซ็ตรหัสผ่านหมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่");
          }
        } catch (err) {
          console.error("Token verification error:", err);
          setTokenValid(false);
          setError("เกิดข้อผิดพลาดในการตรวจสอบลิงก์ กรุณาลองใหม่อีกครั้ง");
        } finally {
          setIsVerifyingToken(false);
        }
      };

      verifyToken();
    }
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ตรวจสอบรหัสผ่าน
    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (formData.password.length < 6) {
      setError("รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: formData.password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsSuccess(true);
        // ทำการ redirect ไปหน้า login หลังจาก 3 วินาที
        setTimeout(() => {
          router.push("/auth/login?reset=success");
        }, 3000);
      } else {
        setError(data.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      console.error("Reset password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TokenRequiredRoute>
      <div className="relative min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] opacity-20"></div>
        
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                  </svg>
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">JobsDB</h1>
                <p className="mt-2 text-gray-600">ตั้งรหัสผ่านใหม่</p>
              </div>
              
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl font-bold text-center text-gray-800">ตั้งรหัสผ่านใหม่</CardTitle>
                  <CardDescription className="text-center text-gray-600">
                    กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-4">
                  {isVerifyingToken && (
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  )}

                  {!isVerifyingToken && !tokenValid && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex flex-col items-center text-center"
                    >
                      <AlertCircle className="h-10 w-10 mb-2 text-red-500" />
                      <h3 className="font-semibold text-red-800 mb-1">ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว</h3>
                      <p>{error}</p>
                      <Link 
                        href="/auth/forgot-password" 
                        className="mt-3 text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                      >
                        ขอลิงก์รีเซ็ตรหัสผ่านใหม่
                      </Link>
                    </motion.div>
                  )}

                  {isSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center text-center"
                    >
                      <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                      <h3 className="text-lg font-semibold text-green-800">เปลี่ยนรหัสผ่านสำเร็จ!</h3>
                      <p className="text-green-700 mt-2">
                        รหัสผ่านของคุณได้รับการเปลี่ยนเรียบร้อยแล้ว
                      </p>
                      <p className="text-sm text-green-600 mt-2">
                        กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...
                      </p>
                    </motion.div>
                  )}

                  {!isVerifyingToken && tokenValid && !isSuccess && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-gray-700 font-medium">
                          รหัสผ่านใหม่
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="อย่างน้อย 6 ตัวอักษร"
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-10 pr-10 bg-white/70 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                            required
                            minLength={6}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                              <span className="sr-only">
                                {showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                          ยืนยันรหัสผ่านใหม่
                        </Label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-400" />
                          </div>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="pl-10 pr-10 bg-white/70 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                            required
                            minLength={6}
                          />
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5" />
                              ) : (
                                <Eye className="h-5 w-5" />
                              )}
                              <span className="sr-only">
                                {showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                              </span>
                            </button>
                          </div>
                        </div>
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
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            กำลังตั้งรหัสผ่านใหม่...
                          </span>
                        ) : (
                          "บันทึกรหัสผ่านใหม่"
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
                
                {!isVerifyingToken && tokenValid && !isSuccess && (
                  <CardFooter className="flex justify-center pb-6 pt-2">
                    <p className="text-gray-600">
                      จำรหัสผ่านได้แล้ว?{" "}
                      <Link 
                        href="/auth/login" 
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                      >
                        เข้าสู่ระบบ
                      </Link>
                    </p>
                  </CardFooter>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </TokenRequiredRoute>
  );
}