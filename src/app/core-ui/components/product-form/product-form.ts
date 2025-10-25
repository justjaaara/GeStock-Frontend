import {
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
  computed,
  inject,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CreateProductDto,
  Category,
  MeasurementType,
  ProductUI,
} from '@/core-ui/interfaces/product';
import { ProductService } from '@/core-ui/services/product-service/product-service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnChanges {
  @Input() categories: Category[] = [];
  @Input() measurementTypes: MeasurementType[] = [];
  @Input() productToEdit: ProductUI | null = null; // Nuevo input para edición
  @Input() isEditMode: boolean = false; // Nuevo input para determinar el modo
  @Output() submitProduct = new EventEmitter<any>(); // Cambio para que pueda emitir CreateProductDto o UpdateProductDto
  @Output() cancel = new EventEmitter<void>();

  productForm!: FormGroup;
  isSubmitting = signal(false);
  private productService = inject(ProductService);

  // Autocomplete para categorías
  categorySearch = '';
  showCategoryDropdown = signal(false);
  filteredCategories = signal<Category[]>([]);
  selectedCategory = signal<Category | null>(null);

  constructor(private fb: FormBuilder) {
    this.initializeForm();
    this.filteredCategories.set(this.categories);
  }

  private initializeForm(): void {
    if (this.isEditMode) {
      // Formulario para edición - solo campos editables
      this.productForm = this.fb.group({
        productName: ['', [Validators.required, Validators.maxLength(40)]],
        productDescription: ['', [Validators.maxLength(200)]],
        unitPrice: ['', [Validators.required, Validators.min(0.01)]],
        categoryId: ['', [Validators.required]],
      });
    } else {
      // Formulario completo para creación
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
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.filteredCategories.set(this.categories);

    // Si cambió el modo de edición o el producto a editar, reinicializar el formulario
    if (changes['isEditMode'] || changes['productToEdit']) {
      this.initializeForm();
      this.populateFormForEdit();
    }
  }

  private populateFormForEdit(): void {
    if (this.isEditMode && this.productToEdit) {
      // Encontrar la categoría por nombre para obtener el ID
      const category = this.categories.find(
        (cat) => cat.categoryName === this.productToEdit!.category
      );

      this.productForm.patchValue({
        productName: this.productToEdit.name,
        productDescription: this.productToEdit.subtitle || '',
        unitPrice: this.productToEdit.price,
        categoryId: category?.categoryId || '',
      });

      // Establecer la categoría seleccionada para el autocomplete
      if (category) {
        this.selectedCategory.set(category);
        this.categorySearch = category.categoryName;
      }
    }
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
