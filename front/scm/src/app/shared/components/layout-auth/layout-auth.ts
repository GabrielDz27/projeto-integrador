import { Component, input } from '@angular/core';

@Component({
  selector: 'app-layout-auth',
  imports: [],
  templateUrl: './layout-auth.html',
  styleUrl: './layout-auth.css'
})
export class LayoutAuth {
  titulo = input<string>('Gestão contábil simples para o seu negócio');
  subtitulo = input<string>('Centralize clientes, faturamento e obrigações do MEI em um só lugar.');
  badge = input<string>('SCM');

  beneficios = input<string[]>([
    'Acompanhe o faturamento e o limite anual do MEI',
    'Organize clientes e lançamentos financeiros',
    'Controle suas obrigações e a Guia DAS',
  ]);
}
