import { Component, inject, signal } from '@angular/core';
import { LayoutAuth } from '../../../../shared/components/layout-auth/layout-auth';
import { ReactiveFormsModule } from '@angular/forms';
import { UsuarioForm } from '../../../../shared/components/usuario-form/usuario-form';
import { Router } from '@angular/router';
import { CreateUsuarioDTO } from '../../../../shared/models/usuario.models';
import type { UpdateUsuarioDTO } from '../../../../shared/models/usuario.models';
import { AutenticacaoService } from '../../../../shared/services/autenticacao-service';
import { NotificationService } from '../../../../shared/services/notification-service';
import { extractApiError } from '../../../../shared/utils/http-error';

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

  onSubmit(dto: CreateUsuarioDTO | UpdateUsuarioDTO) {
    if (!this.isCreateUsuario(dto)) return;

    this.isSubmitting.set(true);

    this.api.cadastrarUsuario(dto).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notifications.success('Cadastro realizado com sucesso.');
        void this.router.navigateByUrl('/inicio');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notifications.error(extractApiError(err, 'Não foi possível criar a conta.'));
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
