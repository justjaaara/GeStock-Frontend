import { environment } from './../../../environments/environment.example';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RegisterRequestBackend, AuthResponse } from '../interfaces/auth';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private http: HttpClient) {}

  register(registerData: RegisterRequestBackend): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http
      .post<AuthResponse>(`${environment.backendBaseUrl}/auth/register`, registerData, { headers })
      .pipe(
        catchError((error) => {
          console.error('Error en registro:', error);
          return throwError(() => error);
        })
      );
  }
}
