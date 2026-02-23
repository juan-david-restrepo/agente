import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TareasService {
  private apiUrl = 'http://localhost:60523/agentes';

  constructor(private http: HttpClient) {}

  // Este nombre debe coincidir con el de la imagen 8
  obtenerTareasPorAgente(placa: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${placa}`);
  }

asignarTarea(placa: string, tarea: any): Observable<any> {
  // Ahora es un POST a la sub-ruta de tareas
  return this.http.post(`http://localhost:60523/agentes/${placa}/tareas`, tarea);
}

eliminarTarea(idTarea: number): Observable<any> {
  // Cambia el PUT por DELETE y usa la ruta de tareas
  return this.http.delete(`http://localhost:60523/agentes/tareas/${idTarea}`);
}
}