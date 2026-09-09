import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuario-lista',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page">
      <h2>Usuários</h2>
      <div class="panel">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Username</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (item of rows; track item.username) {
              <tr>
                <td>{{ item.nome }}</td>
                <td>{{ item.email }}</td>
                <td>{{ item.username }}</td>
                <td>{{ item.ativo ? 'Ativo' : 'Inativo' }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [
    `:host { display:block; padding:24px; } .page { max-width: 960px; margin:0 auto; } h2 { margin-bottom:16px; } .panel { background:#fff; border-radius:12px; padding:18px; box-shadow:0 12px 32px rgba(15,23,42,.08); } table { width:100%; border-collapse:collapse; } th, td { text-align:left; padding:12px; border-bottom:1px solid #e2e8f0; }` 
  ]
})
export class UsuarioListaComponent {
  rows = [
    { nome: 'Administrador', email: 'admin@scm.com', username: 'admin', ativo: true },
    { nome: 'João Silva', email: 'joao@scm.com', username: 'joao', ativo: true }
  ];
}
