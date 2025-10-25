import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ProductDetailView } from '@/core-ui/interfaces/product';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  @Input() product: ProductDetailView | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<ProductDetailView>();
  @Output() updateStock = new EventEmitter<ProductDetailView>();

  getStockPercentage(): number {
    console.log('🚀 ~ ProductDetail ~ product:', this.product);
    if (!this.product || !this.product.minimumStock) return 100;
    return Math.round((this.product.currentStock / this.product.minimumStock) * 100);
  }

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    if (this.product) {
      this.edit.emit(this.product);
    }
  }

  onStockUpdate(): void {
    if (this.product) {
      this.updateStock.emit(this.product);
    }
  }
}
