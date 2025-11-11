import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from '@/auth/services/auth';

export interface InventoryReportProduct {
  productId: number;
  productCode: string;
  productName: string;
  productDescription: string;
  categoryName: string;
  productState: string;
  measurementName: string;
  availableUnits: number;
  minimumStock: number;
  unitPrice: number;
  totalValue: number;
  lotCode: string;
  lastUpdate: Date;
}

export interface InventoryReportSummary {
  totalProducts: number;
  totalUnits: number;
  totalInventoryValue: number;
  lowStockProducts: number;
  products: InventoryReportProduct[];
}

export interface SalesByCategoryProduct {
  categoryId: number;
  categoryName: string;
  productId: number;
  productCode: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  unitPrice: number;
  unitsSold: number;
  totalSalesValue: number;
  lastUpdate: Date;
}

export interface SalesByCategorySummary {
  totalCategories: number;
  totalProducts: number;
  totalUnitsSold: number;
  totalSalesValue: number;
  topCategory: string;
  products: SalesByCategoryProduct[];
}

export interface IncomeByLotItem {
  lotId: number;
  lotCode: string;
  lotDescription: string;
  entryDate: Date;
  productId: number;
  productCode: string;
  productName: string;
  categoryName: string;
  measurementName: string;
  currentUnits: number;
  unitPrice: number;
  totalValue: number;
  productState: string;
  lastUpdate: Date;
}

export interface IncomeByLotSummary {
  totalLots: number;
  totalProducts: number;
  totalUnits: number;
  totalValue: number;
  mostRecentEntry: Date;
  items: IncomeByLotItem[];
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private apiUrl = 'http://localhost:3000/api/inventory';

  getInventoryReport(): Observable<InventoryReportSummary> {
    return this.http.get<InventoryReportSummary>(`${this.apiUrl}/report`, {
      headers: {
        Authorization: `Bearer ${this.auth.token()}`,
      },
    });
  }

  getSalesByCategoryReport(): Observable<SalesByCategorySummary> {
    return this.http.get<SalesByCategorySummary>(`${this.apiUrl}/report/sales-by-category`, {
      headers: {
        Authorization: `Bearer ${this.auth.token()}`,
      },
    });
  }

  getIncomeByLotReport(): Observable<IncomeByLotSummary> {
    return this.http.get<IncomeByLotSummary>(`${this.apiUrl}/report/income-by-lot`, {
      headers: {
        Authorization: `Bearer ${this.auth.token()}`,
      },
    });
  }
}
