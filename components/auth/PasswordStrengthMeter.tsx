// components/auth/PasswordStrengthMeter.tsx
import { useEffect, useState } from "react";
import { XCircle, CheckCircle2, CircleAlert } from "lucide-react";

export interface PasswordStrength {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

interface PasswordStrengthMeterProps {
  password: string;
  minLength?: number;
  onChange?: (isValid: boolean) => void;
  requireSpecialChar?: boolean;
}

export default function PasswordStrengthMeter({
  password,
  minLength = 8,
  onChange,
  requireSpecialChar = false,
}: PasswordStrengthMeterProps) {
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  // ฟังก์ชันตรวจสอบความปลอดภัยของรหัสผ่าน
  const checkPasswordStrength = (password: string) => {
    const strength = {
      hasMinLength: password.length >= minLength,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    };
    
    setPasswordStrength(strength);
    
    // Call onChange with validity status
    if (onChange) {
      const isValid = 
        strength.hasMinLength && 
        strength.hasUpperCase && 
        strength.hasLowerCase && 
        strength.hasNumber && 
        (requireSpecialChar ? strength.hasSpecialChar : true);
      
      onChange(isValid);
    }
  };

  useEffect(() => {
    checkPasswordStrength(password);
  }, [password, minLength, requireSpecialChar]);

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

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-700">
          ความปลอดภัยของรหัสผ่าน:
        </span>
        <span
          className={`text-xs font-medium ${
            passwordStrengthScore() < 3
              ? "text-red-600"
              : passwordStrengthScore() < 5
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
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
          <span
            className={
              passwordStrength.hasMinLength ? "text-green-700" : "text-gray-600"
            }
          >
            มีความยาวอย่างน้อย {minLength} ตัวอักษร
          </span>
        </li>
        <li className="flex items-center text-xs">
          {passwordStrength.hasUpperCase ? (
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
          ) : (
            <XCircle className="h-4 w-4 text-gray-400 mr-1.5" />
          )}
          <span
            className={
              passwordStrength.hasUpperCase ? "text-green-700" : "text-gray-600"
            }
          >
            มีตัวอักษรพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว
          </span>
        </li>
        <li className="flex items-center text-xs">
          {passwordStrength.hasLowerCase ? (
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
          ) : (
            <XCircle className="h-4 w-4 text-gray-400 mr-1.5" />
          )}
          <span
            className={
              passwordStrength.hasLowerCase ? "text-green-700" : "text-gray-600"
            }
          >
            มีตัวอักษรพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว
          </span>
        </li>
        <li className="flex items-center text-xs">
          {passwordStrength.hasNumber ? (
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
          ) : (
            <XCircle className="h-4 w-4 text-gray-400 mr-1.5" />
          )}
          <span
            className={
              passwordStrength.hasNumber ? "text-green-700" : "text-gray-600"
            }
          >
            มีตัวเลข (0-9) อย่างน้อย 1 ตัว
          </span>
        </li>
        <li className="flex items-center text-xs">
          {passwordStrength.hasSpecialChar ? (
            <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
          ) : (
            <CircleAlert className="h-4 w-4 text-gray-400 mr-1.5" />
          )}
          <span
            className={
              passwordStrength.hasSpecialChar ? "text-green-700" : "text-gray-600"
            }
          >
            มีอักขระพิเศษ (!@#$%^&*) อย่างน้อย 1 ตัว {requireSpecialChar ? "" : "(แนะนำแต่ไม่บังคับ)"}
          </span>
        </li>
      </ul>
    </div>
  );
}