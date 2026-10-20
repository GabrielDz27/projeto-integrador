import { Injectable } from '@angular/core';
import { EMPTY, Observable, expand, map, toArray } from 'rxjs';

export interface CsvColumn { key: string; label: string; }
export interface PagedResult<T> { content: T[]; number: number; totalPages: number; }

@Injectable({ providedIn: 'root' })
export class CsvExportService {
  loadAllPages<T>(loadPage: (page: number) => Observable<PagedResult<T>>): Observable<T[]> {
    return loadPage(0).pipe(
      expand(result => result.number + 1 < result.totalPages ? loadPage(result.number + 1) : EMPTY),
      map(result => result.content ?? []),
      toArray(),
      map(pages => pages.flat()),
    );
  }

  download<T extends Record<string, unknown>>(filename: string, columns: CsvColumn[], rows: T[]): void {
    const lines = [
      columns.map(column => this.escape(column.label)).join(';'),
      ...rows.map(row => columns.map(column => this.escape(row[column.key])).join(';')),
    ];
    const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  private escape(value: unknown): string {
    let text = value == null ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
  }
}
