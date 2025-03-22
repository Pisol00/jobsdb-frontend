// components/auth/PasswordInput.tsx
import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PasswordInputProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
  helperText?: string;
  error?: string;
  withIcon?: boolean;
};

export default function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  placeholder = "••••••••",
  required = false,
  disabled = false,
  minLength,
  helperText,
  error,
  withIcon = true,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-gray-700 font-medium">
        {label}
      </Label>
      <div className="relative">
        {withIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <Input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${withIcon ? "pl-10" : ""} pr-10 bg-white/70 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all ${
            error ? "border-red-300" : ""
          }`}
          required={required}
          disabled={disabled}
          minLength={minLength}
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
            disabled={disabled}
          >
            {showPassword ? (
              <Eye className="h-5 w-5" />
            ) : (
              <EyeOff className="h-5 w-5" />
            )}
            <span className="sr-only">
              {showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            </span>
          </button>
        </div>
      </div>
      {helperText && !error && (
        <p className="text-xs text-gray-500 ml-1">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-600 ml-1">{error}</p>}
    </div>
  );
}