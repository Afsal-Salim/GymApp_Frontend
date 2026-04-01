import axios from 'axios';

/** Collect user-visible strings from Django REST / similar `{ field: ["msg"], ... }` bodies. */
function collectNestedStringMessages(value: unknown): string[] {
  if (value == null) return [];
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectNestedStringMessages(item));
  }
  return [];
}

function formatDrfStyleFieldErrors(rec: Record<string, unknown>): string | null {
  const parts: string[] = [];
  for (const val of Object.values(rec)) {
    parts.push(...collectNestedStringMessages(val));
  }
  return parts.length > 0 ? parts.join(' ') : null;
}

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
      if (Array.isArray(detail) && detail.length > 0) {
        const fromDetail = collectNestedStringMessages(detail);
        if (fromDetail.length > 0) return fromDetail.join(' ');
      }
      const err = rec.error;
      if (typeof err === 'string' && err.trim()) return err;
      const fieldBlob = formatDrfStyleFieldErrors(rec);
      if (fieldBlob) return fieldBlob;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
