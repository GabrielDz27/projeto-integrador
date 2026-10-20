import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface FilterToolbarOption { value: string; label: string; }
export interface FilterToolbarField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  options?: FilterToolbarOption[];
  min?: string;
  step?: string;
}
export interface FilterToolbarChange { key: string; value: string; }

@Component({
  selector: 'app-filter-toolbar',
  standalone: true,
  template: `
    <div class="filter-toolbar" role="search" [attr.aria-label]="ariaLabel">
      @for (field of fields; track field.key) {
        <label class="filter-field" [class.filter-search]="field.key === searchKey">
          <span>{{ field.label }}</span>
          @if (field.type === 'select') {
            <select [value]="valueOf(field.key)" (change)="emit(field.key, $any($event.target).value)">
              <option value="">Todos</option>
              @for (option of field.options ?? []; track option.value) { <option [value]="option.value">{{ option.label }}</option> }
            </select>
          } @else {
            <input [type]="field.type" [min]="field.min ?? null" [step]="field.step ?? null" [value]="valueOf(field.key)" [placeholder]="field.placeholder ?? ''" (input)="emit(field.key, $any($event.target).value)">
          }
        </label>
      }
      @if (showClear) { <button type="button" class="filter-clear" (click)="clear.emit()">Limpar</button> }
      @if (showExport) { <button type="button" class="filter-export" (click)="export.emit()">Exportar CSV</button> }
    </div>
  `,
  styles: [`:host{display:block;min-width:0}.filter-toolbar{display:grid;grid-template-columns:minmax(220px,2fr) repeat(3,minmax(120px,1fr)) auto auto;align-items:end;gap:10px;margin:0 0 16px}.filter-field{display:grid;min-width:0;gap:5px;color:var(--text-muted);font-size:.75rem;font-weight:700}.filter-field>span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.filter-field input,.filter-field select{width:100%;min-width:0;height:42px;padding:9px 11px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:var(--surface-color);color:var(--text-color);font:inherit;font-weight:400;outline:0}.filter-field input:focus,.filter-field select:focus{border-color:var(--primary-color);box-shadow:0 0 0 3px rgb(29 78 216 / 12%)}.filter-toolbar button{height:42px;padding:0 13px;border:0;border-radius:var(--radius-sm);font:inherit;font-size:.82rem;font-weight:700;white-space:nowrap;cursor:pointer}.filter-clear{background:var(--surface-muted);color:var(--text-color)}.filter-export{background:var(--primary-color);color:#fff}.filter-export:hover{background:var(--primary-hover)}button:focus-visible{outline:3px solid rgb(29 78 216 / 28%);outline-offset:2px}@media(max-width:900px){.filter-toolbar{grid-template-columns:repeat(2,minmax(0,1fr))}.filter-search{grid-column:1/-1}}@media(max-width:540px){.filter-toolbar{grid-template-columns:1fr}.filter-search{grid-column:auto}.filter-toolbar button{width:100%}}`]
})
export class FilterToolbarComponent {
  @Input() fields: FilterToolbarField[] = [];
  @Input() values: Record<string, string> = {};
  @Input() ariaLabel = 'Filtros da listagem';
  @Input() searchKey = 'busca';
  @Input() showClear = true;
  @Input() showExport = true;
  @Output() filterChange = new EventEmitter<FilterToolbarChange>();
  @Output() clear = new EventEmitter<void>();
  @Output() export = new EventEmitter<void>();

  valueOf(key: string): string { return this.values[key] ?? ''; }
  emit(key: string, value: string): void { this.filterChange.emit({ key, value }); }
}
