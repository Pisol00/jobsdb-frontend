// components/auth/AuthLayout.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
  showLogo?: boolean;
  title?: string;
  subtitle?: string;
  logoIcon?: ReactNode;
};

export default function AuthLayout({
  children,
  showLogo = false,
  title,
  subtitle,
  logoIcon
}: AuthLayoutProps) {
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
            {showLogo && (
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="inline-block bg-blue-600 text-white p-3 rounded-2xl mb-4 shadow-lg"
                >
                  {logoIcon || (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                      <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                    </svg>
                  )}
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                  JobsDB
                </h1>
                {title && <p className="mt-2 text-gray-600">{title}</p>}
              </div>
            )}

            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}