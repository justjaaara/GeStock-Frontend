import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { catchError, Observable, throwError } from 'rxjs';
import { Auth } from '@/auth/services/auth';
import { StockAlert, StockAlertStats, CriticalAlert, OutOfStockAlert } from '../interfaces/alerts';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  private http = inject(HttpClient);
  private authService = inject(Auth);

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.token();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return this.headers.set('Authorization', `Bearer ${token}`);
  }

  /**
   * Obtiene todas las alertas de stock activas
   */
  getAllStockAlerts(): Observable<StockAlert[]> {
    return this.http
      .get<StockAlert[]>(`${environment.BACKENDBASEURL}/alerts/stock`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error obteniendo alertas de stock:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene estadísticas de alertas
   */
  getAlertStats(): Observable<StockAlertStats> {
    return this.http
      .get<StockAlertStats>(`${environment.BACKENDBASEURL}/alerts/stock/stats`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error obteniendo estadísticas de alertas:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene alertas críticas (stock menor al mínimo)
   */
  getCriticalAlerts(): Observable<CriticalAlert[]> {
    return this.http
      .get<CriticalAlert[]>(`${environment.BACKENDBASEURL}/alerts/stock/critical`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error obteniendo alertas críticas:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene productos sin stock
   */
  getOutOfStockAlerts(): Observable<OutOfStockAlert[]> {
    return this.http
      .get<OutOfStockAlert[]>(`${environment.BACKENDBASEURL}/alerts/stock/out-of-stock`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(
        catchError((error) => {
          console.error('Error obteniendo productos sin stock:', error);
          return throwError(() => error);
        })
      );
  }
}
