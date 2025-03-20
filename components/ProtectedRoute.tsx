"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [redirectInProgress, setRedirectInProgress] = useState(false);

  useEffect(() => {
    // ป้องกันการ redirect ซ้ำๆ
    if (!loading && !isLoggedIn && !redirectInProgress) {
      setRedirectInProgress(true);
      router.push("/auth/login");
    }
  }, [isLoggedIn, loading, router, redirectInProgress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // แสดงเนื้อหาเฉพาะเมื่อเข้าสู่ระบบแล้วเท่านั้น
  return <>{children}</>;
};

export default ProtectedRoute;