  styles: [`:host{display:block;padding:32px}.page{max-width:1200px;margin:auto}.page-header{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:22px}.eyebrow{margin-bottom:5px;color:var(--primary-color);font-size:.72rem;font-weight:800;text-transform:uppercase}.page-header h1{margin:0;color:var(--text-color);font-size:1.8rem}.page-header p:last-child{margin-top:6px;color:var(--text-muted)}button{border:0;border-radius:var(--radius-sm);background:var(--primary-color);color:#fff;padding:9px 12px;font-weight:650;cursor:pointer}button:hover:not(:disabled){background:var(--primary-hover)}button:focus-visible{outline:3px solid rgb(29 78 216 / 28%);outline-offset:2px}button:disabled{opacity:.5;cursor:not-allowed}.page-header button{padding:11px 15px}.table-wrap{overflow:auto;border:1px solid var(--border-color);border-radius:var(--radius-md);background:#fff;box-shadow:var(--shadow-sm)}table{width:100%;border-collapse:collapse}th,td{padding:13px 11px;border-bottom:1px solid var(--border-color);text-align:left;white-space:nowrap}tbody tr:last-child td{border-bottom:0}th{color:var(--text-muted);font-size:.7rem;text-transform:uppercase}.status{color:var(--warning-color);font-size:.78rem;font-weight:700}.status-paid{color:var(--success-color)}.actions{white-space:nowrap}.actions button+button{margin-left:6px}.actions button{padding:7px 10px;font-size:.75rem}.secondary{background:var(--surface-muted);color:var(--text-color)}.danger{background:#fee2e2;color:var(--danger-color)}.empty{text-align:center;color:var(--text-muted);padding:30px}.entry-form{display:grid;gap:14px}.entry-form label{display:grid;gap:6px;color:var(--text-color);font-size:.84rem;font-weight:650}.entry-form input:not([type=checkbox]),.entry-form select{width:100%;min-width:0;padding:10px 11px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:#fff;color:var(--text-color)}.entry-form input:focus,.entry-form select:focus{border-color:var(--primary-color);outline:0;box-shadow:0 0 0 3px rgb(29 78 216 / 12%)}.entry-form .form-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.entry-form .check{display:flex;align-items:center;gap:8px}.entry-form .check input{width:16px;height:16px}.input-invalid{border-color:var(--danger-color)!important}.header-actions{display:flex;flex:0 0 auto;align-items:end;gap:10px}.header-actions app-mei-selector{display:block;flex:0 1 220px;min-width:220px}.header-actions .client-filter{min-width:0}.empty-selection{padding:20px;color:var(--text-muted)}@media(max-width:760px){:host{padding:20px 16px}.page-header{align-items:stretch;flex-direction:column}.header-actions{align-items:stretch;flex-direction:column}.header-actions app-mei-selector{flex-basis:auto;min-width:0}.entry-form .form-row{grid-template-columns:1fr}}`]
import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { NotificationService } from '../../../../shared/services/notification-service';
import { trimmedRequired } from '../../../../shared/utils/form-validators';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { applyApiFieldErrors, describeApiFieldErrors } from '../../../../shared/utils/http-error';
import { FilterToolbarComponent, FilterToolbarChange, FilterToolbarField } from '../../../../shared/components/filter-toolbar/filter-toolbar.component';
import { MeiSelectorComponent } from '../../../../shared/components/mei-selector/mei-selector.component';

interface Lancamento { id: string; descricao: string; idCliente: string; valor: number; dataCompetencia: string; statusRecebimento: 'PAGO' | 'PENDENTE'; notaFiscalEmitida: boolean; }
interface ClienteOption { id: string; nome: string; cpf?: string; email?: string; ativo?: boolean; }

@Component({
  selector: 'app-lancamento-lista',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, ModalComponent, PaginationComponent, FilterToolbarComponent, MeiSelectorComponent],
  template: `
    <section class="page">
        <header class="page-header"><div><p class="eyebrow">Receitas</p><h1>Faturamento e lançamentos</h1><p>Registre serviços, valores recebidos e emissão de nota fiscal.</p></div><div class="header-actions"><app-mei-selector [options]="clientes()" [selectedId]="clienteSelecionado()" (selectionChange)="selecionarCliente($event)"></app-mei-selector><button type="button" (click)="novo()" [disabled]="!clienteSelecionado()">Novo lançamento</button></div></header>
      @if (!clienteSelecionado()) { <div class="empty-selection">Selecione um cliente/MEI para consultar ou registrar faturamento.</div> }
      @if (clienteSelecionado()) {
      <app-filter-toolbar ariaLabel="Filtros de lançamentos" [fields]="toolbarFields" [values]="filtrosAtuais()" [showExport]="false" (filterChange)="alterarFiltro($event)" (clear)="limparFiltros()"></app-filter-toolbar>
      <div class="panel table-wrap"><table><thead><tr><th>Descrição</th><th>Cliente</th><th>Competência</th><th>Valor</th><th>Recebimento</th><th>Nota fiscal</th><th>Ações</th></tr></thead><tbody>
        @for (item of lancamentos(); track item.id) {<tr><td>{{ item.descricao }}</td><td>{{ nomeCliente(item.idCliente) }}</td><td>{{ item.dataCompetencia | date:'MM/yyyy' }}</td><td>{{ item.valor | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</td><td><span class="status" [class.status-paid]="item.statusRecebimento === 'PAGO'">{{ item.statusRecebimento === 'PAGO' ? 'Recebido' : 'Pendente' }}</span></td><td>{{ item.notaFiscalEmitida ? 'Emitida' : 'Não emitida' }}</td><td class="actions"><button type="button" class="secondary" (click)="editar(item)">Editar</button><button type="button" class="danger" (click)="excluir(item)">Excluir</button></td></tr>} @empty {<tr><td colspan="7" class="empty">{{ carregando() ? 'Carregando lançamentos...' : 'Nenhum lançamento registrado.' }}</td></tr>}
      </tbody></table><app-pagination [page]="pagina()" [size]="tamanhoPagina" [total]="totalRegistros()" (pageChange)="mudarPagina($event)"></app-pagination></div>
      }
    </section>
    <app-modal [open]="modalOpen()" (openChange)="modalOpen.set($event)" [title]="editando() ? 'Editar lançamento' : 'Novo lançamento'" description="Informe os dados do faturamento." [primaryLabel]="salvando() ? 'Salvando...' : 'Salvar lançamento'" [primaryDisabled]="form.invalid || salvando()" (primary)="salvar()" (secondary)="fechar()">
      <form class="entry-form" [formGroup]="form" (ngSubmit)="salvar()">
        @if (errosServidor.length) { <div class="server-errors" role="alert"><strong>Revise os dados informados:</strong>@for (erro of errosServidor; track erro) { <p>{{ erro }}</p> }</div> }
        <label>Descrição do serviço *<input formControlName="descricao" placeholder="Ex.: manutenção mensal" [class.input-invalid]="form.controls.descricao.touched && form.controls.descricao.invalid"></label>
        <label>Cliente *<select formControlName="idCliente" [class.input-invalid]="form.controls.idCliente.touched && form.controls.idCliente.invalid"><option value="">Selecione um cliente</option>@for (cliente of clientes(); track cliente.id) { <option [value]="cliente.id">{{ cliente.nome }}</option> }</select></label>
        <div class="form-row"><label>Valor (R$) *<input formControlName="valor" type="number" min="0.01" step="0.01" inputmode="decimal" [class.input-invalid]="form.controls.valor.touched && form.controls.valor.invalid"></label><label>Competência *<input formControlName="dataCompetencia" type="date" [class.input-invalid]="form.controls.dataCompetencia.touched && form.controls.dataCompetencia.invalid"></label></div>
        <label>Recebimento<select formControlName="statusRecebimento" [class.input-invalid]="form.controls.statusRecebimento.touched && form.controls.statusRecebimento.invalid"><option value="PENDENTE">Pendente</option><option value="PAGO">Recebido</option></select></label>
        <label class="check"><input formControlName="notaFiscalEmitida" type="checkbox"> Nota fiscal emitida</label>
      </form>
    </app-modal>
  `,
  styles: [`:host{display:block;padding:32px}.page{max-width:1200px;margin:auto}.page-header{display:flex;align-items:end;justify-content:space-between;gap:20px;margin-bottom:22px}.eyebrow{margin-bottom:5px;color:var(--primary-color);font-size:.72rem;font-weight:800;text-transform:uppercase}.page-header h1{margin:0;color:var(--text-color);font-size:1.8rem}.page-header p:last-child{margin-top:6px;color:var(--text-muted)}button{border:0;border-radius:var(--radius-sm);background:var(--primary-color);color:#fff;padding:9px 12px;font-weight:650;cursor:pointer}button:hover{background:var(--primary-hover)}button:focus-visible{outline:3px solid rgb(29 78 216 / 28%);outline-offset:2px}.page-header button{padding:11px 15px}.table-wrap{overflow:auto;border:1px solid var(--border-color);border-radius:var(--radius-md);background:#fff;box-shadow:var(--shadow-sm)}table{width:100%;border-collapse:collapse}th,td{padding:13px 11px;border-bottom:1px solid var(--border-color);text-align:left;white-space:nowrap}tbody tr:last-child td{border-bottom:0}th{color:var(--text-muted);font-size:.7rem;text-transform:uppercase}.status{color:var(--warning-color);font-size:.78rem;font-weight:700}.status-paid{color:var(--success-color)}.actions{white-space:nowrap}.actions button+button{margin-left:6px}.actions button{padding:7px 10px;font-size:.75rem}.secondary{background:var(--surface-muted);color:var(--text-color)}.danger{background:#fee2e2;color:var(--danger-color)}.empty{text-align:center;color:var(--text-muted);padding:30px}.entry-form{display:grid;gap:14px}.entry-form label{display:grid;gap:6px;color:var(--text-color);font-size:.84rem;font-weight:650}.entry-form input:not([type=checkbox]),.entry-form select{width:100%;min-width:0;padding:10px 11px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:#fff;color:var(--text-color)}.entry-form input:focus,.entry-form select:focus{border-color:var(--primary-color);outline:0;box-shadow:0 0 0 3px rgb(29 78 216 / 12%)}.entry-form .input-invalid{border-color:#dc2626}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.entry-form .check{display:flex;align-items:center;gap:9px}.check input{width:17px;height:17px;accent-color:var(--primary-color)}@media(max-width:760px){:host{padding:20px 16px}.page-header{align-items:stretch;flex-direction:column}.form-row{grid-template-columns:1fr}}`]
})
export class LancamentoListaComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/lancamentos`;
  private readonly clienteUrl = `${environment.apiUrl}/api/v1/clientes`;
  readonly lancamentos = signal<Lancamento[]>([]);
  readonly clientes = signal<ClienteOption[]>([]);
  readonly clienteSelecionado = signal('');
  readonly carregando = signal(false);
  readonly modalOpen = signal(false);
  readonly editando = signal(false);
  readonly salvando = signal(false);
  errosServidor: string[] = [];
  readonly pagina = signal(0);
  readonly totalRegistros = signal(0);
  readonly tamanhoPagina = 10;
  busca = '';
  filtroStatus = '';
  filtroNotaFiscal = '';
  private debounceId: ReturnType<typeof setTimeout> | null = null;
  readonly toolbarFields: FilterToolbarField[] = [
    { key: 'busca', label: 'Buscar lançamento', type: 'text', placeholder: 'Descrição do serviço' },
    { key: 'statusRecebimento', label: 'Recebimento', type: 'select', options: [{ value: 'PAGO', label: 'Recebido' }, { value: 'PENDENTE', label: 'Pendente' }] },
    { key: 'notaFiscalEmitida', label: 'Nota fiscal', type: 'select', options: [{ value: 'true', label: 'Emitida' }, { value: 'false', label: 'Pendente' }] },
  ];
  private editingId: string | null = null;
  readonly form = this.fb.nonNullable.group({
    descricao: ['', [trimmedRequired, Validators.maxLength(200)]], idCliente: ['', trimmedRequired],
    valor: [0, [Validators.required, Validators.min(0)]], dataCompetencia: ['', Validators.required],
    statusRecebimento: ['PENDENTE' as 'PAGO' | 'PENDENTE', Validators.required], notaFiscalEmitida: [false],
  });

  ngOnInit(): void {
    const clienteDaRota = this.route.snapshot.queryParamMap.get('clienteId');
    if (clienteDaRota) { this.clienteSelecionado.set(clienteDaRota); this.carregar(); }
    this.http.get<{ content: ClienteOption[] }>(this.clienteUrl, { params: { page: 0, size: 100, sort: 'nome,asc' } }).subscribe({
      next: response => this.clientes.set((response.content ?? []).filter(cliente => cliente.ativo !== false)),
      error: () => this.notifications.error('Não foi possível carregar os clientes.'),
    });
  }

  selecionarCliente(clienteId: string): void { this.clienteSelecionado.set(clienteId); this.pagina.set(0); this.carregar(); }
  nomeCliente(id: string): string { return this.clientes().find(cliente => cliente.id === id)?.nome ?? 'Cliente'; }
  filtrosAtuais(): Record<string, string> { return { busca: this.busca, statusRecebimento: this.filtroStatus, notaFiscalEmitida: this.filtroNotaFiscal }; }
  alterarFiltro({ key, value }: FilterToolbarChange): void {
    if (key === 'busca') {
      this.busca = value;
      this.pagina.set(0);
      if (this.debounceId) clearTimeout(this.debounceId);
      this.debounceId = setTimeout(() => this.carregar(), 300);
    } else if (key === 'statusRecebimento') { this.filtroStatus = value; this.aplicarFiltros(); }
    else if (key === 'notaFiscalEmitida') { this.filtroNotaFiscal = value; this.aplicarFiltros(); }
  }
  limparFiltros(): void { this.busca = ''; this.filtroStatus = ''; this.filtroNotaFiscal = ''; this.aplicarFiltros(); }
  private aplicarFiltros(): void { this.pagina.set(0); this.carregar(); }
  mudarPagina(pagina: number): void { this.pagina.set(pagina); this.carregar(); }
  novo(): void {
    if (!this.clienteSelecionado()) return;
    this.editingId = null;
    this.editando.set(false);
    this.form.reset({ descricao: '', idCliente: this.clienteSelecionado(), valor: 0, dataCompetencia: new Date().toISOString().slice(0, 10), statusRecebimento: 'PENDENTE', notaFiscalEmitida: false });
    this.modalOpen.set(true);
  }
  editar(item: Lancamento): void {
    this.editingId = item.id;
    this.editando.set(true);
    this.form.reset({ descricao: item.descricao, idCliente: item.idCliente, valor: item.valor, dataCompetencia: item.dataCompetencia, statusRecebimento: item.statusRecebimento, notaFiscalEmitida: item.notaFiscalEmitida });
    this.modalOpen.set(true);
  }
  fechar(): void { this.modalOpen.set(false); }
  salvar(): void {
    if (this.form.invalid || this.salvando()) { this.form.markAllAsTouched(); return; }
    this.salvando.set(true);
    const editing = !!this.editingId;
    const request = this.editingId ? this.http.put(`${this.apiUrl}/${this.editingId}`, this.form.getRawValue()) : this.http.post(this.apiUrl, this.form.getRawValue());
    this.errosServidor = [];
    request.subscribe({ next: () => { this.salvando.set(false); this.modalOpen.set(false); this.carregar(); this.notifications.success(editing ? 'Lançamento atualizado.' : 'Lançamento cadastrado.'); }, error: error => { this.salvando.set(false); this.errosServidor = describeApiFieldErrors(applyApiFieldErrors(this.form, error)); } });
  }
  excluir(item: Lancamento): void {
    if (!confirm(`Excluir o lançamento "${item.descricao}"?`)) return;
    this.http.delete(`${this.apiUrl}/${item.id}`).subscribe(() => { this.carregar(); this.notifications.success('Lançamento excluído.'); });
  }
  private carregar(): void {
    if (!this.clienteSelecionado()) { this.lancamentos.set([]); this.totalRegistros.set(0); return; }
    this.carregando.set(true);
    const params: Record<string, string | number> = { page: this.pagina(), size: this.tamanhoPagina, sort: 'dataCompetencia,desc' };
    params['clienteId'] = this.clienteSelecionado();
    if (this.busca.trim()) params['busca'] = this.busca.trim();
    if (this.filtroStatus) params['statusRecebimento'] = this.filtroStatus;
    if (this.filtroNotaFiscal) params['notaFiscalEmitida'] = this.filtroNotaFiscal;
    this.http.get<{ content: Lancamento[]; totalElements: number }>(this.apiUrl, { params }).subscribe({
      next: response => { this.lancamentos.set(response.content ?? []); this.totalRegistros.set(response.totalElements ?? 0); this.carregando.set(false); },
      error: () => this.carregando.set(false),
    });
  }
}
