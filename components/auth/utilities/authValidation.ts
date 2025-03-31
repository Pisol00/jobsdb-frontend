// components/auth/utilities/authValidation.ts

/**
 * Validates username format (letters, numbers, underscore only)
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  return usernameRegex.test(username);
};

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  // ใช้ regular expression ที่ครอบคลุมมากขึ้นสำหรับการตรวจสอบอีเมล
  const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email.toLowerCase());
};

/**
 * Validates password strength
 * @param password The password to validate
 * @param requireSpecialChar Whether to require special characters
 * @param minLength Minimum password length
 */
export const validatePasswordStrength = (
  password: string,
  requireSpecialChar: boolean = false,
  minLength: number = 8
): {
  isValid: boolean;
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
} => {
  const hasMinLength = password.length >= minLength;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const isValid =
    hasMinLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber &&
    (requireSpecialChar ? hasSpecialChar : true);

  return {
    isValid,
    hasMinLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  };
};

/**
 * Check if passwords match
 */
export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};

/**
 * Format remaining time in seconds to MM:SS format
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (!seconds) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

/**
 * ตรวจสอบความถูกต้องของ token
 */
export const isValidToken = (token: string): boolean => {
  // ตรวจสอบว่า token ไม่ใช่ค่าว่าง หรือค่าที่ไม่ต้องการ
  if (!token || token === 'undefined' || token === 'null') {
    return false;
  }
  
  // ตรวจสอบความยาวขั้นต่ำ (ควรมีความยาวอย่างน้อย 10 ตัวอักษร)
  if (token.length < 10) {
    return false;
  }
  
  // อาจจะเพิ่มการตรวจสอบอื่นๆ เช่น ตรวจสอบว่า token มีรูปแบบที่ถูกต้อง (เช่น JWT)
  // ตัวอย่าง: ตรวจสอบว่า token มี 3 ส่วนที่คั่นด้วยจุด (.)
  // if (token.split('.').length !== 3) {
  //   return false;
  // }
  
  return true;
};

/**
 * Helper function to get device ID or create one if it doesn't exist
 */
export const getOrCreateDeviceId = (): string => {
  try {
    let deviceId = localStorage.getItem("deviceId");
    
    // ตรวจสอบว่า deviceId ถูกต้องหรือไม่
    if (!deviceId || deviceId === 'undefined' || deviceId === 'null') {
      // ใช้ browser fingerprint จริงๆ ควรใช้ library เช่น fingerprintjs
      // แต่ในที่นี้จะใช้การสร้าง UUID แทน
      deviceId = generateUUID();
      localStorage.setItem("deviceId", deviceId);
    }
    
    return deviceId;
  } catch (error) {
    // กรณีที่ localStorage ไม่สามารถใช้งานได้ (เช่น private browsing)
    console.error('Error accessing localStorage:', error);
    return generateUUID();
  }
};

/**
 * สร้าง UUID สำหรับระบุอุปกรณ์
 */
export const generateUUID = (): string => {
  let d = new Date().getTime();
  
  // ใช้ performance ถ้ามี
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now();
  }
  
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
};