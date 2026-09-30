import { Component, OnInit, inject, signal } from '@angular/core';
import { UsuarioForm } from '../../../../shared/components/usuario-form/usuario-form';
import type { UpdateUsuarioDTO, UsuarioPerfilVM } from '../../../../shared/models/usuario.models';
import { NotificationService } from '../../../../shared/services/notification-service';
import { PerfilService } from '../../../../shared/services/perfil-service';
import { UserSessionService } from '../../../../core/auth/user-session.service';

@Component({
  selector: 'app-minha-conta',
  standalone: true,
  imports: [UsuarioForm],
  template: `
    <section class="account-page">
      <header><p class="eyebrow">Conta</p><h1>Minha conta</h1><p>Atualize seus dados de acesso e contato.</p></header>
      @if (loading()) {
        <p class="state">Carregando seus dados...</p>
      } @else if (initialValue()) {
        <div class="form-panel">
          <app-usuario-form modo="editar" [initialValue]="initialValue()" [submitting]="saving()" (submitForm)="salvar($event)"></app-usuario-form>
        </div>
      }
    </section>
  `,
  styles: [`:host{display:block}.account-page{max-width:820px;margin:0 auto;padding:32px}.account-page header{margin-bottom:20px}.eyebrow{margin-bottom:5px;color:var(--primary-color);font-size:.72rem;font-weight:800;text-transform:uppercase}.account-page h1{color:var(--text-color);font-size:1.8rem}.account-page header>p:last-child,.state{margin-top:6px;color:var(--text-muted)}.form-panel{padding:22px;border:1px solid var(--border-color);border-radius:var(--radius-md);background:var(--surface-color);box-shadow:var(--shadow-sm)}@media(max-width:600px){.account-page{padding:20px 16px}.form-panel{padding:16px}}`]
})
export class MinhaContaComponent implements OnInit {
  private readonly perfilApi = inject(PerfilService);
  private readonly session = inject(UserSessionService);
  private readonly notifications = inject(NotificationService);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly initialValue = signal<UsuarioPerfilVM | null>(null);

  ngOnInit(): void {
    this.perfilApi.listarMeuPerfil().subscribe({
      next: perfil => { this.initialValue.set(perfil); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  salvar(dto: UpdateUsuarioDTO | object): void {
    if (!dto || typeof dto !== 'object' || !('nome' in dto)) return;
    this.saving.set(true);
    this.perfilApi.atualizarMeuPerfil(dto as UpdateUsuarioDTO).subscribe({
      next: perfil => {
        this.initialValue.set(perfil);
        this.session.ensurePerfil().subscribe();
        this.saving.set(false);
        this.notifications.success('Dados da conta atualizados.');
      },
      error: () => this.saving.set(false),
    });
  }
}