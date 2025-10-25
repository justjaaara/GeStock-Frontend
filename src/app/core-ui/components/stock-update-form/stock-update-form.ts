import { Component, Output, EventEmitter, Input, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { InventoryService } from '@/core-ui/services/inventory';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-stock-update-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './stock-update-form.html',
  styleUrl: './stock-update-form.css',
})
export class StockUpdateFormComponent implements OnInit {
  @Input() isLoading = false;
  @Input() userId: number | null = null;
  @Output() submitStockUpdate = new EventEmitter<{
    productId: number;
    lotId: number | null;
    quantity: number;
    productCode: string;
    userId: number;
    type: string;
  }>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private inventoryService = inject(InventoryService);
  private toastr = inject(ToastrService);

  currentStep = signal(1);
  step1Form: FormGroup;
  step2Form: FormGroup;
  loadingProduct = signal(false);
  productData = signal<any>(null);

  constructor() {
    this.step1Form = this.fb.group({
      productCode: ['', [Validators.required, Validators.minLength(1)]],
      type: ['ENTRADA', [Validators.required]],
    });

    this.step2Form = this.fb.group({
      quantity: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    if (!this.userId) {
      this.toastr.warning('ID de usuario no disponible', 'Advertencia');
    }
  }

  onStep1Submit(): void {
    if (this.step1Form.valid) {
      this.loadingProduct.set(true);
      const productCode = this.step1Form.get('productCode')?.value;

      this.inventoryService.getProductByCode(productCode).subscribe({
        next: (product) => {
          this.productData.set(product);
          this.loadingProduct.set(false);
          this.currentStep.set(2);
        },
        error: (error) => {
          console.error('Error loading product:', error);
          const errorMessage = error?.error?.message || 'Producto no encontrado';
          this.toastr.error(errorMessage, 'Error');
          this.loadingProduct.set(false);
        },
      });
    }
  }

  onStep2Submit(): void {
    if (this.step2Form.valid && this.productData() && this.userId) {
      const product = this.productData();
      const { quantity } = this.step2Form.value;
      const { type } = this.step1Form.value;

      const updateData = {
        productId: product.productId,
        lotId: product.lotId || null, // Enviar null si no existe lotId
        quantity: parseInt(quantity),
        productCode: product.productCode,
        userId: this.userId,
        type,
      };

      this.submitStockUpdate.emit(updateData);
      this.resetForms();
    } else if (!this.userId) {
      this.toastr.error('ID de usuario no disponible', 'Error');
    }
  }

  goBackToStep1(): void {
    this.currentStep.set(1);
  }

  onCancel(): void {
    this.resetForms();
    this.cancel.emit();
  }

  private resetForms(): void {
    this.step1Form.reset({ type: 'ENTRADA' });
    this.step2Form.reset();
    this.productData.set(null);
    this.currentStep.set(1);
  }

  get productCode() {
    return this.step1Form.get('productCode');
  }

  get type() {
    return this.step1Form.get('type');
  }

  get quantity() {
    return this.step2Form.get('quantity');
  }
}
