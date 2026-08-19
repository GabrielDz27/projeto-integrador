import {Component, ElementRef, HostListener, ViewChild, inject, signal} from '@angular/core';
import { ButtonComponent } from "../../../shared/ui/button/button";
import { Router, RouterModule } from '@angular/router';
import { LucideAngularModule, Home, Mails, ClipboardList, BadgeCheck } from 'lucide-angular';
import {UserSessionService} from '../../auth/user-session.service';
import {PartidaModalComponent} from '../../../shared/components/partida-modal/partida-modal.component';
import { UsuarioService } from '../../../shared/services/usuario-service';
import { AvatarComponent } from "../../../shared/components/avatar-usuario/avatar-usuario";

@Component({
  selector: 'app-header',
  imports: [ButtonComponent, RouterModule, LucideAngularModule, PartidaModalComponent, AvatarComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  readonly session = inject(UserSessionService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly router = inject(Router);

  readonly HomeIcon = Home;
  readonly MailsIcon = Mails;
  readonly ClipBoardIcon = ClipboardList;
  readonly BadgeCheck = BadgeCheck;

  readonly createOpen = signal(false);
  readonly toast = signal<string | null>(null);
  readonly userMenuOpen = signal(false);

  @ViewChild('userMenu') userMenu?: ElementRef<HTMLElement>;

  private showToast(msg: string) {
    this.toast.set(msg);
    window.setTimeout(() => this.toast.set(null), 5000);
  }

  constructor() {
    this.session.ensurePerfil().subscribe();
  }

  aoCriarPartida(): void {
    this.createOpen.set(true);
  }

  onSaved(): void {
    this.showToast('Partida criada com sucesso!');
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.userMenuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.userMenuOpen()) return;

    const target = event.target as Node | null;
    if (!target) return;

    if (this.userMenu?.nativeElement && !this.userMenu.nativeElement.contains(target)) {
      this.userMenuOpen.set(false);
    }
  }

  onLogout(): void {
    this.usuarioService.logout();
    this.session.resetSession();
    this.userMenuOpen.set(false);
    this.router.navigate(['/login']);
  }
}
