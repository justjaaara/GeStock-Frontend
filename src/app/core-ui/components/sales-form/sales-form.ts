import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SalesService, CreateSaleDto } from '@/core-ui/services/sales';
import { InventoryService, Product } from '@/core-ui/services/inventory';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sales-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sales-form.html',
  styleUrl: './sales-form.css',
})
export class SalesFormComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() saleCreated = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private salesService = inject(SalesService);
  private inventoryService = inject(InventoryService);
  private toastr = inject(ToastrService);

  step = 1;
  loading = false;
  errorMessage = '';
  selectedProduct: Product | null = null;

  step1Form!: FormGroup;
  step2Form!: FormGroup;

  ngOnInit(): void {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.step1Form = this.fb.group({
      productCode: new FormControl('', { validators: [Validators.required], nonNullable: true }),
    });

    this.step2Form = this.fb.group({
      quantity: new FormControl('', {
        validators: [
          Validators.required,
          Validators.min(1),
          Validators.max(this.selectedProduct?.currentStock || 0),
        ],
        nonNullable: true,
      }),
    });
  }

  searchProduct(): void {
    if (this.step1Form.invalid) return;

    const productCode = this.step1Form.get('productCode')?.value.trim();
    this.errorMessage = '';
    this.loading = true;

    // Disable the form while loading
    this.step1Form.disable();

    this.inventoryService.getProductByCode(productCode).subscribe({
      next: (product: Product) => {
        this.selectedProduct = product;
        this.loading = false;
        this.step1Form.enable();

        // Update max validator for step 2
        const quantityControl = this.step2Form.get('quantity');
        if (quantityControl) {
          quantityControl.setValidators([
            Validators.required,
            Validators.min(1),
            Validators.max(product.currentStock),
          ]);
          quantityControl.updateValueAndValidity();
        }

        this.step = 2;
      },
      error: (error) => {
        this.loading = false;
        this.step1Form.enable();
        console.error('Error al buscar producto:', error);
        this.errorMessage =
          error.error?.message ||
          'Producto no encontrado. Verifica el código e intenta nuevamente.';
      },
    });
  }

  createSale(): void {
    if (this.step2Form.invalid || !this.selectedProduct) return;

    const quantity = this.step2Form.get('quantity')?.value;

    if (quantity > this.selectedProduct.currentStock) {
      this.errorMessage = `No hay suficiente stock. Stock disponible: ${this.selectedProduct.currentStock}`;
      return;
    }

    const saleData: CreateSaleDto = {
      productCode: this.selectedProduct.productCode,
      quantity: quantity,
    };

    this.loading = true;
    this.errorMessage = '';

    // Disable the form while loading
    this.step2Form.disable();

    this.salesService.createSale(saleData).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastr.success('Venta registrada exitosamente', 'Éxito');
        this.saleCreated.emit(response);
      },
      error: (error) => {
        this.loading = false;
        this.step2Form.enable();
        console.error('Error al crear venta:', error);
        this.errorMessage =
          error.error?.message || 'Error al registrar la venta. Intenta nuevamente.';
      },
    });
  }

  goBackStep1(): void {
    this.step = 1;
    this.selectedProduct = null;
    this.errorMessage = '';
    this.step2Form.reset();
    this.step2Form.enable();
  }

  onClose(): void {
    this.close.emit();
  }
}
