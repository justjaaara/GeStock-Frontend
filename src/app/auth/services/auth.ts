import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  RegisterRequestBackend,
  AuthResponse,
  LoginRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ForgotPasswordResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '@/auth/interfaces/auth';
import { Router } from '@angular/router';
import { environment } from '@environments/environment.development';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { JwtUtil } from '@/core/utils/jwt.util';

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
}

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
  private _userProfile = signal<UserProfile | null>(this.getUserFromToken());

  readonly isAuthenticated = computed(() => this._isAuthenticated());
  readonly token = computed(() => this._token());
  readonly userProfile = computed(() => this._userProfile());
  readonly userName = computed(() => this._userProfile()?.name || 'Usuario');
  readonly userEmail = computed(() => this._userProfile()?.email || '');
  readonly userRole = computed(() => this._userProfile()?.role || 'Usuario');

  constructor() {
    this.initializeAuthState();
  }

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
          this.setAuthenticatedUser(response.access_token);
        }),
        catchError((error) => {
          console.error('Error en el login', error);
          return throwError(() => error);
        })
      );
  }

  forgotPassword(forgotPasswordData: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.http
      .post<ForgotPasswordResponse>(
        `${environment.BACKENDBASEURL}/auth/forgot-password`,
        forgotPasswordData,
        { headers: this.headers }
      )
      .pipe(
        tap((response) => {
          console.log('Respuesta de forgot password:', response);
        }),
        catchError((error) => {
          console.error('Error en forgot password:', error);
          return throwError(() => error);
        })
      );
  }

  resetPassword(resetPasswordData: ResetPasswordRequest): Observable<ResetPasswordResponse> {
    return this.http
      .post<ResetPasswordResponse>(
        `${environment.BACKENDBASEURL}/auth/reset-password`,
        resetPasswordData,
        { headers: this.headers }
      )
      .pipe(
        tap((response) => {
          console.log('Respuesta de reset password:', response);
        }),
        catchError((error) => {
          console.error('Error en reset password:', error);
          return throwError(() => error);
        })
      );
  }

  changePassword(changePasswordData: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    if (!this.isTokenValid()) {
      return throwError(
        () => new Error('Token inválido o expirado. Por favor inicia sesión nuevamente.')
      );
    }

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

  private checkInitialAuthState(): boolean {
    const token = localStorage.getItem('access_token');

    if (!token) {
      return false;
    }

    if (JwtUtil.isExpired(token)) {
      console.warn('Token expirado detectado al inicializar');
      this.logout();
      return false;
    }

    return true;
  }

  private getTokenFromStorage(): string | null {
    return localStorage.getItem('access_token');
  }

  private getUserFromToken(): UserProfile | null {
    const token = this.getTokenFromStorage();
    if (!token) return null;

    if (JwtUtil.isExpired(token)) {
      return null;
    }

    const decoded = JwtUtil.decode(token);
    if (!decoded) return null;

    return {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
    };
  }

  private initializeAuthState(): void {
    const token = this.getTokenFromStorage();

    if (!token) {
      this._isAuthenticated.set(false);
      this._token.set(null);
      this._userProfile.set(null);
      return;
    }

    if (JwtUtil.isValid(token)) {
      this._isAuthenticated.set(true);
      this._token.set(token);
      this._userProfile.set(this.getUserFromToken());
    } else {
      console.warn('Token inválido o expirado detectado');
      this.logout();
    }
  }

  setAuthenticatedUser(token: string): void {
    if (JwtUtil.isExpired(token)) {
      console.error('Intento de guardar un token expirado');
      this.logout();
      return;
    }

    localStorage.setItem('access_token', token);

    this._token.set(token);
    this._isAuthenticated.set(true);
    this._userProfile.set(this.getUserFromToken());
  }

  logout(): void {
    localStorage.removeItem('access_token');

    this._token.set(null);
    this._isAuthenticated.set(false);
    this._userProfile.set(null);

    this.router.navigate(['/login']);
  }

  isTokenValid(): boolean {
    const token = this._token();

    if (!token) {
      return false;
    }

    const isValid = JwtUtil.isValid(token);

    if (!isValid) {
      console.warn('Token inválido o expirado detectado, cerrando sesión');
      this.logout();
      return false;
    }

    return true;
  }

  getTokenExpirationTime(): number {
    const token = this._token();
    if (!token) return 0;

    return JwtUtil.getTimeUntilExpiration(token);
  }

  isTokenExpiringSoon(): boolean {
    const timeLeft = this.getTokenExpirationTime();
    const fiveMinutes = 5 * 60 * 1000; // 5 minutos en milisegundos

    return timeLeft > 0 && timeLeft < fiveMinutes;
  }
}
