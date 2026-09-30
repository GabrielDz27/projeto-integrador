import { HttpErrorResponse } from '@angular/common/http';

// GERADO POR IA.
export function extractApiError(err: unknown, fallback: string): string {
  if (!(err instanceof HttpErrorResponse)) return fallback;

  const http = err;

  if (typeof http.error === 'string' && http.error.trim() && !/<(?:!doctype|html|head|body)\b/i.test(http.error)) {
    return http.error.trim();
  }

  const payload = typeof http.error === 'object' && http.error ? http.error as Record<string, unknown> : {};
  const msg = payload['message'];
  if (typeof msg === 'string' && msg.trim()) return msg;

  const errors = payload['errors'];
  if (Array.isArray(errors) && errors.length) {
    const joined = errors.map((error: unknown) => {
      if (!error || typeof error !== 'object') return '';
      const item = error as Record<string, unknown>;
      return item['defaultMessage'] || item['message'] || item['msg'] || '';
    }).filter((message): message is string => typeof message === 'string' && !!message.trim()).join('\n');
    if (joined.trim()) return joined;
  }

  const fieldErrors = Object.entries(payload)
    .filter(([field, message]) => !['status', 'error', 'path', 'timestamp', 'message'].includes(field.toLowerCase())
      && typeof message === 'string' && !!message.trim())
    .map(([, message]) => (message as string).trim());
  if (fieldErrors.length) return fieldErrors.join(' ');

  if (http.status === 0) return 'Não foi possível conectar à API. Verifique se o servidor está em execução.';
  if (http.status === 404) return 'A rota solicitada não foi encontrada (404).';
  if (http.status >= 500) return `O servidor encontrou um erro (${http.status}).`;

  return fallback;
}
