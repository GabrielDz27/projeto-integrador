import { Component, inject, signal } from '@angular/core';
import { LayoutAuth } from '../../../../shared/components/layout-auth/layout-auth';
import { ReactiveFormsModule } from '@angular/forms';
import { UsuarioForm } from '../../../../shared/components/usuario-form/usuario-form';
import { Router } from '@angular/router';
import { CreateUsuarioDTO } from '../../../../shared/models/usuario.models';
import { AutenticacaoService } from '../../../../shared/services/autenticacao-service';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ LayoutAuth, ReactiveFormsModule, UsuarioForm ],
  templateUrl: './cadastro.html'
})
export class Cadastro {

  private readonly router = inject(Router);
  private readonly api = inject(AutenticacaoService);

  readonly isSubmitting = signal(false);
  readonly apiError = signal<string | null>(null);

  onSubmit(dto: CreateUsuarioDTO) {
    this.apiError.set(null);
    this.isSubmitting.set(true);

    this.api.cadastrarUsuario(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        void this.router.navigateByUrl('/inicio');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.apiError.set(err?.error?.message ?? 'Não foi possível criar a conta.');
      },
    });
  }
}
