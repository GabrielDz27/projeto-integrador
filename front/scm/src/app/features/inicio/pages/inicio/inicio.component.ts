import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Flame, Search, SlidersHorizontal, Trophy, CalendarDays, Star, TrendingUp } from 'lucide-angular';

import { ButtonComponent } from '../../../../shared/ui/button/button';
import { PartidasCardComponent } from '../../../../shared/components/partidas-card/partidas-card.component';
import { InsightsUsuarioCardComponent } from '../../../../shared/components/insights-usuario-card/insights-usuario-card.component';

import type {PartidaDetailVM, PartidaResumoVM, StatusPartida} from '../../../../shared/models/partida.models';
import { PartidaService } from '../../../../shared/services/partida-service';
import {PartidaModalComponent} from '../../../../shared/components/partida-modal/partida-modal.component';
import {UserSessionService} from '../../../../core/auth/user-session.service';
import {SolicitacaoModalComponent} from '../../../../shared/components/solicitacao-modal/solicitacao.modal.component';
import { PerfilService } from '../../../../shared/services/perfil-service';
import type { UsuarioEstatisticasDTO } from '../../../../shared/models/usuario.models';
import {
  PartidaDetalhesModalComponent
} from '../../../../shared/components/detalhes-partida-modal/partida-detalhes-modal.component';
import { AlertService } from '../../../../shared/ui/alert/alert.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    PartidasCardComponent,
    InsightsUsuarioCardComponent,
    LucideAngularModule,
    PartidaModalComponent,
    SolicitacaoModalComponent,
    PartidaDetalhesModalComponent,
  ],
  templateUrl: './inicio.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InicioComponent implements OnInit {
  private readonly partidaApi = inject(PartidaService);
  private readonly perfilApi = inject(PerfilService);
  private readonly alert = inject(AlertService);
  readonly session = inject(UserSessionService);

  readonly detalhesOpen = signal(false);
  readonly detalhes = signal<PartidaDetailVM | null>(null);
  readonly detalhesLoading = signal(false);

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  // Dados
  readonly partidas = signal<PartidaResumoVM[]>([]);
  readonly stats = signal<UsuarioEstatisticasDTO | null>(null);

  readonly createOpen = signal(false);

  // Ícones template
  readonly PlusIcon = Plus;
  readonly FlameIcon = Flame;
  readonly SearchIcon = Search;
  readonly FilterIcon = SlidersHorizontal;
  readonly TrophyIcon = Trophy;
  readonly CalendarIcon = CalendarDays;
  readonly StarIcon = Star;
  readonly TrendIcon = TrendingUp;

  // Filtros (UI)
  readonly pesquisar = signal('');
  readonly filtroEsportes = signal<string>('Todos');
  readonly filtroStatus = signal<StatusPartida | 'Todos'>('Todos');

  readonly solicitacaoOpen = signal(false);
  readonly solicitacaoPartidaId = signal<number | null>(null);

  readonly statusOptions: Array<StatusPartida | 'Todos'> = ['Todos', 'ABERTA', 'LOTADA', 'CONCLUIDA', 'CANCELADA'];

  readonly sportOptions = computed(() => {
    const unique = Array.from(new Set(this.partidas().map(p => p.nome_esporte).filter(Boolean)));
    return ['Todos', ...unique];
  });

  // Lista filtrada
  readonly filtered = computed(() => {
    const q = this.pesquisar().trim().toLowerCase();
    const esporte = this.filtroEsportes();
    const status = this.filtroStatus();

    return this.partidas().filter(p => {
      const matchesSearch =
        !q ||
        p.titulo.toLowerCase().includes(q) ||
        (p.nome_local ?? '').toLowerCase().includes(q) ||
        (p.cidade ?? '').toLowerCase().includes(q);

      const matchesSport = esporte === 'Todos' || p.nome_esporte === esporte;
      const matchesStatus = status === 'Todos' || p.status_partida === status;

      return matchesSearch && matchesSport && matchesStatus;
    });
  });

  readonly partidasAbertas = computed(() => this.filtered().filter(p => p.status_partida === 'ABERTA'));
  readonly outrasPartidas = computed(() => this.filtered().filter(p => p.status_partida !== 'ABERTA'));

  readonly ratingText = computed(() => {
    const v = this.stats()?.avaliacaoMedia ?? 0;
    return v ? v.toFixed(1) : '—';
  });

  readonly presenceText = computed(() => {
    const v = this.stats()?.taxaPresenca;
    return v == null ? '—' : `${Math.round(v)}%`;
  });

  readonly ratingHint = computed(() => {
    const v = this.stats()?.avaliacaoMedia;
    if (v == null) return undefined;
    if (v >= 4.5) return 'Excelente!';
    if (v >= 3.5) return 'Boa!';
    return 'Pode melhorar';
  });

  readonly presenceHint = computed(() => {
    const v = this.stats()?.taxaPresenca;
    if (v == null) return undefined;
    if (v >= 95) return 'Excelente!';
    if (v >= 80) return 'Muito bom!';
    return 'Pode melhorar';
  });

  ngOnInit(): void {
    this.loadFromApi();
    this.loadStats();
    this.session.ensurePerfil().subscribe();
  }

  loadFromApi(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.partidaApi.listar(0, 50).subscribe({
      next: (res) => {
        console.log(res);
        this.partidas.set(res.content ?? []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Não foi possível carregar as partidas.');
        this.isLoading.set(false);
      },
    });
  }

  aoVerDetalhes(id: number) {
    this.detalhesLoading.set(true);
    this.detalhesOpen.set(true);

    this.partidaApi.detalhar(id).subscribe({
      next: (p) => {
        this.detalhes.set(p);
        this.detalhesLoading.set(false);
      },
      error: (err) => {
        this.detalhesLoading.set(false);
        this.detalhesOpen.set(false);
        this.alert.modal('error','Não foi possível carregar os detalhes da partida.');
      },
    });
  }

  onDetalhesOpenChange(open: boolean): void {
    this.detalhesOpen.set(open);
    if (!open) {
      this.detalhes.set(null);
    }
  }

  loadStats(): void {
    this.perfilApi.estatisticas().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  limparFiltros(): void {
    this.pesquisar.set('');
    this.filtroEsportes.set('Todos');
    this.filtroStatus.set('Todos');
  }

  aoCriarPartida(): void {
    this.createOpen.set(true);
  }

  aoSolicitarParticipacao(partidaId: number) {
    this.solicitacaoPartidaId.set(partidaId);
    this.solicitacaoOpen.set(true);
  }

  onSolicitacaoSaved() {
    this.solicitacaoOpen.set(false);
  }

  onSaved(): void {
    this.loadFromApi();
  }
}
