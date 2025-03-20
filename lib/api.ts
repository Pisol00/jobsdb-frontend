// API base URL - change this to your actual backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Types
interface LoginData {
  email: string;
  password: string;
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
  };
}

interface RegisterResponse {
  success: boolean;
  message: string;
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
  return apiRequest<LoginResponse>('/auth/login', 'POST', data);
}

export async function registerUser(data: RegisterData): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register', 'POST', data);
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
  // You might also want to invalidate the token on the server
  // window.location.href = '/login';
}

// Other API functions can be added here