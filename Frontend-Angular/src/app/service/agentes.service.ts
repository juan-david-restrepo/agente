import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Agente } from '../models/agente.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgentesService {

  // La URL debe coincidir con el server.port=60523 de tu properties
  private apiUrl = 'http://localhost:60523/agentes';

  constructor(private http: HttpClient) {}

  // ===============================
  // OBTENER TODOS LOS AGENTES
  // ===============================
  obtenerAgentes(): Observable<Agente[]> {
    return this.http.get<Agente[]>(this.apiUrl);
  }

  // ===============================
  // OBTENER AGENTE POR PLACA
  // ===============================
  // Este llamará al endpoint: GET http://localhost:60523/agentes/AT-125
  obtenerAgentePorPlaca(placa: string): Observable<Agente> {
    return this.http.get<Agente>(`${this.apiUrl}/${placa}`);
  }

  // ===============================
  // ACTUALIZAR ESTADO
  // ===============================
  // Este llamará al endpoint: PATCH http://localhost:60523/agentes/AT-125
  actualizarEstado(
    placa: string,
    estado: 'DISPONIBLE' | 'OCUPADO' | 'AUSENTE'
  ): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${placa}`, { estado });
  }
}