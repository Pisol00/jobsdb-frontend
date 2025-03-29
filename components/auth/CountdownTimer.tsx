// components/auth/CountdownTimer.tsx
import { useState, useEffect } from "react";

interface CountdownTimerProps {
  initialSeconds?: number;
  expiryTimestamp?: number; // เพิ่มตัวเลือกให้รับ timestamp ได้ด้วย
  onExpire?: () => void;
  format?: "mm:ss" | "seconds" | "minutes";
  className?: string;
  warningThreshold?: number;
}

export default function CountdownTimer({
  initialSeconds,
  expiryTimestamp,
  onExpire,
  format = "mm:ss",
  className = "",
  warningThreshold = 60,
}: CountdownTimerProps) {
  const [seconds, setSeconds] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // กำหนดเวลาหมดอายุจริง (ถ้าไม่มีให้ใช้ initialSeconds)
    let expiry: number;
    if (expiryTimestamp) {
      // ใช้ timestamp ที่ส่งมาโดยตรง
      expiry = expiryTimestamp;
    } else if (initialSeconds) {
      // คำนวณจาก initialSeconds
      expiry = Date.now() + initialSeconds * 1000;
    } else {
      // ถ้าไม่มีทั้งสอง ใช้ค่าเริ่มต้น (ป้องกันความผิดพลาด)
      expiry = Date.now() + 60 * 1000; // 1 นาที
    }

    // ฟังก์ชันคำนวณเวลาที่เหลือจากเวลาจริง
    const calculateRemainingTime = () => {
      const now = Date.now();
      const diff = Math.max(0, expiry - now);
      const remainingSeconds = Math.floor(diff / 1000);
      
      setSeconds(remainingSeconds);
      
      if (remainingSeconds <= 0 && !isExpired) {
        setIsExpired(true);
        if (onExpire) onExpire();
      }
    };

    // คำนวณครั้งแรกทันที
    calculateRemainingTime();

    // ตั้งเวลาให้คำนวณทุกวินาที
    const timer = setInterval(calculateRemainingTime, 1000);
    
    // clear timer เมื่อ component unmount
    return () => clearInterval(timer);
  }, [expiryTimestamp, initialSeconds, onExpire, isExpired]);

  // ฟังก์ชันแปลงเวลาเป็นรูปแบบต่างๆ
  const formatTime = (totalSeconds: number): string => {
    if (format === "seconds") {
      return totalSeconds.toString();
    } else if (format === "minutes") {
      return Math.ceil(totalSeconds / 60).toString();
    }

    // Default: "mm:ss"
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // กำหนดสีตามเวลาที่เหลือ
  const getColorClass = () => {
    if (isExpired) return "text-red-600";
    if (seconds <= warningThreshold) return "text-red-600";
    return "text-blue-600";
  };

  return (
    <span className={`${getColorClass()} ${className}`}>
      {formatTime(seconds)}
    </span>
  );
}