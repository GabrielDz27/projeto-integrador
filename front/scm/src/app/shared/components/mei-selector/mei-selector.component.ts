import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

export interface MeiOption { id: string; nome: string; cpf?: string; email?: string; }

@Component({
  selector: 'app-mei-selector',
  standalone: true,
  imports: [ModalComponent],
  template: `
    <label class="client-filter">
      <span>{{ label }}</span>
      <div class="selector-control">
        <input type="search" list="mei-options" [value]="valorExibido" [placeholder]="placeholder" [disabled]="disabled" autocomplete="off" (input)="aoDigitar($any($event.target).value)" (change)="selecionarPorNome($any($event.target).value)">
        <datalist id="mei-options">@for (mei of options; track mei.id) { <option [value]="mei.nome">{{ mei.email || mei.cpf || '' }}</option> }</datalist>
        <button type="button" class="search-trigger" aria-label="Pesquisar cliente/MEI" title="Pesquisar cliente/MEI" [disabled]="disabled" (click)="abrirPesquisa()"><span class="search-icon" aria-hidden="true"></span></button>
      </div>
    </label>

    <app-modal [open]="modalOpen()" (openChange)="modalOpen.set($event)" title="Pesquisar cliente/MEI" description="Busque pelo nome, CPF ou e-mail." [showFooter]="false" (secondary)="modalOpen.set(false)">
      <div class="search-modal">
        <label class="modal-search">Pesquisar<input type="search" [value]="consultaModal()" placeholder="Digite nome, CPF ou e-mail" (input)="consultaModal.set($any($event.target).value)"></label>
        <div class="result-list" role="listbox" aria-label="Clientes encontrados">
          @for (mei of resultados(); track mei.id) {
            <button type="button" class="result-option" role="option" (click)="selecionar(mei)"><strong>{{ mei.nome }}</strong><span>{{ mei.cpf || mei.email || 'Cliente/MEI' }}</span></button>
          } @empty { <p class="no-results">Nenhum cliente encontrado.</p> }
          @if (includeUnassigned) { <button type="button" class="result-option unassigned" (click)="selecionarSemVinculo()"><strong>{{ unassignedLabel }}</strong><span>Guias DAS ainda sem cliente associado</span></button> }
        </div>
      </div>
    </app-modal>
  `,
  styleUrl: './mei-selector.component.css',
})
export class MeiSelectorComponent {
  @Input() options: MeiOption[] = [];
  @Input() selectedId = '';
  @Input() label = 'MEI';
  @Input() placeholder = 'Selecione cliente';
  @Input() disabled = false;
  @Input() includeUnassigned = false;
  @Input() unassignedLabel = 'Guias antigas sem vínculo';
  @Output() selectionChange = new EventEmitter<string>();

  readonly modalOpen = signal(false);
  readonly consultaModal = signal('');
  private readonly textoDigitado = signal('');
  readonly resultados = computed(() => {
    const termo = this.consultaModal().trim().toLocaleLowerCase('pt-BR');
    if (!termo) return this.options;
    return this.options.filter(mei => [mei.nome, mei.cpf ?? '', mei.email ?? '']
      .some(valor => valor.toLocaleLowerCase('pt-BR').includes(termo)));
  });

  get valorExibido(): string {
    if (this.textoDigitado()) return this.textoDigitado();
    return this.options.find(option => option.id === this.selectedId)?.nome ?? '';
  }

  abrirPesquisa(): void { this.consultaModal.set(this.textoDigitado()); this.modalOpen.set(true); }

  aoDigitar(value: string): void {
    this.textoDigitado.set(value);
    if (this.options.some(option => option.nome === value)) this.selecionarPorNome(value);
    else if (this.selectedId) this.selectionChange.emit('');
  }

  selecionarPorNome(value: string): void {
    const option = this.options.find(mei => mei.nome.toLocaleLowerCase('pt-BR') === value.trim().toLocaleLowerCase('pt-BR'));
    if (option) this.selecionar(option);
  }

  selecionar(option: MeiOption): void {
    this.textoDigitado.set('');
    this.selectionChange.emit(option.id);
    this.modalOpen.set(false);
  }

  selecionarSemVinculo(): void {
    this.textoDigitado.set('');
    this.selectionChange.emit('__sem_vinculo__');
    this.modalOpen.set(false);
  }
}
