import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { NotificationService } from '../../../../shared/services/notification-service';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { NumericMaskDirective } from '../../../../shared/directives/numeric-mask.directive';
import { trimmedRequired } from '../../../../shared/utils/form-validators';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ESTADOS_BRASILEIROS } from '../../../../shared/models/estados-brasileiros';

interface Fornecedor {
  id: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  ativo: boolean;
}

@Component({
  selector: 'app-fornecedor-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, NumericMaskDirective, PaginationComponent],
  template: `
    <section class="page">
      <header class="page-header"><div><p class="eyebrow">Cadastros</p><h1>Fornecedores</h1><span>Fornecedores e prestadores relacionados ao negócio.</span></div><button type="button" (click)="novo()">Novo fornecedor</button></header>
      <div class="toolbar"><input [value]="busca" (input)="buscar($any($event.target).value)" placeholder="Buscar por razão social, nome ou CNPJ" aria-label="Buscar fornecedores"></div>
      <div class="layout">
        <div class="panel table-wrap"><table><thead><tr><th>Razão social</th><th>CNPJ</th><th>Contato</th><th>Status</th><th></th></tr></thead><tbody>
          @for (fornecedor of fornecedores; track fornecedor.id) { <tr><td><strong>{{ fornecedor.razaoSocial }}</strong><small>{{ fornecedor.nomeFantasia }}</small></td><td>{{ fornecedor.cnpj }}</td><td>{{ fornecedor.email || 'Sem e-mail' }}</td><td><span [class.inactive]="!fornecedor.ativo">{{ fornecedor.ativo ? 'Ativo' : 'Inativo' }}</span></td><td class="actions"><button type="button" class="secondary" (click)="editar(fornecedor)">Editar</button><button type="button" (click)="alterarStatus(fornecedor)">{{ fornecedor.ativo ? 'Desativar' : 'Ativar' }}</button></td></tr> }
          @empty { <tr><td colspan="5" class="empty">Nenhum fornecedor encontrado.</td></tr> }
        </tbody></table><app-pagination [page]="pagina" [size]="tamanhoPagina" [total]="totalRegistros" (pageChange)="mudarPagina($event)"></app-pagination></div>
      </div>
    </section>
    <app-modal [open]="editando" (openChange)="editando = $event" [title]="form.value.id ? 'Editar fornecedor' : 'Novo fornecedor'" description="Dados cadastrais do fornecedor." [primaryLabel]="saving ? 'Salvando...' : 'Salvar fornecedor'" [primaryDisabled]="form.invalid || saving" (primary)="salvar()" (secondary)="fecharModal()">
      <form class="form" [formGroup]="form" (ngSubmit)="salvar()">
        <label>Razão social *<input formControlName="razaoSocial" autocomplete="organization" maxlength="150" [class.input-invalid]="form.controls.razaoSocial.touched && form.controls.razaoSocial.invalid"></label>
        <div class="row"><label>Nome fantasia<input formControlName="nomeFantasia" maxlength="150"></label><label>CNPJ *<input formControlName="cnpj" appNumericMask="cnpj" inputmode="numeric" maxlength="18" placeholder="00.000.000/0000-00" [class.input-invalid]="form.controls.cnpj.touched && form.controls.cnpj.invalid"></label></div>
        <div class="row"><label>E-mail<input formControlName="email" type="email" autocomplete="email" maxlength="150" [class.input-invalid]="form.controls.email.touched && form.controls.email.invalid"></label><label>Telefone<input formControlName="telefone" appNumericMask="telefone" inputmode="numeric" maxlength="15" placeholder="(00) 00000-0000" [class.input-invalid]="form.controls.telefone.touched && form.controls.telefone.invalid"></label></div>
        <label>Endereço<input formControlName="endereco" autocomplete="street-address" maxlength="200"></label>
        <div class="row"><label>Cidade<input formControlName="cidade" autocomplete="address-level2" maxlength="100"></label><label>UF<select formControlName="estado" autocomplete="address-level1" [class.input-invalid]="form.controls.estado.touched && form.controls.estado.invalid"><option value="">Selecione</option>@for (estado of estados; track estado.uf) { <option [value]="estado.uf">{{ estado.nome }}</option> }</select></label><label>CEP<input formControlName="cep" appNumericMask="cep" inputmode="numeric" maxlength="9" placeholder="00000-000" autocomplete="postal-code" [class.input-invalid]="form.controls.cep.touched && form.controls.cep.invalid"></label></div>
      </form>
    </app-modal>
  `,
  styles: [`:host{display:block;padding:32px}.page{max-width:1180px;margin:auto}.page-header{display:flex;justify-content:space-between;align-items:end;gap:18px;margin-bottom:24px}.page-header span{display:block;margin-top:6px;color:var(--text-muted);font-size:.9rem}h1{margin:0;font-size:1.8rem;color:var(--text-color)}.eyebrow{margin:0 0 6px;color:var(--primary-color);text-transform:uppercase;font-size:.72rem;font-weight:800}.toolbar{margin-bottom:16px}.toolbar input{width:100%;padding:12px 14px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:#fff;font:inherit}.layout{display:block}.panel{background:#fff;border:1px solid var(--border-color);border-radius:var(--radius-md);padding:12px;box-shadow:var(--shadow-sm)}.table-wrap{overflow:auto}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:13px 10px;border-bottom:1px solid var(--border-color);white-space:nowrap}th{font-size:.72rem;color:var(--text-muted);text-transform:uppercase}tbody tr:last-child td{border-bottom:0}small{display:block;color:var(--text-muted);margin-top:3px}td span{color:var(--success-color);font-size:13px;font-weight:700}.inactive{color:var(--warning-color)!important}.actions{white-space:nowrap}.actions button+button{margin-left:6px}button{border:0;border-radius:var(--radius-sm);background:var(--primary-color);color:#fff;padding:9px 12px;font:inherit;font-weight:650;cursor:pointer}button:hover{background:var(--primary-hover)}button:focus-visible{outline:3px solid rgb(29 78 216 / 28%);outline-offset:2px}button:disabled{opacity:.45;cursor:not-allowed}.actions button{padding:7px 10px;font-size:12px}.actions button:first-child,.actions button:last-child{background:var(--surface-muted);color:var(--text-color)}.actions button:hover{background:#e2e8f0}.form{display:grid;gap:14px}.form label{display:grid;gap:6px;font-size:.84rem;font-weight:650;color:var(--text-color)}.form input,.form select{width:100%;min-width:0;padding:10px 11px;border:1px solid var(--border-color);border-radius:var(--radius-sm);background:#fff;font:inherit;font-weight:400}.form input:focus,.form select:focus{border-color:var(--primary-color);outline:0;box-shadow:0 0 0 3px rgb(29 78 216 / 12%)}.form input.input-invalid,.form select.input-invalid{border-color:#dc2626}.row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.empty{text-align:center;color:var(--text-muted);padding:28px}@media(max-width:800px){:host{padding:20px 16px}.page-header{align-items:stretch;flex-direction:column}.row{grid-template-columns:1fr 1fr}}`]
})
export class FornecedorListaComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly fb = inject(FormBuilder);
  private readonly notifications = inject(NotificationService);
  readonly apiUrl = `${environment.apiUrl}/api/v1/fornecedores`;
  readonly estados = ESTADOS_BRASILEIROS;
  fornecedores: Fornecedor[] = [];
  busca = '';
  pagina = 0;
  readonly tamanhoPagina = 10;
  totalRegistros = 0;
  editando = false;
  saving = false;
  form = this.fb.group({ id: [''], razaoSocial: ['', [trimmedRequired, Validators.maxLength(150)]], nomeFantasia: ['', Validators.maxLength(150)], cnpj: ['', [trimmedRequired, Validators.pattern(/^\d{14}$/)]], email: ['', [Validators.email, Validators.maxLength(150)]], telefone: ['', Validators.pattern(/^$|^\d{10,11}$/)], endereco: ['', Validators.maxLength(200)], cidade: ['', Validators.maxLength(100)], estado: ['', Validators.pattern(/^[a-zA-Z]{2}$/)], cep: ['', Validators.pattern(/^\d{8}$/)] });

  ngOnInit() { if (isPlatformBrowser(this.platformId)) this.carregar(); }
  carregar() { const params: Record<string, string | number> = { page: this.pagina, size: this.tamanhoPagina, sort: 'razaoSocial,asc' }; if (this.busca.trim()) params['busca'] = this.busca.trim(); this.http.get<{ content: Fornecedor[]; totalElements: number }>(this.apiUrl, { params }).subscribe(res => { this.fornecedores = res.content ?? []; this.totalRegistros = res.totalElements ?? 0; }); }
  buscar(valor: string) { this.busca = valor; this.carregar(); }
  mudarPagina(pagina: number) { this.pagina = pagina; this.carregar(); }
  novo() { this.form.reset(); this.editando = true; }
  editar(fornecedor: Fornecedor) { this.form.reset({ id: fornecedor.id, razaoSocial: fornecedor.razaoSocial, nomeFantasia: fornecedor.nomeFantasia ?? '', cnpj: fornecedor.cnpj, email: fornecedor.email ?? '', telefone: fornecedor.telefone?.replace(/\D/g, '') ?? '', endereco: fornecedor.endereco ?? '', cidade: fornecedor.cidade ?? '', estado: fornecedor.estado ?? '', cep: fornecedor.cep?.replace(/\D/g, '') ?? '' }); this.editando = true; }
  fecharModal() { this.editando = false; }
  salvar() { if (this.form.invalid || this.saving) { this.form.markAllAsTouched(); return; } const valor = this.form.getRawValue(); const atualizando = !!valor.id; const { id, ...campos } = valor; const ativo = this.fornecedores.find(fornecedor => fornecedor.id === id)?.ativo ?? true; const payload = { ...campos, razaoSocial: campos.razaoSocial?.trim(), nomeFantasia: campos.nomeFantasia?.trim() || undefined, cnpj: campos.cnpj?.replace(/\D/g, ''), email: campos.email?.trim() || undefined, telefone: campos.telefone?.replace(/\D/g, '') || undefined, endereco: campos.endereco?.trim() || undefined, cidade: campos.cidade?.trim() || undefined, estado: campos.estado?.trim().toUpperCase() || undefined, cep: campos.cep?.replace(/\D/g, '') || undefined, ativo }; const request = atualizando ? this.http.put(`${this.apiUrl}/${id}`, payload) : this.http.post(this.apiUrl, payload); this.saving = true; request.subscribe({ next: () => { this.saving = false; this.editando = false; this.carregar(); this.notifications.success(atualizando ? 'Fornecedor atualizado.' : 'Fornecedor cadastrado.'); }, error: () => this.saving = false }); }
  desativar(fornecedor: Fornecedor) { this.http.delete(`${this.apiUrl}/${fornecedor.id}`).subscribe(() => { this.carregar(); this.notifications.success('Fornecedor desativado.'); }); }
  alterarStatus(fornecedor: Fornecedor) { if (fornecedor.ativo) { this.desativar(fornecedor); return; } const { id: _id, ...payload } = fornecedor; this.http.put(`${this.apiUrl}/${fornecedor.id}`, { ...payload, ativo: true }).subscribe(() => { this.carregar(); this.notifications.success('Fornecedor reativado.'); }); }
}
