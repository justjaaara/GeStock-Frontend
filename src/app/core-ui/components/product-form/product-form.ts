import { Component, EventEmitter, Input, Output, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateProductDto, Category, MeasurementType } from '@/core-ui/interfaces/product';
import { ProductService } from '@/core-ui/services/product-service/product-service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm {
  @Input() categories: Category[] = [];
  @Input() measurementTypes: MeasurementType[] = [];
  @Output() submitProduct = new EventEmitter<CreateProductDto>();
  @Output() cancel = new EventEmitter<void>();

  productForm: FormGroup;
  isSubmitting = signal(false);
  private productService = inject(ProductService);

  // Autocomplete para categorías
  categorySearch = '';
  showCategoryDropdown = signal(false);
  filteredCategories = signal<Category[]>([]);
  selectedCategory = signal<Category | null>(null);

  constructor(private fb: FormBuilder) {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.maxLength(40)]],
      productDescription: ['', [Validators.maxLength(200)]],
      unitPrice: ['', [Validators.required, Validators.min(0.01)]],
      categoryId: ['', [Validators.required]],
      measurementId: ['', [Validators.required]],
      actualStock: ['', [Validators.required, Validators.min(0)]],
      minimumStock: ['', [Validators.min(0)]],
      lotId: ['', [Validators.min(1)]],
    });

    this.filteredCategories.set(this.categories);
  }

  ngOnChanges(): void {
    this.filteredCategories.set(this.categories);
  }

  filterCategories(): void {
    const search = this.categorySearch.toLowerCase().trim();
    if (!search) {
      this.filteredCategories.set(this.categories);
    } else {
      const filtered = this.categories.filter((cat) =>
        cat.categoryName.toLowerCase().includes(search)
      );
      this.filteredCategories.set(filtered);
    }
    this.showCategoryDropdown.set(true);
  }

  selectCategory(category: Category): void {
    this.selectedCategory.set(category);
    this.categorySearch = category.categoryName;
    this.productForm.patchValue({ categoryId: category.categoryId });
    this.showCategoryDropdown.set(false);
  }

  clearCategory(): void {
    this.selectedCategory.set(null);
    this.categorySearch = '';
    this.productForm.patchValue({ categoryId: '' });
    this.filteredCategories.set(this.categories);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (!field || !field.errors) return '';

    const errors = field.errors;

    if (errors['required']) {
      const labels: Record<string, string> = {
        productName: 'El nombre del producto',
        unitPrice: 'El precio unitario',
        categoryId: 'La categoría',
        measurementId: 'La unidad de medida',
        actualStock: 'El stock actual',
      };
      return `${labels[fieldName] || 'Este campo'} es obligatorio`;
    }

    if (errors['maxlength']) {
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    }

    if (errors['min']) {
      return `El valor mínimo es ${errors['min'].min}`;
    }

    return 'Campo inválido';
  }

  onSubmit(): void {
    if (this.productForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const formValue = this.productForm.value;
      const productData: CreateProductDto = {
        productName: formValue.productName.trim(),
        productDescription: formValue.productDescription?.trim() || undefined,
        unitPrice: Number(formValue.unitPrice),
        categoryId: Number(formValue.categoryId),
        measurementId: Number(formValue.measurementId),
        actualStock: Number(formValue.actualStock),
        minimumStock: formValue.minimumStock ? Number(formValue.minimumStock) : undefined,
        lotId: formValue.lotId ? Number(formValue.lotId) : undefined,
      };

      // this.submitProduct.emit(productData);
      this.productService.createProduct(productData).subscribe();
      this.isSubmitting.set(false);
    } else {
      Object.keys(this.productForm.controls).forEach((key) => {
        this.productForm.get(key)?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
