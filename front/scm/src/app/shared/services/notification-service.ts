import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error';

export interface NotificationMessage {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly current = signal<NotificationMessage | null>(null);
  private nextId = 0;
  private timeout: ReturnType<typeof setTimeout> | undefined;

  success(message: string, title = 'Sucesso'): void {
    this.show('success', title, message);
  }

  error(message: string, title = 'Erro'): void {
    this.show('error', title, message);
  }

  dismiss(): void {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = undefined;
    this.current.set(null);
  }

  private show(type: NotificationType, title: string, message: string): void {
    if (this.timeout) clearTimeout(this.timeout);
    this.current.set({ id: ++this.nextId, type, title, message });
    this.timeout = setTimeout(() => this.dismiss(), 5000);
  }
}