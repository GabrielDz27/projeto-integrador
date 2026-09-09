import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cliente-lista',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page">
      <h2>Clientes</h2>
      <div class="panel">
        <p>Gestão de clientes integrada ao backend.</p>
        @for (cliente of clientes; track cliente.nome) {
          <div class="item">
            <strong>{{ cliente.nome }}</strong>
            <span>{{ cliente.email }}</span>
          </div>
        }
      </div>
    </section>
  `,
  styles: [
    `:host { display:block; padding:24px; } .page { max-width: 960px; margin:0 auto; } h2 { margin-bottom:16px; } .panel { background:#fff; border-radius:12px; padding:18px; box-shadow:0 12px 32px rgba(15,23,42,.08); display:grid; gap:12px; } .item { display:flex; justify-content:space-between; padding:10px 12px; border:1px solid #e2e8f0; border-radius:10px; }` 
  ]
})
export class ClienteListaComponent {
  clientes = [
    { nome: 'Maria Souza', email: 'maria@empresa.com' },
    { nome: 'Pedro Lima', email: 'pedro@empresa.com' }
  ];
}
