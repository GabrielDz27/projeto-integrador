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
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly userService: UsuarioService
  ) {}

  login(username: string, senha: string): Observable<HttpResponse<AuthResponse>> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/auth/login`,
      { username, senha },
      { observe: 'response' }
    ).pipe(
      tap((response) => {
        const authToken = response.body ? response.body['jwt-token'] : '';
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

  solicitarRecuperacaoSenha(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/recuperar-senha-solicitar`, { email });
  }

  confirmarRecuperacaoSenha(token: string, novaSenha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/recuperar-senha-confirmar`, { token, novaSenha });
  }
}
