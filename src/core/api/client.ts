import axios from 'axios';
import { env } from '@/core/constants/env';

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lagunapp-admin-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
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
