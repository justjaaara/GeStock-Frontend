export interface CreateProductDto {
  productName: string;
  productDescription?: string;
  unitPrice: number;
  categoryId: number;
  measurementId: number;
  actualStock: number;
  minimumStock?: number;
  lotId?: number;
}

export interface ResponseProductDto extends CreateProductDto {
  productCode: string;
  productId: number;
  createdAt: string;
}

export interface ProductDetailView {
  productId: number;
  productCode: string;
  productName: string;
  productDescription?: string;
  unitPrice: number;
  categoryName: string;
  measurementName: string;
  currentStock: number;
  minimumStock?: number;
  lotId?: number;
  createdAt: string;
  updatedAt?: string;
  status: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface MeasurementType {
  measurementId: number;
  measurementName: string;
}

export type ProductUI = {
  code: string;
  name: string;
  subtitle?: string;
  category: string;
  stock: number;
  min: number;
  price: number;
  provider: string;
  status: string;
};
