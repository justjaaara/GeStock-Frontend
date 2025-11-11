import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from '@/auth/services/auth';

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private apiUrl = 'http://localhost:3000/api/products';

  getProductStats(): Observable<ProductStats> {
    return this.http.get<ProductStats>(`${this.apiUrl}/stats`, {
      headers: {
        Authorization: `Bearer ${this.auth.token()}`,
      },
    });
  }
}
