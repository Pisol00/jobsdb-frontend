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

// Retry configuration
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryableStatusCodes: number[];
}

// Base API service class
export class ApiService {
  private baseUrl: string;
  private retryConfig: RetryConfig;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || '';
    
    // ค่าเริ่มต้นสำหรับการทำ retry
    this.retryConfig = {
      maxRetries: 2, // จำนวนครั้งที่จะลองใหม่
      retryDelay: 1000, // ระยะเวลารอก่อนลองใหม่ (ms)
      retryableStatusCodes: [408, 429, 500, 502, 503, 504] // HTTP status ที่สามารถลองใหม่ได้
    };
  }

  // Helper method for making API requests with retry
  protected async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
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
      // Set timeout for the request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      
      // Clear timeout
      clearTimeout(timeoutId);

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
        // Check if we should retry
        if (
          retryCount < this.retryConfig.maxRetries &&
          this.retryConfig.retryableStatusCodes.includes(response.status)
        ) {
          console.log(`Retrying request to ${endpoint} (attempt ${retryCount + 1})...`);
          await new Promise(resolve => setTimeout(resolve, this.retryConfig.retryDelay));
          return this.request<T>(endpoint, options, retryCount + 1);
        }
        
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
      
      // Check if request was aborted (timeout)
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(
          'Request timeout. Please check your internet connection.',
          408, // Request Timeout
          'REQUEST_TIMEOUT',
          error
        );
      }

      // Handle network errors
      if (error instanceof Error) {
        // Check if we should retry for network errors
        if (retryCount < this.retryConfig.maxRetries) {
          console.log(`Retrying network error to ${endpoint} (attempt ${retryCount + 1})...`);
          await new Promise(resolve => setTimeout(resolve, this.retryConfig.retryDelay));
          return this.request<T>(endpoint, options, retryCount + 1);
        }
        
        throw new ApiError(
          'Network error. Please check your connection.',
          0,
          'NETWORK_ERROR',
          error
        );
      }

      // Handle other errors
      throw new ApiError(
        'An unknown error occurred',
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