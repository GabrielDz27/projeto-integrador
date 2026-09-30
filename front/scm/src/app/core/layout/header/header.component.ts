import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserSessionService } from '../../auth/user-session.service';
import { UsuarioService } from '../../../shared/services/usuario-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  readonly session = inject(UserSessionService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);
  readonly userMenuOpen = signal(false);
  readonly avatarFailed = signal(false);

  constructor() {
    this.session.ensurePerfil().subscribe(() => this.avatarFailed.set(false));
  }

  toggleUserMenu(): void { this.userMenuOpen.update((open) => !open); }
  closeUserMenu(): void { this.userMenuOpen.set(false); }
  onAvatarError(): void { this.avatarFailed.set(true); }

  onLogout(): void {
    this.usuarioService.logout();
    this.session.resetSession();
    this.closeUserMenu();
    void this.router.navigate(['/login']);
  }
}
