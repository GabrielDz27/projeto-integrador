import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, map, of, tap } from 'rxjs';
import { PerfilService } from '../../shared/services/perfil-service';
import { UsuarioPerfilVM } from '../../shared/models/usuario.models';

@Injectable({ providedIn: 'root' })
export class UserSessionService {
  private readonly perfilApi = inject(PerfilService);

  readonly perfil = signal<UsuarioPerfilVM | null>(null);
  readonly isLoadingPerfil = signal(false);

  readonly userName = computed(() => this.perfil()?.nome ?? '—');

  readonly userInitials = computed(() => {
    const nome = (this.perfil()?.nome ?? '').trim();
    if (!nome) return '--';

    const parts = nome.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const last = (parts.length > 1 ? parts[parts.length - 1]?.[0] : parts[0]?.[1]) ?? '';
    return (first + last).toUpperCase();
  });


  readonly user = computed(() => this.perfil()?.avatarUrl ? this.perfil() : null);

  ensurePerfil() {
    this.isLoadingPerfil.set(true);

    return this.perfilApi.listarMeuPerfil().pipe(
      tap((p: UsuarioPerfilVM) => this.perfil.set(p)),
      map(() => true),
      catchError(() => {
        this.isLoadingPerfil.set(false);
        return of(false);
      }),
      tap(() => this.isLoadingPerfil.set(false))
    );
  }

  resetSession(): void {
    this.perfil.set(null);
    this.isLoadingPerfil.set(false);
  }
}
