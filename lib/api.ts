// API base URL - change this to your actual backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types
interface LoginData {
  email: string;
  password: string;
  deviceId?: string;
  rememberMe?: boolean;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    twoFactorEnabled?: boolean; // เพิ่มฟิลด์สำหรับตรวจสอบสถานะ 2FA
    profileImage?: string;
  };
  requireTwoFactor?: boolean; // เพิ่มฟิลด์สำหรับแสดงว่าต้องการ 2FA หรือไม่
  tempToken?: string; // เพิ่มฟิลด์สำหรับ temporary token ในกรณี 2FA
  message?: string; // เพิ่มฟิลด์สำหรับข้อความตอบกลับ
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

// เพิ่ม Interface สำหรับการยืนยัน OTP
interface VerifyOTPData {
  otp: string;
  tempToken: string;
  rememberDevice?: boolean;
  deviceId?: string;
}

interface VerifyOTPResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    fullName: string;
    email: string;
    profileImage?: string;
    twoFactorEnabled?: boolean;
  };
  message?: string;
}

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any, 
  token?: string
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  
  if (!response.ok) {
    // Try to parse error message from response
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    } catch (e) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  }

  return await response.json();
}

// Auth API functions
export async function loginUser(data: LoginData): Promise<LoginResponse> {
  // ดึง deviceId จาก localStorage หากไม่ได้ระบุใน data
  if (!data.deviceId) {
    data.deviceId = localStorage.getItem('deviceId') || undefined;
  }
  return apiRequest<LoginResponse>('/auth/login', 'POST', data);
}

export async function registerUser(data: RegisterData): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register', 'POST', data);
}

// เพิ่มฟังก์ชันสำหรับการยืนยัน OTP
export async function verifyOTP(data: VerifyOTPData): Promise<VerifyOTPResponse> {
  // ตรวจสอบและเพิ่ม deviceId หากไม่ได้ระบุ
  if (!data.deviceId) {
    data.deviceId = localStorage.getItem('deviceId') || undefined;
  }
  return apiRequest<VerifyOTPResponse>('/auth/verify-otp', 'POST', data);
}

// Get current user profile (requires auth)
export async function getCurrentUser() {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return apiRequest('/auth/me', 'GET', undefined, token);
}

// Logout function (client-side only)
export function logoutUser() {
  localStorage.removeItem('token');
  // ล้าง tempToken ใน sessionStorage หากมี
  sessionStorage.removeItem('tempToken');
  // You might also want to invalidate the token on the server
  // window.location.href = '/login';
}

// เพิ่มฟังก์ชันสำหรับเปิด/ปิดการทำงานของ 2FA
export async function toggleTwoFactor(enable: boolean) {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return apiRequest('/auth/toggle-2fa', 'POST', { enable }, token);
}

// Other API functions can be added here