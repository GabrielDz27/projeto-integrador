import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { autenticacaoInterceptor } from './core/interceptors/autenticacao-interceptor';
import { notificationInterceptor } from './core/interceptors/notification-interceptor';

registerLocaleData(localePt, 'pt-BR');

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), { provide: LOCALE_ID, useValue: 'pt-BR' }, provideRouter(routes), provideHttpClient(withInterceptors([autenticacaoInterceptor, notificationInterceptor])), provideClientHydration(withEventReplay())]
};
