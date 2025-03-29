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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
   * Helper function to get device ID or create one if it doesn't exist
   */
  export const getOrCreateDeviceId = (): string => {
    let deviceId = localStorage.getItem("deviceId");
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem("deviceId", deviceId);
    }
    return deviceId;
  };