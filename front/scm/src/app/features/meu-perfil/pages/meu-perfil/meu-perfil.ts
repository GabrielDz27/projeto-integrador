import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ButtonComponent } from '../../../../shared/ui/button/button';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { UsuarioForm } from '../../../../shared/components/usuario-form/usuario-form';
import type { DetailUsuarioResponseDTO, UpdateUsuarioDTO, UsuarioEstatisticasDTO, UsuarioPerfilVM, } from '../../../../shared/models/usuario.models';
import { PerfilService } from '../../../../shared/services/perfil-service';
import { LucideAngularModule, Star, Trophy, CalendarDays, MapPin, Lock, TrophyIcon, CalendarIcon, ClockIcon, StarIcon } from 'lucide-angular';
import Swal from 'sweetalert2';
import { UserSessionService } from '../../../../core/auth/user-session.service';
import { AvatarComponent } from "../../../../shared/components/avatar-usuario/avatar-usuario";

type Conquista = {
  key: string;
  titulo: string;
  descricao: string;
  icon: any;
  unlocked: boolean;
};

@Component({
  selector: 'app-meu-perfil',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ModalComponent, UsuarioForm, LucideAngularModule, AvatarComponent],
  templateUrl: './meu-perfil.html',
  styleUrl: './meu-perfil.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeuPerfilComponent implements OnInit {

  readonly session = inject(UserSessionService);

  readonly StarIcon = Star;
  readonly TrophyIcon = Trophy;
  readonly CalendarIcon = CalendarDays;
  readonly MapPinIcon = MapPin;
  readonly LockIcon = Lock;

  private readonly api = inject(PerfilService);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  readonly usuario = signal<DetailUsuarioResponseDTO | null>(null);
  readonly stats = signal<UsuarioEstatisticasDTO | null>(null);

  readonly editOpen = signal(false);
  readonly editLoading = signal(false);
  readonly editError = signal<string | null>(null);
  readonly editInitial = signal<UsuarioPerfilVM | null>(null);
  readonly isSaving = signal(false);

  readonly initials = computed(() => {
    const nome = this.usuario()?.nome ?? '';
    const parts = nome.trim().split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? 'U';
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : '';
    return (a + b).toUpperCase();
  });

  readonly ratingText = computed(() => {
    const v = this.stats()?.avaliacaoMedia ?? 0;
    return v ? v.toFixed(1) : '—';
  });

  readonly presenceText = computed(() => {
    const v = this.stats()?.taxaPresenca;
    return v == null ? '—' : `${Math.round(v)}%`;
  });

  readonly membroDesdeText = computed(() => {
    return 'Desde Janeiro 2024';
  });

  readonly conquistas = computed<Conquista[]>(() => {
    const s = this.stats();
    const jogadas = s?.partidasJogadas ?? 0;
    const criadas = s?.partidasCriadas ?? 0;
    const presenca = s?.taxaPresenca ?? 0;
    const avaliacao = s?.avaliacaoMedia ?? 0;

    return [
      {
        key: 'veterano',
        titulo: 'Veterano',
        descricao: '20+ partidas jogadas',
        icon: TrophyIcon,
        unlocked: jogadas >= 20,
      },
      {
        key: 'organizador',
        titulo: 'Organizador',
        descricao: '10+ partidas criadas',
        icon: CalendarIcon,
        unlocked: criadas >= 10,
      },
      {
        key: 'pontual',
        titulo: 'Pontual',
        descricao: '95%+ presença',
        icon: ClockIcon,
        unlocked: presenca >= 95,
      },
      {
        key: 'bem-avaliado',
        titulo: 'Bem avaliado',
        descricao: '4.5+ de avaliação',
        icon: StarIcon,
        unlocked: avaliacao >= 4.5,
      },
    ];
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.api.listarMeuPerfil().subscribe({
      next: (u) => {
        this.usuario.set(u);
        this.checkDone();
      },
      error: (err) => {
        console.error(err);
        this.error.set('Não foi possível carregar seu perfil.');
        this.isLoading.set(false);
      },
    });

    this.api.estatisticas().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.checkDone();
      },
      error: (err) => {
        console.error(err);
        this.error.set('Não foi possível carregar suas estatísticas.');
        this.isLoading.set(false);
      },
    });
  }

  private checkDone(): void {
    if (this.usuario() && this.stats()) {
      this.isLoading.set(false);
    }
  }

  onEditarPerfil(): void {
    this.editOpen.set(true);
    this.editLoading.set(true);
    this.editError.set(null);

    this.api.listarMeuPerfil().subscribe({
      next: (u) => {
        this.editInitial.set(u);
        this.editLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.editError.set('Não foi possível carregar seus dados.');
        this.editLoading.set(false);
      },
    });
  }


  onCloseEditarPerfil(): void {
    this.editOpen.set(false);
  }

  onSalvarPerfil(dto: UpdateUsuarioDTO): void {
    this.isSaving.set(true);
    this.editError.set(null);

    this.api.atualizarMeuPerfil(dto).subscribe({
      next: () => {
        const atual = this.usuario();
        this.usuario.set({
          ...(atual ?? {}),
          ...dto,
        } as DetailUsuarioResponseDTO);
        this.isSaving.set(false);
        this.editOpen.set(false);

        Swal.fire({
          title: "Perfil editado com sucesso!",
          icon: "success",
          draggable: true
        });
      },
      error: (err) => {
        console.error(err);
        this.editError.set('Não foi possível salvar seu perfil.');
        this.isSaving.set(false);
      },
    });
  }

  onExcluirConta(): void {

    Swal.fire({
      title: "Tem certeza?",
      text: "Você não poderá reverter isso!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sim, exclua!",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading.set(true);
        this.error.set(null);

        this.api.excluirMeuPerfil().subscribe({
          next: () => {
            this.isLoading.set(false);
            Swal.fire({
              title: "Excluído!",
              text: "Sua conta foi excluída.",
              icon: "success"
            });
          },
          error: (err) => {
            console.error(err);
            this.error.set('Não foi possível excluir sua conta.');
            this.isLoading.set(false);
          },
        });

      } else {
        return;
      }
    });
  }
}
