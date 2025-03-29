// components/auth/AccountLockoutStatus.tsx
import { ShieldAlert } from "lucide-react";
import AlertBox from "./AlertBox";
import CountdownTimer from "./CountdownTimer";

interface AccountLockoutStatusProps {
  isLocked: boolean;
  remainingLockTime: number | null;
  onExpire?: () => void;
}

/**
 * Component to display account lockout status with countdown timer
 */
export default function AccountLockoutStatus({
  isLocked,
  remainingLockTime,
  onExpire,
}: AccountLockoutStatusProps) {
  if (!isLocked || !remainingLockTime) {
    return null;
  }

  // Format lock time display - คำนวณนาทีและวินาที
  const minutes = Math.floor(remainingLockTime / 60);
  const seconds = remainingLockTime % 60;
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <AlertBox 
      type="warning" 
      icon={<ShieldAlert className="h-5 w-5 text-orange-500" />}
      message={
        <div className="flex flex-col">
          <span>บัญชีถูกล็อคชั่วคราวเนื่องจากล็อกอินผิดหลายครั้ง</span>
          <span className="mt-1">
            กรุณาลองใหม่ในอีก{" "}
            <CountdownTimer
              initialSeconds={remainingLockTime}
              onExpire={onExpire}
              className="font-bold"
            />
          </span>
        </div>
      } 
    />
  );
}