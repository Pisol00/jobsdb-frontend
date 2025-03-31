// lib/apiService.ts
import { CONFIG } from '@/config';

// Generic type for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  [key: string]: any;
}

// Error class for API errors
export class ApiError extends Error {
  public code?: string;
  public status: number;
  public data?: any;

  constructor(message: string, status: number, code?: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

// Base API service class
export class ApiService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || '';
  }

  // Helper method for making API requests
  protected async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Set default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add token if available
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Make the request
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Parse the JSON response
      let data: any;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Check if the request was successful
      if (!response.ok) {
        throw new ApiError(
          data.message || 'Something went wrong',
          response.status,
          data.code,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof Error) {
        throw new ApiError(
          'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบการเชื่อมต่อของคุณ',
          0,
          'NETWORK_ERROR',
          error
        );
      }

      // Handle other errors
      throw new ApiError(
        'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
        0,
        'UNKNOWN_ERROR',
        error
      );
    }
  }

  // GET request
  protected async get<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  // POST request
  protected async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  // PUT request
  protected async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  // DELETE request
  protected async delete<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }
}

export default ApiService;