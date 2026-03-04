import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, pipe, shareReplay } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class TareasService {
  private apiUrl = 'http://localhost:8080/agente';

  constructor(private http: HttpClient) {}

  // Este nombre debe coincidir con el de la imagen 8
  obtenerTareasPorAgente(placa: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${placa}`,
      { withCredentials: true }
    ).pipe(
    shareReplay(1)
  );};

  asignarTarea(placa: string, tarea: any): Observable<any> {
    return this.http.post(
      `http://localhost:8080/agente/${placa}/tareas`,
      tarea,
      { withCredentials: true },
    );
  }

  eliminarTarea(idTarea: number): Observable<any> {
    // Cambia el PUT por DELETE y usa la ruta de tareas
    return this.http.delete(`http://localhost:8080/agente/tareas/${idTarea}`, {
      withCredentials: true,
    });
  }
}
