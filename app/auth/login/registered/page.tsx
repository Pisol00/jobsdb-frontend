"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisteredSuccessPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Store success state in session storage
    sessionStorage.setItem("registerSuccess", "true");
    // Redirect to login page
    router.replace("/auth/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}