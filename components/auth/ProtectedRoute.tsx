"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
}

/**
 * A component that protects routes requiring authentication.
 * Redirects unauthenticated users to the login page.
 */
const ProtectedRoute = ({ 
  children, 
  redirectPath = "/auth/login" 
}: ProtectedRouteProps) => {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [redirectInProgress, setRedirectInProgress] = useState(false);

  useEffect(() => {
    // Only redirect if not loading, not logged in, and not already redirecting
    if (!loading && !isLoggedIn && !redirectInProgress) {
      setRedirectInProgress(true);
      router.push(redirectPath);
    }
  }, [isLoggedIn, loading, router, redirectInProgress, redirectPath]);

  // Loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Not authenticated state
  if (!isLoggedIn) {
    return <AuthenticationRequired />;
  }

  // Authenticated state - render children
  return <>{children}</>;
};

// Extracted loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Extracted authentication required message component
const AuthenticationRequired = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <p className="text-lg text-gray-600 mb-4">กรุณาเข้าสู่ระบบเพื่อเข้าถึงหน้านี้</p>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
    </div>
  </div>
);

export default ProtectedRoute;