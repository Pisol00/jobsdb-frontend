// components/auth/SocialLoginButton.tsx
import { ReactNode } from "react";
import { motion } from "framer-motion";

type Provider = "google" | "facebook" | "twitter" | "line" | "apple";

interface SocialLoginButtonProps {
  provider: Provider;
  onClick?: () => void;
  href?: string;
  label?: string;
  disabled?: boolean;
}

export default function SocialLoginButton({
  provider,
  onClick,
  href,
  label,
  disabled = false,
}: SocialLoginButtonProps) {
  
  const getProviderIcon = (): ReactNode => {
    switch (provider) {
      case "google":
        return (
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
        );
      // Add other providers as needed
      default:
        return <div className="h-5 w-5" />;
    }
  };

  const getProviderLabel = (): string => {
    if (label) return label;
    
    switch (provider) {
      case "google":
        return "เข้าสู่ระบบด้วย Google";
      case "facebook":
        return "เข้าสู่ระบบด้วย Facebook";
      case "twitter":
        return "เข้าสู่ระบบด้วย Twitter";
      case "line":
        return "เข้าสู่ระบบด้วย Line";
      case "apple":
        return "เข้าสู่ระบบด้วย Apple";
      default:
        return "เข้าสู่ระบบ";
    }
  };

  const ButtonContent = () => (
    <>
      {getProviderIcon()}
      <span className="font-medium">{getProviderLabel()}</span>
    </>
  );

  if (href) {
    return (
      <motion.a
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        href={href}
        className={`flex items-center justify-center w-full px-4 py-2.5 space-x-2 text-sm text-gray-700 transition-colors duration-300 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={onClick}
      >
        <ButtonContent />
      </motion.a>
    );
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      className={`flex items-center justify-center w-full px-4 py-2.5 space-x-2 text-sm text-gray-700 transition-colors duration-300 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      <ButtonContent />
    </motion.button>
  );
}