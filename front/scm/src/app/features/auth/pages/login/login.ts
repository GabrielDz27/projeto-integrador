import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LayoutAuth } from '../../../../shared/components/layout-auth/layout-auth';
import { AutenticacaoService } from '../../../../shared/services/autenticacao-service';
import { trimmedRequired } from '../../../../shared/utils/form-validators';
import { extractApiError } from '../../../../shared/utils/http-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LayoutAuth],
  templateUrl: './login.html',
  styles: [`.input-invalid{border-color:#dc2626!important}.login-submit{width:100%;padding:12px 16px;border:0;border-radius:6px;background:#1d4ed8;color:#fff;font-weight:700}.login-submit:disabled{opacity:.55;cursor:not-allowed}`]
})
export class Login {
  private readonly fb = new FormBuilder();
  private readonly api = inject(AutenticacaoService);
  private readonly router = inject(Router);
  
  formError = signal<string | null>(null);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    login: ['', trimmedRequired],
    senha: ['', trimmedRequired],
  });

  submit() {
    this.formError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    const { login, senha } = this.form.getRawValue();
    this.api.login(login.trim(), senha).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigateByUrl('/inicio');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.formError.set(extractApiError(err, 'Não foi possível iniciar a sessão.'));
      },
    });
  }
}
