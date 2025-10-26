import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment.development';

export interface CreateSaleDto {
  productCode: string;
  quantity: number;
}

export interface SaleResponse {
  id: number;
  productCode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private http = inject(HttpClient);

  createSale(saleDto: CreateSaleDto): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(`${environment.BACKENDBASEURL}/sales/create`, saleDto);
  }
}
