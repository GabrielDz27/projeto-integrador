import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import type { CreateUsuarioDTO, UpdateUsuarioDTO, UsuarioPerfilVM } from '../../models/usuario.models';
import { CloudinaryService } from '../../services/cloudinary-service';
import { NumericMaskDirective } from '../../directives/numeric-mask.directive';
import { minTrimmedLength, trimmedRequired } from '../../utils/form-validators';

@Component({
  selector: 'app-usuario-form',
  imports: [CommonModule, ReactiveFormsModule, NumericMaskDirective],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css'
})
export class UsuarioForm {
  private readonly fb = inject(FormBuilder);
  private readonly cloudinary = inject(CloudinaryService);

  private _modo: 'cadastrar' | 'editar' = 'cadastrar';

  @Input() set modo(value: 'cadastrar' | 'editar') {
    this._modo = value ?? 'cadastrar';
    this.updateSenhaValidators();
  }
  get modo(): 'cadastrar' | 'editar' {
    return this._modo;
  }

  @Input() submitting = false;

  readonly avatarPreviewUrl = signal<string | null>(null);
  readonly avatarUrl = signal<string | null>(null);
  readonly avatarUploading = signal(false);
  readonly avatarError = signal<string | null>(null);
  readonly estados = [
    { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
    { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
    { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' }, { uf: 'GO', nome: 'Goiás' },
    { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' }, { uf: 'MS', nome: 'Mato Grosso do Sul' },
    { uf: 'MG', nome: 'Minas Gerais' }, { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' },
    { uf: 'PR', nome: 'Paraná' }, { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
    { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' }, { uf: 'RS', nome: 'Rio Grande do Sul' },
    { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
    { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' },
  ];

  @Input() set initialValue(value: UsuarioPerfilVM | null) {
    if (!value) return;

    this.form.patchValue({
      nome: value.nome ?? '',
      email: value.email ?? '',
      telefone: (value.telefone ?? '').replace(/\D/g, '').slice(0, 11),
      cep: (value.cep ?? '').replace(/\D/g, '').slice(0, 8),
      estado: value.estado ?? '',
      cidade: value.cidade ?? '',
      username: value.username ?? '',
    });

    if (value.avatarUrl) {
      this.avatarUrl.set(value.avatarUrl);
      this.avatarPreviewUrl.set(value.avatarUrl);
    }
  }

  apiError = signal<string | null>(null);

  @Output() submitForm = new EventEmitter<CreateUsuarioDTO | UpdateUsuarioDTO>();

  readonly form = this.fb.nonNullable.group({
    nome: this.fb.nonNullable.control('', [trimmedRequired, minTrimmedLength(2), Validators.maxLength(150)]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email, Validators.maxLength(250)]),
    telefone: this.fb.nonNullable.control('', [Validators.pattern(/^\d{10,11}$/)]),
    cep: this.fb.nonNullable.control('', [Validators.pattern(/^\d{8}$/)]),
    estado: this.fb.nonNullable.control('', [Validators.required]),
    cidade: this.fb.nonNullable.control('', [trimmedRequired, Validators.maxLength(150)]),
    username: this.fb.nonNullable.control('', [trimmedRequired, minTrimmedLength(3), Validators.maxLength(50)]),
    senha: this.fb.nonNullable.control('', []),
  });

  constructor() {
    this.updateSenhaValidators();
  }

  private updateSenhaValidators(): void {
    const control = this.form.controls.senha;
    control.clearValidators();

    if (this.modo === 'cadastrar') {
      control.addValidators([trimmedRequired, minTrimmedLength(6)]);
    } else {
      control.addValidators(minTrimmedLength(6));
    }

    control.updateValueAndValidity({ emitEvent: false });
  }

  onAvatarPicked(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      this.avatarError.set('Formato inválido. Use JPG, PNG ou WebP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.avatarError.set('Imagem muito grande. Máximo 5MB.');
      return;
    }

    this.avatarError.set(null);

    const localPreview = URL.createObjectURL(file);
    this.avatarPreviewUrl.set(localPreview);

    this.avatarUploading.set(true);
    this.cloudinary.uploadAvatar(file).subscribe({
      next: (res) => {
        this.avatarUrl.set(res.secure_url);
        this.avatarUploading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.avatarError.set('Não foi possível enviar a imagem.');
        this.avatarUploading.set(false);
      },
    });
  }

  clearAvatar(): void {
    this.avatarPreviewUrl.set(null);
    this.avatarUrl.set(null);
    this.avatarError.set(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.avatarUploading()) {
      this.apiError.set('Aguarde o envio da imagem terminar.');
      return;
    }

    const raw = this.form.getRawValue();
    const avatarUrl = this.avatarUrl() ?? undefined;

    if (this.modo === 'cadastrar') {
      const dto: CreateUsuarioDTO = {
        nome: raw.nome.trim(),
        email: raw.email.trim(),
        telefone: this.optionalDigits(raw.telefone),
        cep: this.optionalDigits(raw.cep),
        estado: raw.estado.trim().toUpperCase(),
        cidade: raw.cidade.trim(),
        username: raw.username.trim(),
        senha: raw.senha,
        ...(avatarUrl ? { avatarUrl } : {}),
      };
      this.submitForm.emit(dto);
      return;
    }

    const dto: UpdateUsuarioDTO = {
      nome: raw.nome.trim(),
      email: raw.email.trim(),
      telefone: this.optionalDigits(raw.telefone),
      cep: this.optionalDigits(raw.cep),
      estado: raw.estado.trim().toUpperCase(),
      cidade: raw.cidade.trim(),
      username: raw.username.trim(),
      ...(raw.senha.trim() ? { senha: raw.senha.trim() } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
    };

    this.submitForm.emit(dto);
  }

  private optionalDigits(value: string): string | undefined {
    return value.replace(/\D/g, '') || undefined;
  }
}
