// components/auth/CountdownTimer.tsx
import { useState, useEffect } from "react";

interface CountdownTimerProps {
  initialSeconds: number;
  onExpire?: () => void;
  format?: "mm:ss" | "seconds" | "minutes";
  className?: string;
  warningThreshold?: number; // seconds when the timer should change to warning state
}

export default function CountdownTimer({
  initialSeconds,
  onExpire,
  format = "mm:ss",
  className = "",
  warningThreshold = 60, // Default 60 seconds
}: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Reset if initial value changes
    setSeconds(initialSeconds);
    setIsExpired(false);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      setIsExpired(true);
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onExpire]);

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

  // Determine styling based on time remaining
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