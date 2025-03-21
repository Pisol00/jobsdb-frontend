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
import { 
  Check, 
  AlertCircle, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  XCircle, 
  CheckCircle2,
  CircleAlert 
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // เพิ่มตัวแปรสำหรับติดตามความปลอดภัยของรหัสผ่าน
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });
  
  // ฟังก์ชันตรวจสอบความปลอดภัยของรหัสผ่าน
  const checkPasswordStrength = (password: string) => {
    setPasswordStrength({
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    });
  };
  
  // เช็คความแข็งแรงของรหัสผ่านทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    checkPasswordStrength(formData.password);
  }, [formData.password]);
  
  // ตรวจสอบว่ารหัสผ่านผ่านเกณฑ์ขั้นต่ำหรือไม่ (อักขระพิเศษเป็นตัวเลือกเสริม)
  const isPasswordValid = () => {
    return (
      passwordStrength.hasMinLength && 
      passwordStrength.hasUpperCase && 
      passwordStrength.hasLowerCase && 
      passwordStrength.hasNumber
      // ไม่บังคับให้มีอักขระพิเศษ
    );
  };
  
  // คำนวณคะแนนความแข็งแรงของรหัสผ่าน (0-5)
  const passwordStrengthScore = () => {
    return Object.values(passwordStrength).filter(Boolean).length;
  };
  
  // แสดงระดับความแข็งแรงของรหัสผ่าน
  const getPasswordStrengthLabel = () => {
    const score = passwordStrengthScore();
    if (score === 0) return "";
    if (score < 3) return "อ่อน";
    if (score < 5) return "ปานกลาง";
    return "แข็งแรง";
  };
  
  // กำหนดสีของแถบความแข็งแรง
  const getPasswordStrengthColor = () => {
    const score = passwordStrengthScore();
    if (score < 3) return "bg-red-500";
    if (score < 5) return "bg-yellow-500";
    return "bg-green-500";
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
    setError("");

    // ตรวจสอบรหัสผ่าน
    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    
    // ตรวจสอบความปลอดภัยของรหัสผ่าน
    if (!isPasswordValid()) {
      setError("กรุณาตั้งรหัสผ่านที่มีความปลอดภัยตามเงื่อนไขที่กำหนด");
      return;
    }

    // ตรวจสอบว่า username มีอักขระที่ถูกต้อง
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError("ชื่อผู้ใช้ต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมาย _ เท่านั้น");
      return;
    }

    setIsLoading(true);

    try {
      const { username, email, password } = formData;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        if (data.token) {
          // ถ้า API ส่ง token กลับมา ให้ล็อกอินทันที
          login(data.token, {
            id: data.user.id,
            username: data.user.username,
            fullName: data.user.fullName || "",
            email: data.user.email,
            profileImage: data.user.profileImage,
          });
          router.push("/jobs");
        } else {
          // ถ้าไม่มี token ให้ไปที่หน้า login
          router.push("/auth/login?registered=true");
        }
      } else {
        setError(data.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err: any) {
      setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
      console.error("Registration error:", err);
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
            
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-center text-gray-800">สมัครสมาชิก</CardTitle>
                <CardDescription className="text-center text-gray-600">
                  สร้างบัญชีเพื่อเริ่มต้นค้นหางานที่ใช่สำหรับคุณ
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-4">
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
                        className="pl-10 bg-white/70 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 ml-1">
                      ใช้ตัวอักษรภาษาอังกฤษ ตัวเลข และเครื่องหมาย _ เท่านั้น
                    </p>
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
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      รหัสผ่าน
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="รหัสผ่านที่ปลอดภัย"
                        value={formData.password}
                        onChange={handleChange}
                        className="pl-10 pr-10 bg-white/70 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
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
                    
                    {/* แสดงความแข็งแรงของรหัสผ่าน */}
                    {formData.password && (
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700">ความปลอดภัยของรหัสผ่าน:</span>
                          <span className={`text-xs font-medium ${
                            passwordStrengthScore() < 3 ? "text-red-600" :
                            passwordStrengthScore() < 5 ? "text-yellow-600" : "text-green-600"
                          }`}>
                            {getPasswordStrengthLabel()}
                          </span>
                        </div>
                        
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                            style={{ width: `${passwordStrengthScore() * 20}%` }}
                          ></div>
                        </div>
                        
                        {/* รายการเงื่อนไขรหัสผ่าน */}
                        <ul className="space-y-1 mt-2">
                          <li className="flex items-center text-xs">
                            {passwordStrength.hasMinLength ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400 mr-1.5" />
                            )}
                            <span className={passwordStrength.hasMinLength ? "text-green-700" : "text-gray-600"}>
                              มีความยาวอย่างน้อย 8 ตัวอักษร
                            </span>
                          </li>
                          <li className="flex items-center text-xs">
                            {passwordStrength.hasUpperCase ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400 mr-1.5" />
                            )}
                            <span className={passwordStrength.hasUpperCase ? "text-green-700" : "text-gray-600"}>
                              มีตัวอักษรพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว
                            </span>
                          </li>
                          <li className="flex items-center text-xs">
                            {passwordStrength.hasLowerCase ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400 mr-1.5" />
                            )}
                            <span className={passwordStrength.hasLowerCase ? "text-green-700" : "text-gray-600"}>
                              มีตัวอักษรพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว
                            </span>
                          </li>
                          <li className="flex items-center text-xs">
                            {passwordStrength.hasNumber ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-400 mr-1.5" />
                            )}
                            <span className={passwordStrength.hasNumber ? "text-green-700" : "text-gray-600"}>
                              มีตัวเลข (0-9) อย่างน้อย 1 ตัว
                            </span>
                          </li>
                          <li className="flex items-center text-xs">
                            {passwordStrength.hasSpecialChar ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
                            ) : (
                              <CircleAlert className="h-4 w-4 text-gray-400 mr-1.5" />
                            )}
                            <span className={passwordStrength.hasSpecialChar ? "text-green-700" : "text-gray-600"}>
                              มีอักขระพิเศษ (!@#$%^&*) อย่างน้อย 1 ตัว (แนะนำแต่ไม่บังคับ)
                            </span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                      ยืนยันรหัสผ่าน
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
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                        >
                          {showConfirmPassword ? (
                            <Eye className="h-5 w-5" />
                          ) : (
                            <EyeOff className="h-5 w-5" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                          </span>
                        </button>
                      </div>
                    </div>
                    
                    {/* แสดงสถานะการตรงกันของรหัสผ่าน */}
                    {formData.confirmPassword && (
                      <div className="flex items-center mt-1">
                        {formData.password === formData.confirmPassword ? (
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
                    disabled={isLoading || !isPasswordValid() || formData.password !== formData.confirmPassword}
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
                </form>

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
                      <span className="font-medium">สมัครด้วย Google</span>
                    </motion.a>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-center pb-6 pt-2">
                <p className="text-gray-600">
                  มีบัญชีอยู่แล้ว?{" "}
                  <Link 
                    href="/auth/login" 
                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                  >
                    เข้าสู่ระบบ
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