import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { NotificationService } from '../../../../shared/services/notification-service';
import { trimmedRequired } from '../../../../shared/utils/form-validators';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';

interface Obrigacao { id: string; competencia: string; vencimento: string; valor: number; status: 'PAGO' | 'PENDENTE'; dataPagamento?: string; }
interface CalendarDay { date: Date; inMonth: boolean; entries: Obrigacao[]; }

@Component({
  selector: 'app-obrigacao-lista',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, ModalComponent, PaginationComponent],
  template: `
    <section class="page">
      <header class="page-header"><div><p class="eyebrow">Obrigações fiscais</p><h1>Calendário de obrigações</h1><p>Organize vencimentos e pagamentos das guias DAS.</p></div><button type="button" (click)="novo()">Adicionar obrigação</button></header>
      <section class="calendar panel">
        <div class="calendar-heading"><button class="month-nav" type="button" (click)="mudarMes(-1)" aria-label="Mês anterior">‹</button><h2>{{ tituloMes() }}</h2><button class="month-nav" type="button" (click)="mudarMes(1)" aria-label="Próximo mês">›</button></div>
        <div class="calendar-grid calendar-weekdays">@for (dia of diasSemana; track dia) { <span>{{ dia }}</span> }</div>
        <div class="calendar-grid calendar-days">@for (day of calendario(); track day.date.toISOString()) {
          <div class="calendar-day" [class.outside-month]="!day.inMonth" [class.today]="eHoje(day.date)"><span class="day-number">{{ day.date.getDate() }}</span>
            @for (item of day.entries; track item.id) { <button type="button" class="calendar-entry" [class.entry-paid]="item.status === 'PAGO'" (click)="editar(item)" [title]="item.competencia + ' · ' + (item.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR')">DAS · {{ item.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</button> }
          </div>
        }</div>
      </section>
      <section class="list-section"><div class="section-heading"><h2>Guias cadastradas</h2><span>{{ totalRegistros() }} registros</span></div>
        <label class="search-filter">Filtrar por competência<input type="month" [value]="filtroCompetencia" (input)="filtrarCompetencia($any($event.target).value)"></label>
        <div class="panel table-wrap"><table><thead><tr><th>Competência</th><th>Vencimento</th><th>Valor</th><th>Status</th><th>Ações</th></tr></thead><tbody>
          @for (item of obrigacoesOrdenadas(); track item.id) {<tr><td>{{ item.competencia }}</td><td>{{ item.vencimento | date:'dd/MM/yyyy' }}</td><td>{{ item.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</td><td><span class="status" [class.status-paid]="item.status === 'PAGO'" [class.status-overdue]="estaVencida(item)">{{ statusLabel(item) }}</span></td><td class="actions"><button class="secondary" type="button" (click)="editar(item)">Editar</button><button class="danger" type="button" (click)="excluir(item)">Excluir</button></td></tr>}
          @empty {<tr><td class="empty" colspan="5">{{ carregando() ? 'Carregando obrigações...' : 'Nenhuma guia cadastrada.' }}</td></tr>}
        </tbody></table><app-pagination [page]="pagina()" [size]="tamanhoPagina" [total]="totalRegistros()" (pageChange)="mudarPagina($event)"></app-pagination></div>
      </section>
    </section>
    <app-modal [open]="modalOpen()" (openChange)="modalOpen.set($event)" [title]="editando() ? 'Editar obrigação' : 'Adicionar obrigação'" description="Registre os dados da guia DAS." [primaryLabel]="salvando() ? 'Salvando...' : 'Salvar guia'" [primaryDisabled]="form.invalid || salvando()" (primary)="salvar()" (secondary)="modalOpen.set(false)">
      <form class="obligation-form" [formGroup]="form" (ngSubmit)="salvar()">
        <div class="form-row"><label>Competência *<input type="month" formControlName="competencia" [class.input-invalid]="form.controls.competencia.touched && form.controls.competencia.invalid"></label><label>Vencimento *<input type="date" formControlName="vencimento" [class.input-invalid]="form.controls.vencimento.touched && form.controls.vencimento.invalid"></label></div>
        <div class="form-row"><label>Valor total (R$) *<input type="number" formControlName="valor" min="0" step="0.01" inputmode="decimal" [class.input-invalid]="form.controls.valor.touched && form.controls.valor.invalid"></label><label>Status<select formControlName="status" [class.input-invalid]="form.controls.status.touched && form.controls.status.invalid"><option value="PENDENTE">Pendente</option><option value="PAGO">Pago</option></select></label></div>
      </form>
    </app-modal>
  `,
  styles: [`:host{display:block;padding:32px}.page{max-width:1180px;margin:auto}.page-header{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:22px}.eyebrow{margin-bottom:5px;color:var(--primary-color);font-size:.72rem;font-weight:800;text-transform:uppercase}.page-header h1{margin:0;color:var(--text-color);font-size:1.8rem}.page-header p:last-child{margin-top:6px;color:var(--text-muted)}button{border:0;border-radius:var(--radius-sm);background:var(--primary-color);color:#fff;padding:9px 12px;font-weight:650;cursor:pointer}button:hover{background:var(--primary-hover)}button:focus-visible{outline:3px solid rgb(29 78 216 / 28%);outline-offset:2px}.page-header>button{padding:11px 15px}.panel{border:1px solid var(--border-color);border-radius:var(--radius-md);background:#fff;box-shadow:var(--shadow-sm)}.calendar{padding:18px;margin-bottom:28px}.calendar-heading{display:flex;align-items:center;justify-content:center;gap:18px;margin-bottom:16px}.calendar-heading h2{min-width:190px;text-align:center;text-transform:capitalize;font-size:1.1rem}.month-nav{width:36px;height:36px;padding:0;background:var(--surface-muted);color:var(--text-color);font-size:1.4rem}.calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr))}.calendar-weekdays span{padding:9px 5px;text-align:center;color:var(--text-muted);font-size:.72rem;font-weight:700;text-transform:uppercase}.calendar-day{display:flex;min-height:100px;flex-direction:column;gap:5px;padding:8px;border-top:1px solid var(--border-color);border-right:1px solid var(--border-color);background:#fff}.calendar-day:nth-child(7n){border-right:0}.outside-month{background:var(--surface-muted);color:#94a3b8}.today .day-number{display:grid;width:26px;height:26px;place-items:center;border-radius:50%;background:var(--primary-color);color:#fff}.day-number{width:26px;height:26px;font-size:.82rem}.calendar-entry{overflow:hidden;padding:4px 6px;border-radius:4px;background:#fef3c7;color:#92400e;text-align:left;text-overflow:ellipsis;white-space:nowrap;font-size:.67rem}.entry-paid{background:#dcfce7;color:#166534}.list-section{margin-top:24px}.section-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.section-heading h2{font-size:1.1rem}.section-heading span{color:var(--text-muted);font-size:.82rem}.search-filter{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 0 12px;padding:12px 14px;border:1px solid var(--border-color);border-radius:var(--radius-md);background:#fff;color:var(--text-color);font-size:.84rem;font-weight:650}.search-filter input{min-width:180px;padding:8px 10px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:#fff;color:var(--text-color)}.search-filter input:focus{border-color:var(--primary-color);outline:0;box-shadow:0 0 0 3px rgb(29 78 216 / 12%)}.table-wrap{overflow:auto;padding:8px 14px}table{width:100%;border-collapse:collapse}th,td{padding:12px 9px;border-bottom:1px solid var(--border-color);text-align:left;white-space:nowrap}tbody tr:last-child td{border-bottom:0}th{color:var(--text-muted);font-size:.7rem;text-transform:uppercase}.status{color:var(--warning-color);font-size:.78rem;font-weight:700}.status-paid{color:var(--success-color)}.status-overdue{color:var(--danger-color)}.actions{white-space:nowrap}.actions button+button{margin-left:6px}.actions button{padding:7px 10px;font-size:.75rem}.secondary{background:var(--surface-muted);color:var(--text-color)}.danger{background:#fee2e2;color:var(--danger-color)}.empty{text-align:center;color:var(--text-muted);padding:28px}.obligation-form{display:grid;gap:14px}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.obligation-form label{display:grid;gap:6px;color:var(--text-color);font-size:.84rem;font-weight:650}.obligation-form input,.obligation-form select{width:100%;min-width:0;padding:10px 11px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:#fff;color:var(--text-color)}.obligation-form .input-invalid{border-color:#dc2626}@media(max-width:700px){:host{padding:20px 16px}.page-header{align-items:stretch;flex-direction:column}.calendar{padding:8px}.calendar-day{min-height:72px;padding:4px}.calendar-entry{font-size:0}.calendar-entry::after{content:'DAS';font-size:.6rem}.calendar-weekdays span{font-size:.58rem}.form-row{grid-template-columns:1fr}.search-filter{align-items:stretch;flex-direction:column}.search-filter input{width:100%}}`]
})
export class ObrigacaoListaComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/obrigacoes`;
  readonly obrigacoes = signal<Obrigacao[]>([]);
  readonly pagina = signal(0);
  readonly totalRegistros = signal(0);
  readonly tamanhoPagina = 10;
  filtroCompetencia = '';
  readonly carregando = signal(false);
  readonly modalOpen = signal(false);
  readonly editando = signal(false);
  readonly salvando = signal(false);
  readonly diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  readonly mesVisivel = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  private editingId: string | null = null;
  readonly form = this.fb.nonNullable.group({ competencia: ['', [trimmedRequired, Validators.pattern(/^\d{4}-(0[1-9]|1[0-2])$/)]], vencimento: ['', trimmedRequired], valor: [0, [Validators.required, Validators.min(0)]], status: ['PENDENTE' as 'PAGO' | 'PENDENTE', trimmedRequired] });
  readonly tituloMes = computed(() => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(this.mesVisivel()));
  readonly calendario = computed<CalendarDay[]>(() => {
    const first = this.mesVisivel();
    const start = new Date(first.getFullYear(), first.getMonth(), 1);
    const mondayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);
      const key = this.dateKey(date);
      return { date, inMonth: date.getMonth() === first.getMonth(), entries: this.obrigacoes().filter(item => item.vencimento === key) };
    });
  });
  readonly obrigacoesOrdenadas = computed(() => [...this.obrigacoes()].sort((a, b) => a.vencimento.localeCompare(b.vencimento)));

  ngOnInit(): void { this.carregar(); }
  filtrarCompetencia(competencia: string): void {
    this.filtroCompetencia = competencia;
    this.pagina.set(0);
    this.carregar();
  }
  mudarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.carregar();
  }
  mudarMes(delta: number): void { const current = this.mesVisivel(); this.mesVisivel.set(new Date(current.getFullYear(), current.getMonth() + delta, 1)); }
  eHoje(date: Date): boolean { return this.dateKey(date) === this.dateKey(new Date()); }
  estaVencida(item: Obrigacao): boolean { return item.status !== 'PAGO' && item.vencimento < this.dateKey(new Date()); }
  statusLabel(item: Obrigacao): string { return this.estaVencida(item) ? 'Vencida' : item.status === 'PAGO' ? 'Paga' : 'Pendente'; }
  novo(): void {
    this.editingId = null;
    this.editando.set(false);
    const today = new Date();
    const dueDate = new Date(today.getFullYear(), today.getMonth() + 1, 20);
    this.form.reset({ competencia: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`, vencimento: this.dateKey(dueDate), valor: 0, status: 'PENDENTE' });
    this.modalOpen.set(true);
  }
  editar(item: Obrigacao): void { this.editingId = item.id; this.editando.set(true); this.form.reset({ competencia: item.competencia, vencimento: item.vencimento, valor: item.valor, status: item.status }); this.modalOpen.set(true); }
  salvar(): void {
    if (this.form.invalid || this.salvando()) { this.form.markAllAsTouched(); return; }
    this.salvando.set(true);
    const editing = !!this.editingId;
    const request = this.editingId ? this.http.put(`${this.apiUrl}/${this.editingId}`, this.form.getRawValue()) : this.http.post(this.apiUrl, this.form.getRawValue());
    request.subscribe({ next: () => { this.salvando.set(false); this.modalOpen.set(false); this.carregar(); this.notifications.success(editing ? 'Guia DAS atualizada.' : 'Guia DAS cadastrada.'); }, error: () => this.salvando.set(false) });
  }
  excluir(item: Obrigacao): void { if (!confirm(`Excluir a guia ${item.competencia}?`)) return; this.http.delete(`${this.apiUrl}/${item.id}`).subscribe(() => { this.carregar(); this.notifications.success('Guia DAS excluída.'); }); }
  private carregar(): void {
    this.carregando.set(true);
    const params: Record<string, string | number> = {
      page: this.pagina(),
      size: this.tamanhoPagina,
      sort: 'vencimento,asc',
    };
    if (this.filtroCompetencia) params['competencia'] = this.filtroCompetencia;

    this.http.get<{ content: Obrigacao[]; totalElements: number }>(this.apiUrl, { params }).subscribe({
      next: response => {
        this.obrigacoes.set(response.content ?? []);
        this.totalRegistros.set(response.totalElements ?? 0);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false),
    });
  }
  private dateKey(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
}
