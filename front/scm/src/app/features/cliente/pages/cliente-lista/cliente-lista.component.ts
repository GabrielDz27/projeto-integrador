import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { NumericMaskDirective } from '../../../../shared/directives/numeric-mask.directive';
import { NotificationService } from '../../../../shared/services/notification-service';
import { trimmedRequired } from '../../../../shared/utils/form-validators';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ESTADOS_BRASILEIROS } from '../../../../shared/models/estados-brasileiros';

interface Cliente { id: string; nome: string; email?: string; cpf?: string; telefone?: string; dataNascimento?: string; endereco?: string; cidade?: string; estado?: string; cep?: string; ativo?: boolean; }
interface Historico { tipoOperacao: string; campoAlterado?: string; valorAnterior?: string; valorNovo?: string; dataHora: string; observacao?: string; }
interface ClientePage { content: Cliente[]; totalElements: number; totalPages: number; number: number; size: number; }

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, NumericMaskDirective, PaginationComponent],
  template: `
    <section class="page">
      <header class="page-header"><div><p>Cadastros</p><h1>Clientes</h1><span>Contatos e histórico dos clientes do seu negócio.</span></div><button type="button" (click)="novo()">Novo cliente</button></header>
      <label class="search">Buscar cliente<input [value]="busca" (input)="buscar($any($event.target).value)" placeholder="Nome, e-mail ou CPF" aria-label="Buscar clientes"></label>
      <div class="panel"><table><thead><tr><th>Nome</th><th>E-mail</th><th>CPF</th><th>Telefone</th><th>Status</th><th>Ações</th></tr></thead><tbody>
        @for (cliente of clientes; track cliente.id) {
          <tr><td><strong>{{ cliente.nome }}</strong></td><td>{{ cliente.email || 'Sem e-mail' }}</td><td>{{ cliente.cpf || '-' }}</td><td>{{ cliente.telefone || '-' }}</td><td>{{ cliente.ativo ? 'Ativo' : 'Inativo' }}</td><td class="actions"><button type="button" class="secondary" (click)="editar(cliente)">Editar</button><button type="button" class="secondary" (click)="verHistorico(cliente)">{{ clienteAberto?.id === cliente.id ? 'Ocultar' : 'Histórico' }}</button><button type="button" class="secondary" (click)="alterarStatus(cliente)">{{ cliente.ativo ? 'Desativar' : 'Ativar' }}</button></td></tr>
          @if (clienteAberto?.id === cliente.id) {<tr><td colspan="6"><div class="timeline">@for (item of historico; track item.dataHora + item.tipoOperacao) {<article><b>{{ item.tipoOperacao }}</b><time>{{ item.dataHora | date:'dd/MM/yyyy HH:mm' }}</time><span>{{ item.campoAlterado || 'cliente' }}: {{ item.valorAnterior || '-' }} → {{ item.valorNovo || '-' }}</span></article>} @empty {<p>Nenhum evento registrado.</p>}</div></td></tr>}
        } @empty { <tr><td colspan="6" class="empty">{{ carregando ? 'Buscando clientes...' : 'Nenhum cliente encontrado.' }}</td></tr> }
      </tbody></table><app-pagination [page]="pagina" [size]="tamanhoPagina" [total]="totalRegistros" (pageChange)="mudarPagina($event)"></app-pagination></div>
    </section>
    <app-modal [open]="modalOpen" (openChange)="modalOpen = $event" [title]="clienteEditando ? 'Editar cliente' : 'Novo cliente'" description="Dados cadastrais do cliente." [primaryLabel]="saving ? 'Salvando...' : 'Salvar cliente'" [primaryDisabled]="form.invalid || saving" (primary)="salvar()" (secondary)="fecharModal()">
      <form class="client-form" [formGroup]="form" (ngSubmit)="salvar()">
        <label>Nome *<input formControlName="nome" autocomplete="name" maxlength="100" [class.input-invalid]="form.controls.nome.touched && form.controls.nome.invalid"></label>
        <div class="form-grid"><label>CPF<input formControlName="cpf" appNumericMask="cpf" inputmode="numeric" maxlength="14" placeholder="000.000.000-00" [class.input-invalid]="form.controls.cpf.touched && form.controls.cpf.invalid"></label><label>Data de nascimento<input formControlName="dataNascimento" type="date"></label></div>
        <div class="form-grid"><label>E-mail<input formControlName="email" type="email" autocomplete="email" maxlength="150" [class.input-invalid]="form.controls.email.touched && form.controls.email.invalid"></label><label>Telefone<input formControlName="telefone" appNumericMask="telefone" inputmode="numeric" maxlength="15" placeholder="(00) 00000-0000" [class.input-invalid]="form.controls.telefone.touched && form.controls.telefone.invalid"></label></div>
        <label>Endereço<input formControlName="endereco" autocomplete="street-address" maxlength="200"></label>
        <div class="form-grid address-grid"><label>Cidade<input formControlName="cidade" autocomplete="address-level2" maxlength="100"></label><label>Estado (UF)<select formControlName="estado" autocomplete="address-level1" [class.input-invalid]="form.controls.estado.touched && form.controls.estado.invalid"><option value="">Selecione</option>@for (estado of estados; track estado.uf) { <option [value]="estado.uf">{{ estado.nome }}</option> }</select></label><label>CEP<input formControlName="cep" appNumericMask="cep" inputmode="numeric" maxlength="9" placeholder="00000-000" autocomplete="postal-code" [class.input-invalid]="form.controls.cep.touched && form.controls.cep.invalid"></label></div>
      </form>
    </app-modal>
  `,
  styles: [`:host{display:block;padding:32px}.page{max-width:1120px;margin:auto}.page-header{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:20px}.page-header p{margin:0 0 5px;color:var(--primary-color);font-size:.72rem;font-weight:800;text-transform:uppercase}.page-header h1{margin:0;color:var(--text-color);font-size:1.8rem}.page-header span{display:block;margin-top:6px;color:var(--text-muted);font-size:.9rem}button{border:0;border-radius:var(--radius-sm);background:var(--primary-color);color:#fff;padding:9px 12px;font-weight:650;cursor:pointer}.page-header button{padding:11px 15px}.secondary{background:var(--surface-muted);color:var(--text-color)}.secondary:hover{background:#e2e8f0}.secondary:focus-visible,button:focus-visible{outline:3px solid rgb(29 78 216 / 28%);outline-offset:2px}.search{display:grid;gap:6px;margin-bottom:16px;color:var(--text-muted);font-size:.8rem;font-weight:650}.search input,.client-form input,.client-form select{width:100%;min-width:0;padding:10px 11px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:#fff;color:var(--text-color);outline:0}.search input:focus,.client-form input:focus,.client-form select:focus{border-color:var(--primary-color);box-shadow:0 0 0 3px rgb(29 78 216 / 12%)}.panel{overflow:auto;border:1px solid var(--border-color);border-radius:var(--radius-md);background:#fff;box-shadow:var(--shadow-sm);padding:12px}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:12px 10px;border-bottom:1px solid var(--border-color);white-space:nowrap}th{font-size:.72rem;color:var(--text-muted);text-transform:uppercase}.actions{white-space:nowrap}.actions button+button{margin-left:6px}.timeline{display:grid;gap:10px;padding:12px;background:var(--surface-muted)}.timeline article{display:grid;grid-template-columns:110px 150px 1fr;gap:10px;align-items:center;border-left:3px solid var(--primary-color);padding:8px 12px;background:#fff}.timeline time{color:var(--text-muted);font-size:12px}.empty{text-align:center;color:var(--text-muted);padding:28px}.client-form{display:grid;gap:14px}.client-form label{display:grid;gap:6px;color:var(--text-color);font-size:.84rem;font-weight:650}.form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.address-grid{grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(150px,.8fr)}@media(max-width:700px){:host{padding:20px 16px}.page-header{align-items:stretch;flex-direction:column}.timeline article{grid-template-columns:1fr}.timeline time{order:3}.form-grid,.address-grid{grid-template-columns:1fr 1fr}}`]
})
export class ClienteListaComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  readonly apiUrl = `${environment.apiUrl}/api/v1/clientes`;
  readonly estados = ESTADOS_BRASILEIROS;
  clientes: Cliente[] = [];
  clienteAberto: Cliente | null = null;
  historico: Historico[] = [];
  busca = '';
  pagina = 0;
  readonly tamanhoPagina = 10;
  totalRegistros = 0;
  carregando = false;
  modalOpen = false;
  saving = false;
  clienteEditando: Cliente | null = null;
  readonly form = this.fb.nonNullable.group({
    nome: ['', [trimmedRequired, Validators.maxLength(100)]], cpf: ['', Validators.pattern(/^$|^\d{11}$/)],
    email: ['', [Validators.email, Validators.maxLength(150)]], telefone: ['', Validators.pattern(/^$|^\d{10,11}$/)],
    dataNascimento: [''], endereco: ['', Validators.maxLength(200)], cidade: ['', Validators.maxLength(100)], estado: ['', Validators.pattern(/^$|^[a-zA-Z]{2}$/)],
    cep: ['', Validators.pattern(/^$|^\d{8}$/)],
  });

  ngOnInit() { if (isPlatformBrowser(this.platformId)) this.carregar(); }
  carregar() {
    this.carregando = true;
    const params: Record<string, string | number> = { page: this.pagina, size: this.tamanhoPagina, sort: 'nome,asc' };
    if (this.busca.trim()) params['busca'] = this.busca.trim();
    this.http.get<ClientePage>(this.apiUrl, { params }).subscribe({
      next: response => { this.clientes = response.content ?? []; this.totalRegistros = response.totalElements ?? 0; this.carregando = false; },
      error: () => this.carregando = false,
    });
  }

  buscar(valor: string): void { this.busca = valor; this.pagina = 0; this.carregar(); }
  mudarPagina(pagina: number): void { this.pagina = pagina; this.carregar(); }

  novo(): void {
    this.clienteEditando = null;
    this.form.reset();
    this.modalOpen = true;
  }

  editar(cliente: Cliente): void {
    this.clienteEditando = cliente;
    this.form.reset({
      nome: cliente.nome ?? '', cpf: cliente.cpf ?? '', email: cliente.email ?? '',
      telefone: cliente.telefone?.replace(/\D/g, '') ?? '', dataNascimento: cliente.dataNascimento ?? '',
      endereco: cliente.endereco ?? '', cidade: cliente.cidade ?? '', estado: cliente.estado ?? '',
      cep: cliente.cep?.replace(/\D/g, '') ?? '',
    });
    this.modalOpen = true;
  }

  fecharModal(): void {
    this.modalOpen = false;
    this.clienteEditando = null;
  }

  salvar(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload = {
      ...raw,
      nome: raw.nome.trim(),
      cpf: raw.cpf.replace(/\D/g, '') || undefined,
      telefone: raw.telefone.replace(/\D/g, '') || undefined,
      cep: raw.cep.replace(/\D/g, '') || undefined,
      estado: raw.estado.trim().toUpperCase() || undefined,
      email: raw.email.trim() || undefined,
      dataNascimento: raw.dataNascimento || undefined,
      endereco: raw.endereco.trim() || undefined,
      cidade: raw.cidade.trim() || undefined,
      ativo: this.clienteEditando?.ativo ?? true,
    };
    const editando = !!this.clienteEditando;
    const request = editando
      ? this.http.put(`${this.apiUrl}/${this.clienteEditando!.id}`, payload)
      : this.http.post(this.apiUrl, payload);
    this.saving = true;
    request.subscribe({
      next: () => {
        this.saving = false;
        this.fecharModal();
        this.carregar();
        this.notifications.success(editando ? 'Cliente atualizado.' : 'Cliente cadastrado.');
      },
      error: () => this.saving = false,
    });
  }

  alterarStatus(cliente: Cliente): void {
    const payload = {
      nome: cliente.nome,
      cpf: cliente.cpf?.replace(/\D/g, '') || undefined,
      email: cliente.email || undefined,
      telefone: cliente.telefone?.replace(/\D/g, '') || undefined,
      dataNascimento: cliente.dataNascimento || undefined,
      endereco: cliente.endereco || undefined,
      cidade: cliente.cidade || undefined,
      estado: cliente.estado || undefined,
      cep: cliente.cep?.replace(/\D/g, '') || undefined,
      ativo: !cliente.ativo,
    };
    this.http.put(`${this.apiUrl}/${cliente.id}`, payload).subscribe(() => {
      this.carregar();
      this.notifications.success(cliente.ativo ? 'Cliente desativado.' : 'Cliente reativado.');
    });
  }

  verHistorico(cliente: Cliente) { if (this.clienteAberto?.id === cliente.id) { this.clienteAberto = null; return; } this.clienteAberto = cliente; this.http.get<Historico[]>(`${this.apiUrl}/${cliente.id}/historico`).subscribe(res => this.historico = res); }
}
