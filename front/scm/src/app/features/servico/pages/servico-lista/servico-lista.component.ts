import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { NotificationService } from '../../../../shared/services/notification-service';
import { CsvExportModalComponent, CsvExportOptions, ExportColumnOption, ExportFilterField } from '../../../../shared/components/csv-export-modal/csv-export-modal.component';
import { CsvColumn, CsvExportService, PagedResult } from '../../../../shared/services/csv-export-service';
import { FilterToolbarComponent, FilterToolbarChange, FilterToolbarField } from '../../../../shared/components/filter-toolbar/filter-toolbar.component';

interface Servico { id: string; nome: string; descricao?: string; precoBase: number; aliquotaIss?: number; ativo: boolean; }
interface ServicoPage { content: Servico[]; totalElements: number; }

@Component({
  selector: 'app-servico-lista',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, PaginationComponent, CsvExportModalComponent, FilterToolbarComponent],
  template: `
    <section class="page">
      <header class="page-header"><div><p class="eyebrow">Catálogo</p><h1>Serviços</h1><p>Consulte os serviços e valores praticados.</p></div><button type="button" (click)="exportOpen.set(true)">Exportar CSV</button></header>
      <app-filter-toolbar ariaLabel="Filtros de serviços" [fields]="toolbarFields" [values]="filtrosAtuais()" [showClear]="true" [showExport]="false" (filterChange)="alterarFiltro($event)" (clear)="limparFiltros()"></app-filter-toolbar>
      <div class="panel table-wrap"><table><thead><tr><th>Serviço</th><th>Descrição</th><th>Preço base</th><th>ISS</th><th>Situação</th></tr></thead><tbody>
        @for (servico of servicos(); track servico.id) {<tr><td><strong>{{ servico.nome }}</strong></td><td>{{ servico.descricao || '—' }}</td><td>{{ servico.precoBase | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}</td><td>{{ servico.aliquotaIss ?? 0 }}%</td><td><span [class.inactive]="!servico.ativo">{{ servico.ativo ? 'Ativo' : 'Inativo' }}</span></td></tr>}
        @empty {<tr><td colspan="5" class="empty">{{ carregando() ? 'Carregando serviços...' : 'Nenhum serviço corresponde aos filtros.' }}</td></tr>}
      </tbody></table><app-pagination [page]="pagina()" [size]="tamanhoPagina" [total]="totalRegistros()" (pageChange)="mudarPagina($event)"></app-pagination></div>
    </section>
    <app-csv-export-modal [open]="exportOpen()" (openChange)="exportOpen.set($event)" [initialFilters]="filtrosAtuais()" [filterFields]="filterFields" [columnOptions]="columnOptions" (exportCsv)="exportar($event)"></app-csv-export-modal>
  `,
  styles: [`:host{display:block;padding:32px}.page{max-width:1180px;margin:auto}.page-header{margin-bottom:22px}.eyebrow{margin-bottom:5px;color:var(--primary-color);font-size:.72rem;font-weight:800;text-transform:uppercase}.page-header h1{margin:0;color:var(--text-color);font-size:1.8rem}.page-header p:last-child{margin-top:6px;color:var(--text-muted)}.filters{display:grid;grid-template-columns:minmax(220px,2fr) repeat(3,minmax(120px,1fr)) auto;align-items:end;gap:10px;margin-bottom:16px}.filters label{display:grid;gap:5px;color:var(--text-muted);font-size:.76rem;font-weight:650}.filters input,.filters select{width:100%;min-width:0;padding:9px 10px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:#fff;color:var(--text-color)}button{padding:10px 12px;border:0;border-radius:var(--radius-sm);background:var(--primary-color);color:#fff;font:inherit;font-weight:650;cursor:pointer}.secondary{background:var(--surface-muted);color:var(--text-color)}.panel{overflow:auto;padding:12px;border:1px solid var(--border-color);border-radius:var(--radius-md);background:#fff;box-shadow:var(--shadow-sm)}table{width:100%;border-collapse:collapse}th,td{padding:12px 10px;border-bottom:1px solid var(--border-color);text-align:left}th{color:var(--text-muted);font-size:.7rem;text-transform:uppercase}tbody tr:last-child td{border-bottom:0}td span{color:var(--success-color);font-size:.8rem;font-weight:700}.inactive{color:var(--text-muted)}.empty{text-align:center;color:var(--text-muted);padding:28px}@media(max-width:850px){.filters{grid-template-columns:repeat(2,minmax(0,1fr))}.filters label:first-child{grid-column:1/-1}}@media(max-width:540px){:host{padding:18px}.filters{grid-template-columns:1fr}.filters label:first-child{grid-column:auto}}`]
})
export class ServicoListaComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly notifications = inject(NotificationService);
  private readonly csv = inject(CsvExportService);
  private readonly apiUrl = `${environment.apiUrl}/api/v1/servicos`;
  readonly servicos = signal<Servico[]>([]);
  readonly busca = signal('');
  readonly ativo = signal('');
  readonly precoMin = signal<number | null>(null);
  readonly precoMax = signal<number | null>(null);
  readonly pagina = signal(0);
  readonly totalRegistros = signal(0);
  readonly tamanhoPagina = 10;
  readonly carregando = signal(false);
  readonly exportOpen = signal(false);
  readonly filterFields: ExportFilterField[] = [
    { key: 'busca', label: 'Nome ou descrição', type: 'text' },
    { key: 'ativo', label: 'Situação', type: 'select', options: [{ value: 'true', label: 'Ativos' }, { value: 'false', label: 'Inativos' }] },
    { key: 'precoMin', label: 'Preço mínimo', type: 'number' },
    { key: 'precoMax', label: 'Preço máximo', type: 'number' },
  ];
  readonly toolbarFields: FilterToolbarField[] = [
    { key: 'busca', label: 'Buscar serviço', type: 'text', placeholder: 'Nome ou descrição' },
    { key: 'ativo', label: 'Situação', type: 'select', options: [{ value: 'true', label: 'Ativos' }, { value: 'false', label: 'Inativos' }] },
    { key: 'precoMin', label: 'Preço mínimo', type: 'number', min: '0', step: '0.01' },
    { key: 'precoMax', label: 'Preço máximo', type: 'number', min: '0', step: '0.01' },
  ];
  readonly columnOptions: ExportColumnOption[] = [
    { key: 'nome', label: 'Serviço', selected: true }, { key: 'descricao', label: 'Descrição', selected: true },
    { key: 'precoBase', label: 'Preço base', selected: true }, { key: 'aliquotaIss', label: 'Alíquota ISS', selected: true }, { key: 'status', label: 'Situação', selected: true },
  ];
  readonly csvColumns: CsvColumn[] = this.columnOptions.map(({ key, label }) => ({ key, label }));
  private debounceId: ReturnType<typeof setTimeout> | null = null;

  filtrosAtuais(): Record<string, string> {
    return { busca: this.busca(), ativo: this.ativo(), precoMin: this.precoMin()?.toString() ?? '', precoMax: this.precoMax()?.toString() ?? '' };
  }
  alterarFiltro({ key, value }: FilterToolbarChange): void {
    if (key === 'busca') this.atualizarBusca(value);
    else if (key === 'ativo') this.atualizarAtivo(value);
    else if (key === 'precoMin') this.atualizarPrecoMin(value ? Number(value) : null);
    else if (key === 'precoMax') this.atualizarPrecoMax(value ? Number(value) : null);
  }

  ngOnInit(): void { this.carregar(); }
  atualizarBusca(valor: string): void { this.busca.set(valor); this.reiniciarBusca(); }
  atualizarAtivo(valor: string): void { this.ativo.set(valor); this.aplicarFiltros(); }
  atualizarPrecoMin(valor: number | null): void { this.precoMin.set(valor); this.aplicarFiltros(); }
  atualizarPrecoMax(valor: number | null): void { this.precoMax.set(valor); this.aplicarFiltros(); }
  limparFiltros(): void { this.busca.set(''); this.ativo.set(''); this.precoMin.set(null); this.precoMax.set(null); this.aplicarFiltros(); }
  mudarPagina(page: number): void { this.pagina.set(page); this.carregar(); }
  private reiniciarBusca(): void {
    if (this.debounceId) clearTimeout(this.debounceId);
    this.debounceId = setTimeout(() => this.aplicarFiltros(), 300);
  }
  private aplicarFiltros(): void { this.pagina.set(0); this.carregar(); }
  private carregar(): void {
    if (this.precoMin() !== null && this.precoMax() !== null && this.precoMin()! > this.precoMax()!) {
      this.notifications.error('O preço mínimo não pode ser maior que o preço máximo.');
      return;
    }
    this.carregando.set(true);
    const params: Record<string, string | number> = { page: this.pagina(), size: this.tamanhoPagina, sort: 'nome,asc' };
    if (this.busca().trim()) params['busca'] = this.busca().trim();
    if (this.ativo()) params['ativo'] = this.ativo();
    if (this.precoMin() !== null) params['precoMin'] = this.precoMin()!;
    if (this.precoMax() !== null) params['precoMax'] = this.precoMax()!;
    this.http.get<ServicoPage>(this.apiUrl, { params }).subscribe({
      next: response => { this.servicos.set(response.content ?? []); this.totalRegistros.set(response.totalElements ?? 0); this.carregando.set(false); },
      error: () => this.carregando.set(false),
    });
  }

  exportar(options: CsvExportOptions): void {
    const filters = options.filters;
    const params = (page: number): Record<string, string | number> => {
      const query: Record<string, string | number> = { page, size: 100, sort: 'nome,asc' };
      if (filters['busca']?.trim()) query['busca'] = filters['busca'].trim();
      if (filters['ativo']) query['ativo'] = filters['ativo'];
      if (filters['precoMin']) query['precoMin'] = filters['precoMin'];
      if (filters['precoMax']) query['precoMax'] = filters['precoMax'];
      return query;
    };
    this.csv.loadAllPages(page => this.http.get<PagedResult<Servico>>(this.apiUrl, { params: params(page) })).subscribe({
      next: rows => {
        if (!rows.length) { this.notifications.error('Nenhum serviço corresponde aos filtros da exportação.'); return; }
        const exportRows = rows.map(servico => ({ nome: servico.nome, descricao: servico.descricao ?? '', precoBase: servico.precoBase.toFixed(2).replace('.', ','), aliquotaIss: `${servico.aliquotaIss ?? 0}%`, status: servico.ativo ? 'Ativo' : 'Inativo' }));
        const columns = this.csvColumns.filter(column => options.columns.includes(column.key));
        this.csv.download('servicos', columns, exportRows);
        this.exportOpen.set(false);
        this.notifications.success(`${rows.length} serviços exportados.`);
      },
      error: () => this.notifications.error('Não foi possível exportar os serviços.'),
    });
  }
}
