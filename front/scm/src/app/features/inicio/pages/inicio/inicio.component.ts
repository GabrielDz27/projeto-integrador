import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { NotificationService } from '../../../../shared/services/notification-service';
import { MeiSelectorComponent, MeiOption } from '../../../../shared/components/mei-selector/mei-selector.component';

interface ResumoFinanceiro {
  recebidoNoMes: number;
  pendenteRecebimento: number;
  faturamentoAnual: number;
  limiteAnualMei: number;
  totalClientes: number;
  totalFornecedores: number;
  guiaDas: { competencia: string; vencimento: string; valor: number; status: 'PENDENTE' | 'PAGO' } | null;
}
interface ClienteOption extends MeiOption { ativo?: boolean; }
interface SerieMensal {
  competencia: string;
  faturamento: number;
  recebido: number;
  pendente: number;
  guiasPagas: number;
  guiasPendentes: number;
  guiasVencidas: number;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, ReactiveFormsModule, MeiSelectorComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
})
export class InicioComponent {
  readonly math = Math;
  private readonly http = inject(HttpClient);
  private readonly notifications = inject(NotificationService);
  readonly clientes = signal<ClienteOption[]>([]);
  readonly clienteId = signal('');
  readonly serie = signal<SerieMensal[]>([]);
  readonly carregandoClientes = signal(true);
  readonly carregandoSerie = signal(false);
  readonly erroSerie = signal('');
  readonly resumo = signal<ResumoFinanceiro>({
    recebidoNoMes: 0,
    pendenteRecebimento: 0,
    faturamentoAnual: 0,
    limiteAnualMei: 81000,
    totalClientes: 0,
    totalFornecedores: 0,
    guiaDas: null,
  });
  readonly carregando = signal(true);

  readonly percentualLimite = computed(() => {
    const { faturamentoAnual, limiteAnualMei } = this.resumo();
    return limiteAnualMei > 0 ? Math.min(100, Math.round((faturamentoAnual / limiteAnualMei) * 100)) : 0;
  });

  readonly limiteEmAlerta = computed(() => this.percentualLimite() >= 80);
  readonly maxMovimentoMensal = computed(() => Math.max(1, ...this.serie().flatMap(mes => [mes.recebido, mes.pendente])));
  readonly mesesGrafico = computed(() => this.serie().map(mes => ({
    ...mes,
    rotulo: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(new Date(Number(mes.competencia.slice(0, 4)), Number(mes.competencia.slice(5, 7)) - 1, 1)).replace('.', ''),
    recebidoPct: Math.round(mes.recebido / this.maxMovimentoMensal() * 100),
    pendentePct: Math.round(mes.pendente / this.maxMovimentoMensal() * 100),
  })));
  readonly mesesLimite = computed(() => {
    let acumulado = 0;
    return this.serie().map(mes => {
      const ano = mes.competencia.slice(0, 4);
      acumulado = mes.competencia.endsWith('-01') ? mes.faturamento : acumulado + mes.faturamento;
      const escala = Math.max(this.resumo().limiteAnualMei, acumulado, 1);
      return { competencia: mes.competencia, ano, acumulado, faturamentoPct: Math.min(100, acumulado / escala * 100), tetoPct: Math.min(100, this.resumo().limiteAnualMei / escala * 100) };
    });
  });
  readonly moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  constructor() {
    this.http.get<{ content: ClienteOption[] }>(`${environment.apiUrl}/api/v1/clientes`, { params: { page: 0, size: 100, sort: 'nome,asc', ativo: true } }).subscribe({
      next: response => { this.clientes.set((response.content ?? []).filter(cliente => cliente.ativo !== false)); this.carregandoClientes.set(false); },
      error: () => { this.carregandoClientes.set(false); this.notifications.error('Não foi possível carregar a carteira de clientes.'); },
    });
  }

  selecionarCliente(selected: string): void {
    this.clienteId.set(selected);
    this.serie.set([]);
    this.erroSerie.set('');
    if (!selected) return;
    const params = { clienteId: selected };
    this.carregando.set(true);
    this.carregandoSerie.set(true);
    this.http.get<ResumoFinanceiro>(`${environment.apiUrl}/api/v1/dashboard/resumo`, { params }).subscribe({
      next: resumo => { this.resumo.set(resumo); this.carregando.set(false); },
      error: () => { this.carregando.set(false); this.notifications.error('Não foi possível carregar o resumo deste MEI.'); },
    });
    this.http.get<SerieMensal[]>(`${environment.apiUrl}/api/v1/dashboard/serie-mensal`, { params }).subscribe({
      next: serie => { this.serie.set(serie ?? []); this.carregandoSerie.set(false); },
      error: error => {
        this.carregandoSerie.set(false);
        this.erroSerie.set(error instanceof HttpErrorResponse && error.status === 404
          ? 'O backend em execução não disponibiliza as séries mensais. Reinicie a API SCM para aplicar a versão atualizada.'
          : 'Não foi possível carregar as séries deste MEI. Verifique a conexão e tente novamente.');
      },
    });
  }

  statusGuia(): string {
    const guia = this.resumo().guiaDas;
    if (!guia) return 'Sem guia cadastrada';
    if (guia.status === 'PAGO') return 'Paga';
    return guia.vencimento < new Date().toISOString().slice(0, 10) ? 'Vencida' : 'Pendente';
  }

  rotuloGuias(mes: SerieMensal): string {
    return `${mes.competencia}: ${mes.guiasPagas} pagas, ${mes.guiasPendentes} pendentes, ${mes.guiasVencidas} vencidas`;
  }
}
