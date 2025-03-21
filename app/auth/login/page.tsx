"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Check,
  AlertCircle,
  User,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// จำนวนครั้งที่อนุญาตให้ลอกอินผิด
const MAX_LOGIN_ATTEMPTS = 5;
// ระยะเวลาที่ล็อค (หน่วยเป็นวินาที)
const LOCKOUT_DURATION = 5 * 60; // 5 นาที

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleLoginResponse } = useAuth();

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });
  const [deviceId, setDeviceId] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // State สำหรับระบบป้องกัน brute force
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [remainingLockTime, setRemainingLockTime] = useState<number | null>(
    null
  );

  // ตรวจสอบข้อความแจ้งเตือน
  const registered = searchParams.get("registered");
  const oauthError = searchParams.get("error");
  const reset = searchParams.get("reset");

  useEffect(() => {
    // ดึงหรือสร้าง deviceId สำหรับระบบ 2FA
    let storedDeviceId = localStorage.getItem("deviceId");
    if (!storedDeviceId) {
      storedDeviceId = uuidv4();
      localStorage.setItem("deviceId", storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    // โหลดข้อมูลจำนวนครั้งที่ล็อกอินผิดจาก localStorage
    const storedAttempts = localStorage.getItem("loginAttempts");
    const storedLockoutEndTime = localStorage.getItem("lockoutEndTime");

    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }

    if (storedLockoutEndTime) {
      const endTime = parseInt(storedLockoutEndTime);
      setLockoutEndTime(endTime);

      // ตรวจสอบว่าการล็อคยังมีผลอยู่หรือไม่
      const now = Date.now();
      if (now < endTime) {
        setIsLocked(true);
        // คำนวณเวลาที่เหลือ
        const timeRemaining = Math.ceil((endTime - now) / 1000);
        setRemainingLockTime(timeRemaining);
      } else {
        // หากหมดเวลาล็อคแล้ว ให้รีเซ็ตข้อมูล
        resetLockout();
      }
    }

    if (registered || reset) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [registered, reset]);

  // ตัวนับถอยหลังเวลาล็อกอิน
  useEffect(() => {
    if (!isLocked || remainingLockTime === null) return;

    // อัพเดทเวลาที่เหลือทุกวินาที
    const timer = setInterval(() => {
      if (remainingLockTime <= 1) {
        resetLockout();
        clearInterval(timer);
      } else {
        setRemainingLockTime((prev) => (prev !== null ? prev - 1 : null));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, remainingLockTime]);

  // ฟังก์ชันรีเซ็ตการล็อค
  const resetLockout = () => {
    setIsLocked(false);
    setLoginAttempts(0);
    setLockoutEndTime(null);
    setRemainingLockTime(null);
    localStorage.removeItem("loginAttempts");
    localStorage.removeItem("lockoutEndTime");
  };

  // ฟังก์ชันนับจำนวนครั้งที่ล็อกอินผิดและล็อคหากเกินที่กำหนด
  const incrementLoginAttempts = () => {
    const attempts = loginAttempts + 1;
    setLoginAttempts(attempts);
    localStorage.setItem("loginAttempts", attempts.toString());

    // ล็อคเมื่อผิดเกินกำหนด
    if (attempts >= MAX_LOGIN_ATTEMPTS) {
      const endTime = Date.now() + LOCKOUT_DURATION * 1000;
      setIsLocked(true);
      setLockoutEndTime(endTime);
      setRemainingLockTime(LOCKOUT_DURATION);
      localStorage.setItem("lockoutEndTime", endTime.toString());
    }
  };

  // ฟังก์ชันแปลงเวลาเป็นรูปแบบที่อ่านง่าย
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // ตรวจสอบว่าถูกล็อคอยู่หรือไม่
    if (isLocked) {
      // ไม่ต้องกำหนดค่า error เมื่อ isLocked เป็น true
      return;
    }
  
    setError("");
    setIsLoading(true);
  
    try {
      console.log("กำลังส่งข้อมูล:", { ...formData, deviceId });
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            deviceId,
          }),
        }
      );
  
      const data = await response.json();
      console.log("ได้รับการตอบกลับ:", data);
  
      if (response.ok && data.success) {
        // รีเซ็ตการล็อค
        setIsLocked(false);
        setRemainingLockTime(null);
        setError("");
        // เรียกใช้ handleLoginResponse เพื่อจัดการการเข้าสู่ระบบ (รองรับ 2FA)
        handleLoginResponse(data);
      } else {
        // ตรวจสอบสถานะการล็อค
        if (data.lockoutRemaining) {
          // กรณีบัญชีถูกล็อค
          setIsLocked(true);
          setRemainingLockTime(data.lockoutRemaining);
          setError(""); // เคลียร์ error เมื่อตั้งค่า isLocked
        } else {
          // กรณีล็อกอินผิด แต่ยังไม่ถูกล็อค
          setIsLocked(false);
          setError(data.message || "ชื่อผู้ใช้/อีเมล หรือรหัสผ่านไม่ถูกต้อง");
        }
      }
    } catch (err: any) {
      setIsLocked(false); // ต้องแน่ใจว่า isLocked เป็น false เมื่อเกิดข้อผิดพลาดในการเชื่อมต่อ
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      console.error("Login error:", err);
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
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm gap-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center text-gray-800">
                  เข้าสู่ระบบ
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  เข้าสู่ระบบเพื่อเริ่มต้นค้นหางานที่ใช่สำหรับคุณ
                </CardDescription>

                {registered && showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center"
                  >
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    <span>ลงทะเบียนเรียบร้อยแล้ว! กรุณาเข้าสู่ระบบ</span>
                  </motion.div>
                )}

                {reset && showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center"
                  >
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    <span>
                      เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!
                      กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่
                    </span>
                  </motion.div>
                )}

                {oauthError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                    <span>
                      เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย Google
                      กรุณาลองใหม่อีกครั้ง
                    </span>
                  </div>
                )}

                {/* แสดงการล็อคบัญชี */}
                {isLocked && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 bg-orange-50 border border-orange-200 text-orange-800 text-sm rounded-lg flex items-center"
                  >
                    <ShieldAlert className="h-5 w-5 mr-2 text-orange-500 flex-shrink-0" />
                    <span>
                      บัญชีถูกล็อคชั่วคราวเนื่องจากล็อกอินผิดหลายครั้ง <br />
                      กรุณาลองใหม่ในอีก {formatTime(remainingLockTime || 0)}
                    </span>
                  </motion.div>
                )}

              
              </CardHeader>

              <CardContent className="pt-4">
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
                        disabled={isLocked}
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
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10 bg-white/70 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                        required
                        disabled={isLocked}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                          disabled={isLocked}
                        >
                          {showPassword ? (
                            <Eye className="h-5 w-5" />
                          ) : (
                            <EyeOff className="h-5 w-5" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
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
                </form>

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
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      href={`${process.env.NEXT_PUBLIC_API_URL}/auth/google`}
                      className="flex items-center justify-center w-full px-4 py-2.5 space-x-2 text-sm text-gray-700 transition-colors duration-300 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                      >
                        <path
                          fill="#FFC107"
                          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                        <path
                          fill="#FF3D00"
                          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                        />
                        <path
                          fill="#4CAF50"
                          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                        />
                        <path
                          fill="#1976D2"
                          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                        />
                      </svg>
                      <span className="font-medium">
                        เข้าสู่ระบบด้วย Google
                      </span>
                    </motion.a>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-center pb-6 pt-2">
                <p className="text-gray-600">
                  ยังไม่มีบัญชี?{" "}
                  <Link
                    href="/auth/signup"
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  >
                    สมัครสมาชิก
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
