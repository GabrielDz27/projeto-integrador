import { Component, inject } from '@angular/core';
import { NotificationService } from '../../services/notification-service';

@Component({
  selector: 'app-notification',
  standalone: true,
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification {
  readonly notifications = inject(NotificationService);
}