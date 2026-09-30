import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { TokenService } from '../../shared/services/token-service';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';


export const autenticacaoInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);
  const token = tokenService.retornarToken();

  if(req.url.includes('api.cloudinary.com'))
    return next(req);

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        console.warn('Sessão expirada ou acesso negado. Limpando token...');
        
        tokenService.excluirToken(); 
        router.navigate(['/login']); 
      }
      
      return throwError(() => error);
    })
  );

};
