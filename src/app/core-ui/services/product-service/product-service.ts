import { CreateProductDto, ResponseProductDto } from '@/core-ui/interfaces/product';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment.development';
import { catchError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);

  private headers = new HttpHeaders({
    'Content-Type': 'application/json',
  });

  createProduct(productDto: CreateProductDto) {
    return this.http
      .post<ResponseProductDto>(`${environment.BACKENDBASEURL}/products`, productDto, {
        headers: this.headers,
      })
      .pipe(
        tap((response) => {
          console.log('Producto creado:', response);
        }),
        catchError((error) => {
          console.error('Error al crear el producto:', error);
          throw error;
        })
      );
  }
}
