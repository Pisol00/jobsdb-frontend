// config/index.ts
export const CONFIG = {
    API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes in milliseconds
    TRUSTED_DEVICE_EXPIRY: 60 * 60 * 1000, // 1 hour in milliseconds
    SECURITY: {
      MAX_LOGIN_ATTEMPTS: 5, 
      LOCKOUT_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
    }
  };
  
  export default CONFIG;