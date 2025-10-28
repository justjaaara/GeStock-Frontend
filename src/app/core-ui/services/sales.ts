import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
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

export interface SaleMovement {
  movementId: number;
  movementDate: string;
  productName: string;
  movementType: string;
  movementReason: string;
  quantity: number;
  userName: string;
  reference: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface SalesHistoryResponse {
  data: SaleMovement[];
  pagination: PaginationInfo;
}

export interface SalesStats {
  totalSales: number;
  totalQuantitySold: number;
  salesToday: number;
  quantitySoldToday: number;
  topSellingProduct: {
    productCode: string;
    productName: string;
    totalQuantity: number;
  } | null;
}

@Injectable({
  providedIn: 'root',
})
export class SalesService {
  private http = inject(HttpClient);

  createSale(saleDto: CreateSaleDto): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(`${environment.BACKENDBASEURL}/sales/create`, saleDto);
  }

  getSalesHistory(page: number = 1, limit: number = 20): Observable<SalesHistoryResponse> {
    const url = `${environment.BACKENDBASEURL}/historical-movements/reason/sales?page=${page}&limit=${limit}`;
    return this.http.get<any>(url).pipe(
      catchError((error: any) => {
        console.error('Error in getSalesHistory:', error);
        throw error;
      })
    );
  }

  getFilteredSales(
    startDate?: string,
    endDate?: string,
    page: number = 1,
    limit: number = 20
  ): Observable<SalesHistoryResponse> {
    let url = `${environment.BACKENDBASEURL}/sales/filtered/date-range?page=${page}&limit=${limit}`;

    if (startDate) {
      url += `&startDate=${startDate}`;
    }
    if (endDate) {
      url += `&endDate=${endDate}`;
    }

    return this.http.get<any>(url).pipe(
      catchError((error: any) => {
        console.error('Error in getFilteredSales:', error);
        throw error;
      })
    );
  }

  getSalesStats(): Observable<SalesStats> {
    const url = `${environment.BACKENDBASEURL}/sales/stats`;
    return this.http.get<SalesStats>(url).pipe(
      catchError((error: any) => {
        console.error('Error in getSalesStats:', error);
        throw error;
      })
    );
  }
}
