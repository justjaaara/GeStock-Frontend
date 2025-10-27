export interface StockAlert {
  productId: number;
  productCode: string;
  productName: string;
  productDescription: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  deficit: number;
  unitPrice: number;
  state: string;
  measurementType: string;
  lotId: number;
  alertDate: Date | string;
  alertType: 'Sin Stock' | 'Crítico' | 'Mínimo';
  priority: 'alta' | 'media' | 'baja';
}

export interface StockAlertStats {
  totalAlerts: number;
  criticalAlerts: number;
  outOfStockAlerts: number;
  minimumStockAlerts: number;
}

export interface CriticalAlert {
  productId: number;
  productCode: string;
  productName: string;
  currentStock: number;
  minimumStock: number;
  deficit: number;
  category: string;
  alertDate: Date | string;
}

export interface OutOfStockAlert {
  productId: number;
  productCode: string;
  productName: string;
  category: string;
  minimumStock: number;
  alertDate: Date | string;
}
