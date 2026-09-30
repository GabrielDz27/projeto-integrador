import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Notification } from './shared/components/notification/notification';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Notification],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'scm';
}
