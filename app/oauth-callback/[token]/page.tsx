"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import authService from "@/lib/authService";
import { resetFailedLoginAttempts } from "@/utils/security"; // เพิ่มการนำเข้าฟังก์ชัน

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { token } = useParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("ไม่พบ Token จากการยืนยันตัวตน");
      return;
    }
    
    // แก้ไข: ใช้ authService แทนการใช้ fetch API โดยตรง
    const fetchUserData = async () => {
      try {
        // Set token before API call
        localStorage.setItem("token", token as string);
        
        // แก้ไข: ใช้ authService.getCurrentUser() แทนการใช้ fetch โดยตรง
        const response = await authService.getCurrentUser();
        
        if (response.success && response.user) {
          // แก้ไข: รีเซ็ตการนับความพยายามล็อกอินที่ล้มเหลว
          const deviceId = window.navigator.userAgent || 'oauth-device';
          const ip = localStorage.getItem('lastIpAddress') || 'unknown';
          await resetFailedLoginAttempts(
            response.user.email,
            ip,
            deviceId
          );
          
          // Login with user data
          login(token as string, response.user);
          // Navigate to home page
          router.push("/jobs");
        } else {
          setError(response.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        }
      } catch (err) {
        console.error("OAuth callback error:", err);
        setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
        localStorage.removeItem("token");
      }
    };
    
    fetchUserData();
  }, [router, token, login]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">กำลังเข้าสู่ระบบ</h1>
          {!error ? (
            <div className="mt-6 flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin" />
              <p className="mt-4 text-gray-600">กรุณารอสักครู่...</p>
            </div>
          ) : (
            <div className="mt-6 text-red-500">
              <p>{error}</p>
              <button 
                onClick={() => router.push("/auth/login")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}