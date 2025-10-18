import { environment } from '@environments/environment.development';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  RegisterRequestBackend,
  AuthResponse,
  LoginRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
} from '@/auth/interfaces/auth';
import { catchError, Observable, throwError, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });
  private http = inject(HttpClient);
  private router = inject(Router);

  private _isAuthenticated = signal<boolean>(this.checkInitialAuthState());
  private _token = signal<string | null>(this.getTokenFromStorage());

  readonly isAuthenticated = computed(() => this._isAuthenticated());
  readonly token = computed(() => this._token());

  // readonly isAuthenticated = this._isAuthenticated;
  // readonly token = this._token;

  register(registerData: RegisterRequestBackend): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(
        `${environment.BACKENDBASEURL}/auth/register`,
        { ...registerData, roleId: 1 },
        {
          headers: this.headers,
        }
      )
      .pipe(
        tap((response) => {
          // Establecer estado después del login exitoso
          this.setAuthenticatedUser(response.access_token);
        }),
        catchError((error) => {
          console.error('Error en registro:', error);
          return throwError(() => error);
        })
      );
  }

  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.BACKENDBASEURL}/auth/login`, loginData, {
        headers: this.headers,
      })
      .pipe(
        tap((response) => {
          // Establecer estado después del login exitoso
          this.setAuthenticatedUser(response.access_token);
        }),
        catchError((error) => {
          console.error('Error en el login', error);
          return throwError(() => error);
        })
      );
  }

  private checkInitialAuthState(): boolean {
    const token = localStorage.getItem('access_token');
    if (token) return true;
    return false;
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem('access_token');
  }

  private initializeAuthState(): void {
    const token = this.getTokenFromStorage();

    // TODO: EXTRAER DEL TOKEN SI ESTÁ AUTENTICADO
    this._isAuthenticated.set(!!token);
    this._token.set(token);
  }

  setAuthenticatedUser(token: string): void {
    localStorage.setItem('access_token', token);

    this._token.set(token);
    this._isAuthenticated.set(true);
  }

  logout(): void {
    localStorage.removeItem('access_token');

    this._token.set(null);
    this._isAuthenticated.set(false);

    this.router.navigate(['/login']);
  }

  isTokenValid(): boolean {
    const token = this._token();
    if (!token) return false;

    return true;
  }

  changePassword(changePasswordData: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    const token = this._token();

    if (!token) {
      return throwError(() => new Error('No hay token de autenticación'));
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    return this.http
      .patch<ChangePasswordResponse>(
        `${environment.BACKENDBASEURL}/users/change-password`,
        changePasswordData,
        { headers }
      )
      .pipe(
        tap((response: ChangePasswordResponse) => {}),
        catchError((error) => {
          return throwError(() => error);
        })
      );
  }
}
