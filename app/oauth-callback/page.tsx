"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // ป้องกันการรัน useEffect ซ้ำ
    if (redirecting) return;
    
    const token = searchParams.get("token");
    
    if (token) {
      // ตรวจสอบ token และดึงข้อมูลผู้ใช้
      fetchUserData(token);
    } else {
      setError("ไม่พบ token กรุณาลองใหม่อีกครั้ง");
      // รอสักครู่แล้วเปลี่ยนเส้นทางไปหน้า login
      setTimeout(() => {
        setRedirecting(true);
        router.push("/auth/login");
      }, 3000);
    }
  }, [searchParams]); // ตัด router, login, redirecting เพื่อป้องกัน re-render loop

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // เรียกใช้ login จาก AuthContext
          login(token, data.user);
          
          // ป้องกัน router ทำงานซ้ำ
          setRedirecting(true);
          
          // เปลี่ยนเส้นทางไปหน้า jobs
          router.push("/jobs");
        } else {
          throw new Error("ไม่สามารถดึงข้อมูลผู้ใช้ได้");
        }
      } else {
        throw new Error("ไม่สามารถตรวจสอบ token ได้");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
      
      // รอสักครู่แล้วเปลี่ยนเส้นทางไปหน้า login
      setTimeout(() => {
        setRedirecting(true);
        router.push("/auth/login");
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4">
          {error ? "เกิดข้อผิดพลาด" : "กำลังเข้าสู่ระบบ..."}
        </h1>
        
        {error ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <p className="text-gray-600">กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...</p>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}