import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../../shared/services/notification-service';
import { extractApiError } from '../../shared/utils/http-error';

export const notificationInterceptor: HttpInterceptorFn = (request, next) => {
  const notifications = inject(NotificationService);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        notifications.error(extractApiError(error, 'Não foi possível concluir a solicitação.'));
      }
      return throwError(() => error);
    }),
  );
};