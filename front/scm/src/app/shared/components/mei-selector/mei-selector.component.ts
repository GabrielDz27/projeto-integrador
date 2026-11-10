import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

export interface MeiOption { id: string; nome: string; cpf?: string; email?: string; }

@Component({
  selector: 'app-mei-selector',
  standalone: true,
  template: `
    <div class="client-filter">
      <label class="client-filter-label" for="mei-selector-input">{{ label }}</label>
      <div class="selector-control">
        <input id="mei-selector-input" type="search" role="combobox" aria-autocomplete="list" aria-controls="mei-suggestions" [attr.aria-expanded]="listaAberta()" [attr.aria-activedescendant]="listaAberta() && indiceAtivo() >= 0 ? 'mei-option-' + indiceAtivo() : null" [value]="valorExibido" [placeholder]="placeholder" [disabled]="disabled" autocomplete="off" (focus)="abrirLista()" (input)="aoDigitar($any($event.target).value)" (keydown)="navegarLista($event)" (blur)="fecharLista()">
        <button type="button" class="dropdown-trigger" [attr.aria-label]="listaAberta() ? 'Fechar lista de clientes' : 'Mostrar clientes'" [disabled]="disabled" (mousedown)="$event.preventDefault()" (click)="alternarLista()"><span aria-hidden="true"></span></button>
        @if (listaAberta()) {
          <div class="suggestions" role="listbox" id="mei-suggestions" [attr.aria-label]="label">
            @for (mei of resultadosFiltrados; track mei.id; let i = $index) {
              <button type="button" class="suggestion" [class.active]="i === indiceAtivo()" id="mei-option-{{ i }}" role="option" [attr.aria-selected]="i === indiceAtivo()" (mousedown)="$event.preventDefault()" (click)="selecionar(mei)">
                <strong>{{ mei.nome }}</strong><span>{{ mei.cpf || mei.email || 'Cliente/MEI' }}</span>
              </button>
            }
            @if (mostrarSemVinculo) {
              <button type="button" class="suggestion unassigned" [class.active]="indiceAtivo() === resultadosFiltrados.length" id="mei-option-{{ resultadosFiltrados.length }}" role="option" [attr.aria-selected]="indiceAtivo() === resultadosFiltrados.length" (mousedown)="$event.preventDefault()" (click)="selecionarSemVinculo()">
                <strong>{{ unassignedLabel }}</strong><span>Guias DAS ainda sem cliente associado</span>
              </button>
            }
            @if (resultadosFiltrados.length === 0 && !mostrarSemVinculo) { <p class="no-results">Nenhum cliente encontrado.</p> }
          </div>
        }
      </div>
    </div>
  `,
  styleUrl: './mei-selector.component.css',
})
export class MeiSelectorComponent {
  @Input() options: MeiOption[] = [];
  @Input() selectedId = '';
  @Input() label = 'MEI';
  @Input() placeholder = 'Buscar cliente...';
  @Input() disabled = false;
  @Input() includeUnassigned = false;
  @Input() unassignedLabel = 'Guias antigas sem vínculo';
  @Output() selectionChange = new EventEmitter<string>();

  readonly listaAberta = signal(false);
  readonly indiceAtivo = signal(-1);
  private readonly textoDigitado = signal('');
  private readonly buscaAtiva = signal(false);

  get resultadosFiltrados(): MeiOption[] {
    const termo = this.textoDigitado().trim().toLocaleLowerCase('pt-BR');
    if (!termo) return this.options;
    return this.options.filter(mei => [mei.nome, mei.cpf ?? '', mei.email ?? '']
      .some(valor => valor.toLocaleLowerCase('pt-BR').includes(termo)));
  }

  get mostrarSemVinculo(): boolean {
    const termo = this.textoDigitado().trim().toLocaleLowerCase('pt-BR');
    return this.includeUnassigned && (!termo || `${this.unassignedLabel} guias antigas sem cliente associado`.toLocaleLowerCase('pt-BR').includes(termo));
  }

  get valorExibido(): string {
    if (this.buscaAtiva()) return this.textoDigitado();
    return this.options.find(option => option.id === this.selectedId)?.nome ?? '';
  }

  abrirLista(): void { this.buscaAtiva.set(true); this.textoDigitado.set(''); this.indiceAtivo.set(-1); this.listaAberta.set(true); }
  alternarLista(): void { if (this.listaAberta()) this.fecharLista(); else this.abrirLista(); }

  aoDigitar(value: string): void {
    this.buscaAtiva.set(true);
    this.textoDigitado.set(value);
    this.indiceAtivo.set(-1);
    this.listaAberta.set(true);
  }

  navegarLista(event: KeyboardEvent): void {
    const total = this.resultadosFiltrados.length + (this.mostrarSemVinculo ? 1 : 0);
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.listaAberta.set(true);
      if (total) this.indiceAtivo.update(indice => indice < 0 ? 0 : Math.min(indice + 1, total - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (total) this.indiceAtivo.update(indice => indice < 0 ? total - 1 : Math.max(indice - 1, 0));
    } else if (event.key === 'Enter' && this.listaAberta() && total) {
      event.preventDefault();
      const indice = this.indiceAtivo() < 0 ? 0 : this.indiceAtivo();
      const option = this.resultadosFiltrados[indice];
      if (option) this.selecionar(option);
      else if (this.mostrarSemVinculo && indice === this.resultadosFiltrados.length) this.selecionarSemVinculo();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.fecharLista();
    }
  }

  fecharLista(): void {
    this.listaAberta.set(false);
    this.buscaAtiva.set(false);
    this.textoDigitado.set('');
    this.indiceAtivo.set(-1);
  }

  selecionar(option: MeiOption): void {
    this.fecharLista();
    this.selectionChange.emit(option.id);
  }

  selecionarSemVinculo(): void {
    this.fecharLista();
    this.selectionChange.emit('__sem_vinculo__');
  }
}
