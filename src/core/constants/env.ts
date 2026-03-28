export const env = {
  apiUrl: import.meta.env.VITE_API_URL as string || 'http://localhost:3000/api',
  appEnv: import.meta.env.VITE_APP_ENV as string || 'development',
  isDebug: (import.meta.env.VITE_APP_ENV || 'development') === 'development',
} as const;
