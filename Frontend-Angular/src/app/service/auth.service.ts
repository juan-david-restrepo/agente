import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';

  private authState = new BehaviorSubject<boolean>(false);
  authState$ = this.authState.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login`,
      { email, password },
      { withCredentials: true },
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data, {
      withCredentials: true,
    });
  }

  logout(): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.setLoggedIn(false); // ✅ AQUÍ VA
        }),
      );
  }

  setAuthenticated(isAuth: boolean) {
    this.authState.next(isAuth);
  }

  setLoggedIn(state: boolean) {
    this.authState.next(state);
  }

  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`, {
      withCredentials: true,
    });
  }
}

