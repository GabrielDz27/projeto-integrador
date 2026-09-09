import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-servico-lista',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page">
      <h2>Serviços</h2>
      <div class="panel">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Preço</th>
            </tr>
          </thead>
          <tbody>
            @for (servico of servicos; track servico.nome) {
              <tr>
                <td>{{ servico.nome }}</td>
                <td>{{ servico.descricao }}</td>
                <td>{{ servico.preco }}</td>
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
export class ServicoListaComponent {
  servicos = [
    { nome: 'Assessoria Contábil', descricao: 'Acompanhamento fiscal', preco: 'R$ 500,00' },
    { nome: 'Declaração IRPF', descricao: 'Entrega e suporte', preco: 'R$ 350,00' }
  ];
}
