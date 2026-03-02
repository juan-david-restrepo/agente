import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Usuario {
  nombreCompleto: string;
  email: string;
  password?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // API apuntando solo a ciudadano
  private apiUrl = 'http://localhost:8080/api/ciudadano';

  constructor(private http: HttpClient) {}

  // ================= GET perfil =================
  getProfile(): Observable<Usuario> {
    const token = localStorage.getItem('token');
    return this.http.get<Usuario>(`${this.apiUrl}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
  }

  // ================= GET total de reportes =================
  getTotalReportes(): Observable<{ total_reportes: number }> {
    const token = localStorage.getItem('token');
    return this.http.get<{ total_reportes: number }>(`${this.apiUrl}/reportes/total`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
  }

  // ================= PUT actualizar perfil =================
  updateProfile(data: Usuario): Observable<Usuario> {
    const token = localStorage.getItem('token');
    return this.http.put<Usuario>(`${this.apiUrl}/profile`, data, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true
    });
  }
}