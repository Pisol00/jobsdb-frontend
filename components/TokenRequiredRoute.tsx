"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface TokenRequiredRouteProps {
  children: React.ReactNode;
  tokenParamName?: string;
}

const TokenRequiredRoute = ({ 
  children, 
  tokenParamName = "token" 
}: TokenRequiredRouteProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get(tokenParamName);

  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);
  const [redirectInProgress, setRedirectInProgress] = useState(false);

  useEffect(() => {
    // ตรวจสอบว่ามี token หรือไม่
    if (!token && !redirectInProgress) {
      setIsTokenValid(false);
    } else if (token) {
      setIsTokenValid(true);
    }
  }, [token, redirectInProgress]);

  // ถ้าไม่มี token ให้แสดงหน้า 403 Forbidden
  if (isTokenValid === false) {
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
                <CardContent className="pt-6 pb-6">
                  <div className="flex flex-col items-center text-center">
                    <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-red-700 mb-2">403 Forbidden</h2>
                    <p className="text-gray-600 mb-4">
                      ไม่อนุญาตให้เข้าถึงหน้านี้โดยตรง กรุณาใช้ลิงก์ที่ส่งไปยังอีเมลของคุณ
                    </p>
                    <div className="mt-4">
                      <Link 
                        href="/auth/forgot-password" 
                        className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
                      >
                        ขอลิงก์รีเซ็ตรหัสผ่าน
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ถ้ามี token ให้แสดงเนื้อหาปกติ
  return <>{children}</>;
};

export default TokenRequiredRoute;