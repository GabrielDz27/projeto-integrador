import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AutenticacaoService } from '../../../../shared/services/autenticacao-service';
import { NotificationService } from '../../../../shared/services/notification-service';
import { trimmedRequired } from '../../../../shared/utils/form-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card">
        <h1>SCM</h1>
        <p>Entre com suas credenciais</p>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            <span>Usuário</span>
            <input formControlName="username" type="text" placeholder="Digite seu usuário" [class.input-invalid]="form.controls.username.touched && form.controls.username.invalid" />
          </label>

          <label>
            <span>Senha</span>
            <input formControlName="senha" type="password" placeholder="Digite sua senha" [class.input-invalid]="form.controls.senha.touched && form.controls.senha.invalid" />
          </label>

          <button type="submit" [disabled]="form.invalid || sending()">{{ sending() ? 'Entrando...' : 'Entrar' }}</button>
        </form>

        <div class="actions">
          <a routerLink="/esqueci-minha-senha">Esqueci minha senha</a>
        </div>

        <div class="register-prompt">
          <span>Não possui cadastro?</span>
          <a routerLink="/cadastro">Criar uma conta</a>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      :host { display:block; min-height:100vh; background:linear-gradient(135deg,#0f172a,#1d4ed8); font-family: Arial, sans-serif; }
      .auth-shell { display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; }
      .auth-card { width:min(420px,100%); background:#fff; border-radius:16px; padding:32px; box-shadow:0 20px 40px rgba(15,23,42,.25); }
      h1 { margin:0 0 8px; text-align:center; color:#0f172a; }
      p { margin:0 0 22px; text-align:center; color:#475569; }
      form { display:grid; gap:16px; }
      label { display:grid; gap:8px; color:#334155; font-weight:600; }
      input { border:1px solid #dbe3ef; border-radius:10px; padding:12px 14px; font-size:1rem; }
      input.input-invalid { border-color:#dc2626; }
      button { background:#2563eb; color:#fff; border:none; border-radius:10px; padding:12px 16px; font-weight:700; cursor:pointer; }
      button:disabled { opacity:.6; cursor:not-allowed; }
      .alert { margin-bottom:12px; padding:10px 12px; border-radius:8px; font-size:.9rem; }
      .alert.error { background:#fee2e2; color:#991b1b; }
      .actions { display:flex; justify-content:flex-end; margin-top:16px; }
      .register-prompt { display:flex; justify-content:center; gap:6px; margin-top:22px; padding-top:18px; border-top:1px solid #e2e8f0; color:#475569; font-size:.9rem; }
      a { color:#2563eb; text-decoration:none; }
    `
  ]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AutenticacaoService);
  private readonly router = inject(Router);
  private readonly notifications = inject(NotificationService);

  readonly sending = signal(false);

  readonly form = this.fb.nonNullable.group({
    username: ['', [trimmedRequired]],
    senha: ['', [trimmedRequired]]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.sending.set(true);

    const { username, senha } = this.form.getRawValue();
    this.authService.login(username.trim(), senha).subscribe({
      next: () => {
        this.notifications.success('Sessão iniciada.');
        void this.router.navigateByUrl('/inicio');
      },
      error: () => {
        this.sending.set(false);
      },
      complete: () => this.sending.set(false)
    });
  }
}
