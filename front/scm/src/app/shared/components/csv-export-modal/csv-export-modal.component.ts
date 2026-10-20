import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';

export interface ExportFilterOption { value: string; label: string; }
export interface ExportFilterField { key: string; label: string; type: 'text' | 'select' | 'number'; options?: ExportFilterOption[]; }
export interface ExportColumnOption { key: string; label: string; selected: boolean; }
export interface CsvExportOptions { filters: Record<string, string>; columns: string[]; }

@Component({
  selector: 'app-csv-export-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <app-modal [open]="open" (openChange)="openChange.emit($event)" title="Exportar CSV" description="Ajuste os filtros da listagem e escolha as colunas do arquivo." primaryLabel="Baixar CSV" [primaryDisabled]="selecionadas().length === 0" (primary)="confirmar()" (secondary)="openChange.emit(false)">
      <div class="export-form">
        <section class="filter-grid" aria-label="Filtros da exportação">
          @for (field of filterFields; track field.key) {
            @if (field.type === 'select') {
              <label>{{ field.label }}<select [ngModel]="filters()[field.key] || ''" (ngModelChange)="atualizarFiltro(field.key, $event)"><option value="">Todos</option>@for (option of field.options ?? []; track option.value) { <option [value]="option.value">{{ option.label }}</option> }</select></label>
            } @else {
              <label>{{ field.label }}<input [type]="field.type" [ngModel]="filters()[field.key] || ''" (ngModelChange)="atualizarFiltro(field.key, $event)"></label>
            }
          }
        </section>
          <fieldset><legend>Colunas incluídas</legend>@for (column of columnOptions; track column.key) { <label class="column-option"><input type="checkbox" [checked]="colunasSelecionadas().has(column.key)" (change)="alternarColuna(column.key, $any($event.target).checked)">{{ column.label }}</label> }</fieldset>
      </div>
    </app-modal>
  `,
  styles: [`:host{display:contents}.export-form{display:grid;gap:18px}.filter-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.filter-grid label{display:grid;gap:5px;color:var(--text-color);font-size:.82rem;font-weight:650}.filter-grid input,.filter-grid select{width:100%;min-width:0;padding:9px 10px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:#fff;color:var(--text-color);font:inherit}fieldset{display:flex;flex-wrap:wrap;gap:12px;border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:12px}legend{padding:0 5px;color:var(--text-muted);font-size:.8rem;font-weight:700}.column-option{display:flex;align-items:center;gap:7px;color:var(--text-color);font-size:.82rem}@media(max-width:540px){.filter-grid{grid-template-columns:1fr}}`]
})
export class CsvExportModalComponent implements OnChanges {
  @Input() open = false;
  @Input() initialFilters: Record<string, string> = {};
  @Input() filterFields: ExportFilterField[] = [];
  @Input() columnOptions: ExportColumnOption[] = [];
  @Output() openChange = new EventEmitter<boolean>();
  @Output() exportCsv = new EventEmitter<CsvExportOptions>();
  filters = signal<Record<string, string>>({});
  colunasSelecionadas = signal<Set<string>>(new Set());
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']?.currentValue && !changes['open'].previousValue) {
      this.filters.set({ ...this.initialFilters });
      this.colunasSelecionadas.set(new Set(this.columnOptions.filter(column => column.selected).map(column => column.key)));
    }
  }
  selecionadas() { return [...this.colunasSelecionadas()]; }
  atualizarFiltro(key: string, value: string | number): void { this.filters.update(current => ({ ...current, [key]: String(value) })); }
  alternarColuna(key: string, checked: boolean): void {
    this.colunasSelecionadas.update(current => {
      const next = new Set(current);
      if (checked) next.add(key); else next.delete(key);
      return next;
    });
  }
  confirmar(): void { this.exportCsv.emit({ filters: this.filters(), columns: this.selecionadas() }); }
}
