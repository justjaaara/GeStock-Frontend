import { environment } from '@environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RegisterRequestBackend, AuthResponse, LoginRequest } from '@/auth/interfaces/auth';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  register(registerData: RegisterRequestBackend): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.backendBaseUrl}/auth/register`, registerData, {
        headers: this.headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Error en registro:', error);
          return throwError(() => error);
        })
      );
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.backendBaseUrl}/auth/login`, loginData, {
        headers: this.headers,
      })
      .pipe(
        catchError((error) => {
          console.error('Error en el login', error);
          return throwError(() => error);
        })
      );
  }
}
