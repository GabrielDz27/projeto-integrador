import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioEstatisticasDTO, UpdateUsuarioDTO } from '../models/usuario.models';

@Injectable({
  providedIn: 'root',
})
export class PerfilService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}

  listarMeuPerfil():Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/usuario/me`);
  }

  atualizarMeuPerfil(dados: UpdateUsuarioDTO):Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/usuario/me`, dados);
  }

  excluirMeuPerfil():Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/usuario/me`);
  }

  estatisticas(): Observable<UsuarioEstatisticasDTO> {
    return this.http.get<UsuarioEstatisticasDTO>(`${this.apiUrl}/usuario/me/estatisticas`);
  }
}
