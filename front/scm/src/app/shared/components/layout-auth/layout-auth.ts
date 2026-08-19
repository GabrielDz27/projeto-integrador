import { Component, input } from '@angular/core';

@Component({
  selector: 'app-layout-auth',
  imports: [],
  templateUrl: './layout-auth.html'
})
export class LayoutAuth {
  titulo = input<string>('Encontre pessoas para completar o seu time!');
  subtitulo = input<string>('Crie partidas ou solicite vaga em segundos — sem grupo perdido no WhatsApp.');
  badge = input<string>('TEAM UP');

  beneficios = input<string[]>([
    'Crie partidas e defina vagas/nível',
    'Solicite participação e acompanhe status',
    'Aprove/Recuse e mantenha o time organizado',
  ]);
}
