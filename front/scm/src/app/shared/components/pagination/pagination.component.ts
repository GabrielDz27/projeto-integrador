import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  standalone: true,
  template: `
    @if (total > 0) {
      <nav class="pagination" aria-label="Paginação">
        <span class="pagination-summary">{{ start }}–{{ end }} de {{ total }}</span>
        <div class="pagination-controls">
          <button type="button" aria-label="Página anterior" [disabled]="page <= 0" (click)="pageChange.emit(page - 1)">‹</button>
          <span>Página {{ page + 1 }} de {{ pageCount }}</span>
          <button type="button" aria-label="Próxima página" [disabled]="page + 1 >= pageCount" (click)="pageChange.emit(page + 1)">›</button>
        </div>
      </nav>
    }
  `,
  styles: [`:host{display:block}.pagination{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 4px 2px;color:var(--text-muted);font-size:.82rem}.pagination-controls{display:flex;align-items:center;gap:12px}.pagination button{display:grid;width:34px;height:34px;place-items:center;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:var(--surface-color);color:var(--text-color);font-size:1.2rem}.pagination button:disabled{opacity:.4;cursor:not-allowed}@media(max-width:420px){.pagination{align-items:flex-start;flex-direction:column}}`]
})
export class PaginationComponent {
  @Input() page = 0;
  @Input() size = 20;
  @Input() total = 0;
  @Output() pageChange = new EventEmitter<number>();

  get pageCount(): number { return Math.max(1, Math.ceil(this.total / this.size)); }
  get start(): number { return this.total ? this.page * this.size + 1 : 0; }
  get end(): number { return Math.min(this.total, (this.page + 1) * this.size); }
}