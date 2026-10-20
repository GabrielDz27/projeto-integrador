import { Component, inject, signal, ViewChild } from '@angular/core';
import { LayoutAuth } from '../../../../shared/components/layout-auth/layout-auth';
import { ReactiveFormsModule } from '@angular/forms';
import { UsuarioForm } from '../../../../shared/components/usuario-form/usuario-form';
import { Router } from '@angular/router';
import { CreateUsuarioDTO } from '../../../../shared/models/usuario.models';
import type { UpdateUsuarioDTO } from '../../../../shared/models/usuario.models';
import { AutenticacaoService } from '../../../../shared/services/autenticacao-service';
import { NotificationService } from '../../../../shared/services/notification-service';
import { applyApiFieldErrors, describeApiFieldErrors, extractApiError } from '../../../../shared/utils/http-error';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [ LayoutAuth, ReactiveFormsModule, UsuarioForm ],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class Cadastro {

  private readonly router = inject(Router);
  private readonly api = inject(AutenticacaoService);
  private readonly notifications = inject(NotificationService);

  readonly isSubmitting = signal(false);
  readonly apiError = signal<string | null>(null);
  @ViewChild(UsuarioForm) private usuarioForm?: UsuarioForm;

  onSubmit(dto: CreateUsuarioDTO | UpdateUsuarioDTO) {
    if (!this.isCreateUsuario(dto)) return;

    this.apiError.set(null);
    this.isSubmitting.set(true);

    this.api.cadastrarUsuario(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notifications.success('Cadastro realizado com sucesso.');
        void this.router.navigateByUrl('/inicio');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const fieldErrors = this.usuarioForm ? applyApiFieldErrors(this.usuarioForm.form, err) : {};
        const message = describeApiFieldErrors(fieldErrors).join(' ') || extractApiError(err, 'Não foi possível criar a conta.');
        this.apiError.set(message);
        if (!Object.keys(fieldErrors).length) this.notifications.error(message);
      },
    });
  }

  private isCreateUsuario(dto: CreateUsuarioDTO | UpdateUsuarioDTO): dto is CreateUsuarioDTO {
    return typeof dto.nome === 'string'
      && typeof dto.email === 'string'
      && typeof dto.username === 'string'
      && typeof dto.senha === 'string'
      && dto.senha.length > 0;
  }
}
