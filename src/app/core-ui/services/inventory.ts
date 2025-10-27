import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '@environments/environment.development';
import type { Category, MeasurementType } from '@/core-ui/interfaces/product';

export interface Product {
  productId?: number; // Agregado para el endpoint /products/${code}
  productCode: string;
  productName: string;
  productDescription: string;
  productCategory: string;
  currentStock: number;
  minimumStock?: number; // Ortografía correcta
  minimunStock?: number; // Ortografía del backend (typo)
  unitPrice: number;
  productState?: string;
  lotId: number | null;
  measurementType?: string;
  measurementName?: string; // Agregado para el endpoint /products/${code}
  stateName?: string; // Agregado para el endpoint /products/${code}
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProductDto {
  productName?: string;
  productDescription?: string;
  unitPrice?: number;
  categoryId?: number;
}

export interface UpdateProductResponse {
  productId: number;
  productName: string;
  productDescription: string;
  productCode: string;
  unitPrice: number;
  categoryName: string;
  measurementName: string;
  stateName: string;
  actualStock: number;
  minimumStock: number;
  createdAt: string;
}

export interface DeleteProductResponse {
  message: string;
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

export interface Closure {
  headerId: number;
  closureDate: string;
  closureMonth: number;
  closureYear: number;
  userName: string;
  status: string;
}

export interface ClosuresResponse {
  data: Closure[];
  pagination: PaginationInfo;
}

export interface ClosureDetail {
  closureId: number;
  closureDate: string;
  finalStock: number;
  lotId: number | null;
  productName: string;
  userName: string;
  headerId: number;
}

export interface ClosureDetailsResponse {
  data: ClosureDetail[];
  pagination: PaginationInfo;
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private http = inject(HttpClient);

  getInventory(page: number = 1, limit: number = 20): Observable<InventoryResponse> {
    const url = `${environment.BACKENDBASEURL}/inventory?page=${page}&limit=${limit}`;
    console.log('🔍 Fetching inventory from:', url);
    return this.http.get<InventoryResponse>(url).pipe(
      tap((response: InventoryResponse) => {
        console.log('📦 Raw inventory response:', response);
        console.log('📦 First product sample:', response.data[0]);
        if (response.data[0]) {
          console.log('📊 minimumStock value:', response.data[0].minimumStock);
          console.log('📊 minimunStock value (typo):', response.data[0].minimunStock);
          console.log(
            '📊 Using:',
            response.data[0].minimunStock || response.data[0].minimumStock || 0
          );
        }
      }),
      catchError((error: any) => {
        console.error('❌ Error fetching inventory:', error);
        throw error;
      })
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

  updateProduct(
    productCode: string,
    updateData: UpdateProductDto
  ): Observable<UpdateProductResponse> {
    return this.http.put<UpdateProductResponse>(
      `${environment.BACKENDBASEURL}/products/${productCode}`,
      updateData
    );
  }

  deleteProduct(productCode: string): Observable<DeleteProductResponse> {
    return this.http.delete<DeleteProductResponse>(
      `${environment.BACKENDBASEURL}/products/${productCode}`
    );
  }

  getFilteredInventory(
    page: number = 1,
    limit: number = 20,
    categoryName?: string,
    stockLevel?: string,
    state?: string
  ): Observable<InventoryResponse> {
    let url = `${environment.BACKENDBASEURL}/inventory/filtered?page=${page}&limit=${limit}`;

    if (categoryName) {
      url += `&categoryName=${encodeURIComponent(categoryName)}`;
    }
    if (stockLevel) {
      url += `&stockLevel=${stockLevel}`;
    }
    if (state) {
      url += `&state=${state}`;
    }

    return this.http.get<InventoryResponse>(url);
  }

  getProductByCode(productCode: string): Observable<Product> {
    return this.http.get<any>(`${environment.BACKENDBASEURL}/products/${productCode}`).pipe(
      tap((response) => {
        console.log('Raw backend response from /products/${productCode}:', response);
      }),
      map((response) => {
        // Map backend field names to frontend Product interface
        const mappedProduct: Product = {
          productId: response.productId,
          productName: response.productName,
          productDescription: response.productDescription,
          productCode: response.productCode,
          unitPrice: response.unitPrice,
          productCategory: response.categoryName, // Map categoryName to productCategory
          currentStock: response.actualStock, // Map actualStock to currentStock
          minimumStock: response.minimumStock,
          minimunStock: response.minimunStock, // In case backend has typo
          lotId: response.lotId || null,
          measurementName: response.measurementName,
          stateName: response.stateName,
          createdAt: response.createdAt,
          updatedAt: response.updatedAt,
        };
        console.log('Mapped product for frontend:', mappedProduct);
        return mappedProduct;
      })
    );
  }

  updateStock(data: {
    productId: number;
    lotId: number | null;
    quantity: number;
    productCode: string;
    userId: number;
    type: string;
    movementReason: 'AJUSTE INVENTARIO' | 'DEVOLUCION CLIENTE' | 'DAÑO';
  }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.BACKENDBASEURL}/inventory/update-stock`,
      data
    );
  }

  getClosures(page: number = 1, limit: number = 20): Observable<ClosuresResponse> {
    const url = `${environment.BACKENDBASEURL}/inventory/closures?page=${page}&limit=${limit}`;
    console.log('🔍 Fetching closures from:', url);
    return this.http.get<ClosuresResponse>(url).pipe(
      tap((response: ClosuresResponse) => {
        console.log('📦 Raw closures response:', response);
        console.log('📦 First closure sample:', response.data[0]);
        if (response.data[0]) {
          console.log('📊 Closure status:', response.data[0].status);
          console.log('📊 Closure date:', response.data[0].closureDate);
        }
      }),
      catchError((error: any) => {
        console.error('❌ Error fetching closures:', error);
        throw error;
      })
    );
  }

  getClosureDetails(
    headerId: number,
    page: number = 1,
    limit: number = 20
  ): Observable<ClosureDetailsResponse> {
    const url = `${environment.BACKENDBASEURL}/inventory/closures/${headerId}/details?page=${page}&limit=${limit}`;
    console.log('🔍 Fetching closure details from:', url);
    return this.http.get<ClosureDetailsResponse>(url).pipe(
      tap((response: ClosureDetailsResponse) => {
        console.log('📦 Raw closure details response:', response);
        console.log('📦 First closure detail sample:', response.data[0]);
      }),
      catchError((error: any) => {
        console.error('❌ Error fetching closure details:', error);
        throw error;
      })
    );
  }
}
