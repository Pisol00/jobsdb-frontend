"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

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
    
    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        // Set token before API call
        localStorage.setItem("token", token as string);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
        }
        
        const data = await response.json();
        
        if (data.success && data.user) {
          // Login with user data
          login(token as string, data.user);
          // Navigate to home page
          router.push("/jobs");
        } else {
          setError(data.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
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