import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private authState = new BehaviorSubject<boolean>(!!localStorage.getItem('token'));
  authState$ = this.authState.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password });
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  // 🔥 Activar sesión
  setSession(token: string) {
    localStorage.setItem('token', token);
    this.authState.next(true);
  }

  logout() {
    localStorage.clear();
    this.authState.next(false);
  }
}
