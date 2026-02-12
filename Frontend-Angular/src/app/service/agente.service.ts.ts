import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';


export interface Usuario {
  id: number;
  nombreCompleto: string;
  email: string;
  numeroDocumento: string;
  tipoDocumento: string;
  role: string;
  celular: string;
  placa?: string;
}


@Injectable({
  providedIn: 'root',
})
export class AgenteServiceTs {
  
  private apiUrl = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient) {}

  getPerfil(): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/me`);
  }

}
