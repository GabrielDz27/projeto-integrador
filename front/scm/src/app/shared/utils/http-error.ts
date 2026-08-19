import { HttpErrorResponse } from '@angular/common/http';

// GERADO POR IA.
export function extractApiError(err: unknown, fallback: string): string {
  if (!err) return fallback;

  const http = err as HttpErrorResponse;

  if (typeof http.error === 'string' && http.error.trim()) return http.error;

  const msg = (http.error as any)?.message;
  if (typeof msg === 'string' && msg.trim()) return msg;

  const errors = (http.error as any)?.errors;
  if (Array.isArray(errors) && errors.length) {
    const joined = errors
      .map((e: any) => e?.defaultMessage || e?.message || e?.msg)
      .filter(Boolean)
      .join('\n');
    if (joined.trim()) return joined;
  }

  if (typeof http.message === 'string' && http.message.trim()) return http.message;

  return fallback;
}
