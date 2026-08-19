import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import type { CreateUsuarioDTO, UpdateUsuarioDTO, UsuarioPerfilVM } from '../../models/usuario.models';
import { ButtonComponent } from '../../ui/button/button';
import { CloudinaryService } from '../../services/cloudinary-service';

@Component({
  selector: 'app-usuario-form',
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './usuario-form.html'
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

  readonly avatarPreviewUrl = signal<string | null>(null);
  readonly avatarUrl = signal<string | null>(null);
  readonly avatarUploading = signal(false);
  readonly avatarError = signal<string | null>(null);

  @Input() set initialValue(value: UsuarioPerfilVM | null) {
    if (!value) return;

    this.form.patchValue({
      nome: value.nome ?? '',
      email: value.email ?? '',
      telefone: value.telefone ?? '',
      cep: value.cep ?? '',
      estado: value.estado ?? '',
      cidade: value.cidade ?? '',
      username: value.username ?? '',
      biografia: value.biografia ?? '',
    });

    if (value.avatarUrl) {
      this.avatarUrl.set(value.avatarUrl);
      this.avatarPreviewUrl.set(value.avatarUrl);
    }
  }

  apiError = signal<string | null>(null);
  isSubmitting = signal(false);

  @Output() submitForm = new EventEmitter<CreateUsuarioDTO | UpdateUsuarioDTO>();

  readonly form = this.fb.nonNullable.group({
    nome: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(2)]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    telefone: this.fb.nonNullable.control('', [Validators.required]),
    cep: this.fb.nonNullable.control('', [Validators.required]),
    estado: this.fb.nonNullable.control('', [Validators.required]),
    cidade: this.fb.nonNullable.control('', [Validators.required]),
    username: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(3)]),
    biografia: this.fb.nonNullable.control(''),
    senha: this.fb.nonNullable.control('', []),
  });

  constructor() {
    this.updateSenhaValidators();
  }

  private updateSenhaValidators(): void {
    const control = this.form.controls.senha;
    control.clearValidators();

    if (this.modo === 'cadastrar') {
      control.addValidators([Validators.required, Validators.minLength(6)]);
    } else {
      control.addValidators([Validators.minLength(6)]);
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
        telefone: raw.telefone.trim(),
        cep: raw.cep.trim(),
        estado: raw.estado.trim(),
        cidade: raw.cidade.trim(),
        username: raw.username.trim(),
        biografia: raw.biografia?.trim() ?? '',
        senha: raw.senha,
        ...(avatarUrl ? { avatarUrl } : {}),
      };
      this.submitForm.emit(dto);
      return;
    }

    const dto: UpdateUsuarioDTO = {
      nome: raw.nome.trim(),
      email: raw.email.trim(),
      telefone: raw.telefone.trim(),
      cep: raw.cep.trim(),
      estado: raw.estado.trim(),
      cidade: raw.cidade.trim(),
      username: raw.username.trim(),
      biografia: raw.biografia?.trim() ?? '',
      ...(raw.senha ? { senha: raw.senha } : {}),
      ...(avatarUrl ? { avatarUrl } : {}),
    };

    this.submitForm.emit(dto);
  }
}
