import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { LayoutAuth } from '../../../../shared/components/layout-auth/layout-auth';
import {ButtonComponent} from '../../../../shared/ui/button/button';
import { AutenticacaoService } from '../../../../shared/services/autenticacao-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LayoutAuth, ButtonComponent],
  templateUrl: './login.html'
})
export class Login {
  private readonly fb = new FormBuilder();
  private readonly api = inject(AutenticacaoService);
  private readonly router = inject(Router);
  
  formError = signal<string | null>(null);
  isSubmitting = signal(false);

  form = this.fb.nonNullable.group({
    login: ['', [Validators.required, Validators.minLength(3)]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    this.formError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    this.api.login(this.form.value.login, this.form.value.senha).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigateByUrl('/inicio');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.formError.set(err?.error?.message ?? 'Não foi possível logar a conta.');
      },
    });
  }
}
