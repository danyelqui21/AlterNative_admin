import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';
import { env } from '@/core/constants/env';

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: env.apiUrl,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });

    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('lagunapp-admin-token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.axiosInstance.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('lagunapp-admin-token');
          localStorage.removeItem('lagunapp-admin-refresh-token');
          localStorage.removeItem('lagunapp-admin-user');
          window.location.href = '/login';
        }
        return Promise.reject(err);
      },
    );
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get<T>(url, config);
  }

  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.post<T>(url, data, config);
  }

  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.put<T>(url, data, config);
  }

  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<T>(url, config);
  }

  setTokens(token: string, refreshToken?: string) {
    localStorage.setItem('lagunapp-admin-token', token);
    if (refreshToken) localStorage.setItem('lagunapp-admin-refresh-token', refreshToken);
  }

  clearTokens() {
    localStorage.removeItem('lagunapp-admin-token');
    localStorage.removeItem('lagunapp-admin-refresh-token');
    localStorage.removeItem('lagunapp-admin-user');
  }

  get isAuthenticated(): boolean {
    return !!localStorage.getItem('lagunapp-admin-token');
  }
}

export const apiClient = ApiClient.getInstance();
