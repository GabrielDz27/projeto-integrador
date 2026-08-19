import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { UsuarioService } from './usuario-service';
import { UsuarioInterface } from '../../core/models/UsuarioInterface';

interface AuthResponse {
  'jwt-token': string;
}

@Injectable({
  providedIn: 'root',
})
export class AutenticacaoService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private userService: UsuarioService
  ) {}

  login(username: any, senha: any): Observable<HttpResponse<AuthResponse>>  {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`,
      { username, senha },
      { observe: 'response'}
    ).pipe(
      tap((response) => {
        const authToken = response.body? response.body['jwt-token'] : '';
        this.userService.salvarToken(authToken);
      })
    );
  }

  cadastrarUsuario(usuario: UsuarioInterface): Observable<HttpResponse<AuthResponse>> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/register`,
      usuario,
      { observe: 'response' }
    ).pipe(
      tap((response) => {
        const authToken = response.body ? response.body['jwt-token'] : '';
        this.userService.salvarToken(authToken);
      })
    );
  }

}
