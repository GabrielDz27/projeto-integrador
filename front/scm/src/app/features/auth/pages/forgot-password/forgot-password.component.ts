import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AutenticacaoService } from '../../../../shared/services/autenticacao-service';
import { NotificationService } from '../../../../shared/services/notification-service';
import { trimmedRequired } from '../../../../shared/utils/form-validators';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card">
        <h1>Recuperar senha</h1>
        <p>Informe seu e-mail cadastrado para receber o token de recuperação.</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            <span>E-mail</span>
            <input type="email" formControlName="email" placeholder="seu@email.com" [class.input-invalid]="form.controls.email.touched && form.controls.email.invalid" />
          </label>

          <button type="submit" [disabled]="form.invalid || sending()">{{ sending() ? 'Enviando...' : 'Enviar link' }}</button>
        </form>

        <div class="actions">
          <a routerLink="/login">Voltar ao login</a>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      :host { display:block; min-height:100vh; background:linear-gradient(135deg,#0f172a,#334155); font-family: Arial, sans-serif; }
      .auth-shell { display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; }
      .auth-card { width:min(420px,100%); background:#fff; border-radius:16px; padding:32px; box-shadow:0 20px 40px rgba(15,23,42,.25); }
      h1 { margin:0 0 8px; text-align:center; }
      p { margin:0 0 18px; color:#475569; text-align:center; }
      form { display:grid; gap:16px; }
      label { display:grid; gap:8px; color:#334155; font-weight:600; }
      input { border:1px solid #dbe3ef; border-radius:10px; padding:12px 14px; font-size:1rem; }
      input.input-invalid { border-color:#dc2626; }
      button { background:#0f172a; color:#fff; border:none; border-radius:10px; padding:12px 16px; font-weight:700; cursor:pointer; }
      button:disabled { opacity:.6; cursor:not-allowed; }
      .alert { margin-bottom:12px; padding:10px 12px; border-radius:8px; }
      .alert.success { background:#dcfce7; color:#166534; }
      .actions { margin-top:16px; display:flex; justify-content:flex-end; }
      a { color:#2563eb; text-decoration:none; }
    `
  ]
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AutenticacaoService);

  readonly sending = signal(false);
  private readonly notifications = inject(NotificationService);

  readonly form = this.fb.nonNullable.group({
    email: ['', [trimmedRequired, Validators.email]]
  });

  submit(): void {
    if (this.form.invalid) return;
    this.sending.set(true);
    this.authService.solicitarRecuperacaoSenha(this.form.getRawValue().email.trim()).subscribe({
      next: (response) => {
        this.notifications.success(response?.message ?? 'Se o e-mail estiver cadastrado, o link foi enviado.');
        this.sending.set(false);
      },
      error: () => {
        this.sending.set(false);
      }
    });
  }
}
