import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment.development';
import type { Category, MeasurementType } from '@/core-ui/interfaces/product';

export interface Product {
  productCode: string;
  productName: string;
  productDescription: string;
  productCategory: string;
  currentStock: number;
  minimunStock: number;
  unitPrice: number;
  productState: string;
  lotId: number;
  measurementType: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface InventoryResponse {
  data: Product[];
  pagination: PaginationInfo;
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private http = inject(HttpClient);

  getInventory(page: number = 1, limit: number = 20): Observable<InventoryResponse> {
    return this.http.get<InventoryResponse>(
      `${environment.BACKENDBASEURL}/inventory?page=${page}&limit=${limit}`
    );
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${environment.BACKENDBASEURL}/products/categories`);
  }

  getMeasurementTypes(): Observable<MeasurementType[]> {
    return this.http.get<MeasurementType[]>(
      `${environment.BACKENDBASEURL}/products/measurement-types`
    );
  }
}
