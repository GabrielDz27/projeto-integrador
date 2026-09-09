import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AutenticacaoService } from '../../../../shared/services/autenticacao-service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <main class="auth-shell">
      <section class="auth-card">
        <h1>Nova senha</h1>
        <p>Defina sua nova senha.</p>

        @if (message()) {
          <div class="alert success">{{ message() }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>
            <span>Nova senha</span>
            <input type="password" formControlName="novaSenha" placeholder="Digite a nova senha" />
          </label>

          <label>
            <span>Confirmar senha</span>
            <input type="password" formControlName="confirmacao" placeholder="Confirme a nova senha" />
          </label>

          <button type="submit" [disabled]="form.invalid || sending()">{{ sending() ? 'Salvando...' : 'Salvar senha' }}</button>
        </form>

        <div class="actions">
          <a routerLink="/login">Voltar ao login</a>
        </div>
      </section>
    </main>
  `,
  styles: [
    `
      :host { display:block; min-height:100vh; background:linear-gradient(135deg,#111827,#2563eb); font-family: Arial, sans-serif; }
      .auth-shell { display:flex; align-items:center; justify-content:center; min-height:100vh; padding:24px; }
      .auth-card { width:min(420px,100%); background:#fff; border-radius:16px; padding:32px; box-shadow:0 20px 40px rgba(15,23,42,.25); }
      h1 { margin:0 0 8px; text-align:center; }
      p { margin:0 0 18px; color:#475569; text-align:center; }
      form { display:grid; gap:16px; }
      label { display:grid; gap:8px; color:#334155; font-weight:600; }
      input { border:1px solid #dbe3ef; border-radius:10px; padding:12px 14px; font-size:1rem; }
      button { background:#2563eb; color:#fff; border:none; border-radius:10px; padding:12px 16px; font-weight:700; cursor:pointer; }
      button:disabled { opacity:.6; cursor:not-allowed; }
      .alert { margin-bottom:12px; padding:10px 12px; border-radius:8px; }
      .alert.success { background:#dcfce7; color:#166534; }
      .actions { margin-top:16px; display:flex; justify-content:flex-end; }
      a { color:#2563eb; text-decoration:none; }
    `
  ]
})
export class ResetPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AutenticacaoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly message = signal('');
  readonly sending = signal(false);

  readonly form = this.fb.nonNullable.group({
    novaSenha: ['', [Validators.required, Validators.minLength(6)]],
    confirmacao: ['', [Validators.required, Validators.minLength(6)]]
  });

  submit(): void {
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    const novaSenha = this.form.getRawValue().novaSenha;
    const confirmacao = this.form.getRawValue().confirmacao;

    if (!token || novaSenha !== confirmacao) {
      this.message.set('Token inválido ou senhas divergentes.');
      return;
    }

    this.sending.set(true);
    this.authService.confirmarRecuperacaoSenha(token, novaSenha).subscribe({
      next: (response) => {
        this.message.set(response?.message ?? 'Senha redefinida com sucesso.');
        this.sending.set(false);
        setTimeout(() => this.router.navigateByUrl('/login'), 1200);
      },
      error: () => {
        this.message.set('Não foi possível redefinir a senha.');
        this.sending.set(false);
      }
    });
  }
}
