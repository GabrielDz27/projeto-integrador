import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { BehaviorSubject } from 'rxjs';
import { UsuarioInterface } from '../../core/models/UsuarioInterface';
import { TokenService } from './token-service';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private userSubject = new BehaviorSubject<UsuarioInterface | null>(null);

  constructor(private tokenService: TokenService) {
    if(this.tokenService.possuiToken()) {
      this.decodificarJWT();
    }
  }

  retornarfoto(){
    return this.userSubject.value?.avatarUrl;
  }

  private decodificarJWT() {
    const token = this.tokenService.retornarToken();
    try {
      const user = jwtDecode(token) as any;
      this.userSubject.next(user);
    } catch (error) {
      console.error("Erro ao decodificar token", error);
      this.logout();
    }
  }

  salvarToken(token: string) {
    this.tokenService.salvarToken(token);
    this.decodificarJWT();
  }

  logout() {
    this.tokenService.excluirToken();
    this.userSubject.next(null);
  }

  estaLogado() {
    return this.tokenService.possuiToken();
  }
}
