import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';

interface ResumoFinanceiro {
  recebidoNoMes: number;
  pendenteRecebimento: number;
  faturamentoAnual: number;
  limiteAnualMei: number;
  totalClientes: number;
  totalFornecedores: number;
  guiaDas: { competencia: string; vencimento: string; valor: number; status: 'PENDENTE' | 'PAGO' } | null;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
})
export class InicioComponent {
  private readonly http = inject(HttpClient);
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
  readonly moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  constructor() {
    this.http.get<ResumoFinanceiro>(`${environment.apiUrl}/api/v1/dashboard/resumo`).subscribe({
      next: resumo => { this.resumo.set(resumo); this.carregando.set(false); },
      error: () => this.carregando.set(false),
    });
  }

  statusGuia(): string {
    const guia = this.resumo().guiaDas;
    if (!guia) return 'Sem guia cadastrada';
    if (guia.status === 'PAGO') return 'Paga';
    return guia.vencimento < new Date().toISOString().slice(0, 10) ? 'Vencida' : 'Pendente';
  }
}
