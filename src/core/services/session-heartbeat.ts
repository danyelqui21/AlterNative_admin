import { api } from '../api/client';

let intervalId: ReturnType<typeof setInterval> | null = null;

/** Start checking session validity every 30 seconds. */
export function startSessionHeartbeat() {
  stopSessionHeartbeat();
  intervalId = setInterval(async () => {
    const token = localStorage.getItem('lagunapp-admin-token');
    if (!token) return;
    try {
      await api.get('/auth/me');
    } catch {
      // 401 interceptor handles token clear + redirect
    }
  }, 30_000);
}

/** Stop the heartbeat timer. */
export function stopSessionHeartbeat() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
