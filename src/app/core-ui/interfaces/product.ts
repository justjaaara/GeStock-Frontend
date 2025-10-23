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

export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface MeasurementType {
  measurementId: number;
  measurementName: string;
}
