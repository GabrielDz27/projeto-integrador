import { HttpErrorResponse } from '@angular/common/http';
import { FormGroup } from '@angular/forms';

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

  const fieldErrors = payload['fieldErrors'];
  if (fieldErrors && typeof fieldErrors === 'object') {
    const messages = Object.values(fieldErrors as Record<string, unknown>)
      .filter((message): message is string => typeof message === 'string' && !!message.trim());
    if (messages.length) return messages.join(' ');
  }

  const errors = payload['errors'];
  if (Array.isArray(errors) && errors.length) {
    const joined = errors.map((error: unknown) => {
      if (!error || typeof error !== 'object') return '';
      const item = error as Record<string, unknown>;
      return item['defaultMessage'] || item['message'] || item['msg'] || '';
    }).filter((message): message is string => typeof message === 'string' && !!message.trim()).join('\n');
    if (joined.trim()) return joined;
  }

  const flatFieldErrors = Object.entries(payload)
    .filter(([field, message]) => !['status', 'error', 'path', 'timestamp', 'message'].includes(field.toLowerCase())
      && typeof message === 'string' && !!message.trim())
    .map(([, message]) => (message as string).trim());
  if (flatFieldErrors.length) return flatFieldErrors.join(' ');

  if (http.status === 0) return 'Não foi possível conectar à API. Verifique se o servidor está em execução.';
  if (http.status === 404) return 'A rota solicitada não foi encontrada (404).';
  if (http.status >= 500) return `O servidor encontrou um erro (${http.status}).`;

  return fallback;
}

export function applyApiFieldErrors(form: FormGroup, error: unknown): Record<string, string> {
  if (!(error instanceof HttpErrorResponse) || !error.error || typeof error.error !== 'object') return {};
  const fieldErrors = (error.error as Record<string, unknown>)['fieldErrors'];
  if (!fieldErrors || typeof fieldErrors !== 'object') return {};

  const applied: Record<string, string> = {};
  for (const [field, message] of Object.entries(fieldErrors as Record<string, unknown>)) {
    const control = form.get(field);
    if (!control || typeof message !== 'string') continue;
    control.setErrors({ ...control.errors, server: message });
    control.markAsTouched();
    applied[field] = message;
  }
  return applied;
}

export function describeApiFieldErrors(errors: Record<string, string>): string[] {
  const labels: Record<string, string> = {
    nome: 'Nome', email: 'E-mail', telefone: 'Telefone', cep: 'CEP', estado: 'Estado', cidade: 'Cidade',
    username: 'Usuário', senha: 'Senha', cpf: 'CPF', cnpj: 'CNPJ', razaoSocial: 'Razão social',
    nomeFantasia: 'Nome fantasia', endereco: 'Endereço', idCliente: 'Cliente/MEI', descricao: 'Descrição',
    valor: 'Valor', dataCompetencia: 'Competência', competencia: 'Competência', vencimento: 'Vencimento',
    status: 'Situação', aliquotaIss: 'Alíquota ISS', precoBase: 'Preço base',
  };
  return Object.entries(errors).map(([field, message]) => `${labels[field] ?? field}: ${message}`);
}
