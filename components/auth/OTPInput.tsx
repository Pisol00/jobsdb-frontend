// components/auth/OTPInput.tsx
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface OTPInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  maxLength?: number;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  error?: string;
  autoFocus?: boolean;
  disabled?: boolean;
}

export default function OTPInput({
  id,
  value,
  onChange,
  label = "รหัส OTP",
  maxLength = 6,
  placeholder = "••••••",
  helperText,
  required = true,
  error,
  autoFocus = true,
  disabled = false,
}: OTPInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and limit to maxLength
    const sanitizedValue = e.target.value
      .replace(/\D/g, '')
      .slice(0, maxLength);
    
    onChange(sanitizedValue);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="text-gray-700 font-medium">
          {label}
        </Label>
      )}
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        maxLength={maxLength}
        value={value}
        onChange={handleChange}
        className={`text-center text-2xl font-mono tracking-widest bg-white/70 focus:bg-white border-gray-300 focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all ${
          error ? "border-red-300" : ""
        }`}
        required={required}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      {helperText && !error && (
        <p className="text-xs text-gray-500 text-center">{helperText}</p>
      )}
      {error && <p className="text-xs text-red-600 text-center">{error}</p>}
    </div>
  );
}