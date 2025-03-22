// components/auth/forms/ResetPasswordForm.tsx
import { useState, useEffect } from "react";
import { Loader2, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AlertBox from "../AlertBox";
import { SuccessMessage } from "../AlertBox";
import PasswordInput from "../PasswordInput";

interface ResetPasswordFormProps {
  onSubmit: (password: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
  isSuccess?: boolean;
}

export default function ResetPasswordForm({
  onSubmit,
  isLoading,
  error,
  isSuccess,
}: ResetPasswordFormProps) {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);

  useEffect(() => {
    if (formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (formData.password !== formData.confirmPassword) {
      return; // Don't submit if passwords don't match
    }
    
    if (formData.password.length < 6) {
      return; // Don't submit if password is too short
    }
    
    await onSubmit(formData.password);
  };

  if (isSuccess) {
    return (
      <SuccessMessage
        title="เปลี่ยนรหัสผ่านสำเร็จ!"
        message="รหัสผ่านของคุณได้รับการเปลี่ยนเรียบร้อยแล้ว"
        details="กำลังนำคุณไปยังหน้าเข้าสู่ระบบ..."
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordInput
        id="password"
        name="password"
        label="รหัสผ่านใหม่"
        value={formData.password}
        onChange={handleChange}
        placeholder="อย่างน้อย 6 ตัวอักษร"
        required
        minLength={6}
        helperText="รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร"
      />
      
      <div className="space-y-2">
        <PasswordInput
          id="confirmPassword"
          name="confirmPassword"
          label="ยืนยันรหัสผ่านใหม่"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="ยืนยันรหัสผ่านอีกครั้ง"
          required
          minLength={6}
        />
        
        {/* Password match indicator */}
        {passwordMatch !== null && (
          <div className="flex items-center mt-1">
            {passwordMatch ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1.5" />
                <span className="text-xs text-green-700">รหัสผ่านตรงกัน</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500 mr-1.5" />
                <span className="text-xs text-red-700">รหัสผ่านไม่ตรงกัน</span>
              </>
            )}
          </div>
        )}
      </div>
      
      {error && <AlertBox type="error" message={error} />}
      
      <Button
        type="submit"
        className="w-full py-2 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        disabled={isLoading || !passwordMatch || formData.password.length < 6}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            กำลังตั้งรหัสผ่านใหม่...
          </span>
        ) : (
          "บันทึกรหัสผ่านใหม่"
        )}
      </Button>
    </form>
  );
}