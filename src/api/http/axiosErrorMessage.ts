import axios from 'axios';

/**
 * Normalizes Axios / unknown errors into a user-presentable message for toasts and forms.
 */
export function getAxiosErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      const rec = data as Record<string, unknown>;
      const message = rec.message;
      if (typeof message === 'string' && message.trim()) return message;
      const detail = rec.detail;
      if (typeof detail === 'string' && detail.trim()) return detail;
      const err = rec.error;
      if (typeof err === 'string' && err.trim()) return err;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
