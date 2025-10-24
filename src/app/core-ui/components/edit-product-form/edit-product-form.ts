import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Category } from '../../interfaces/product';
import { ProductUI, UpdateProductDto } from '../../interfaces/product';

@Component({
  selector: 'app-edit-product-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './edit-product-form.html',
  styleUrls: ['./edit-product-form.css'],
})
export class EditProductFormComponent implements OnInit {
  @Input() categories: Category[] = [];
  @Input() product!: ProductUI;
  @Output() updateProduct = new EventEmitter<UpdateProductDto>();
  @Output() cancel = new EventEmitter<void>();

  editForm!: FormGroup;
  isSubmitting = signal(false);
  filteredCategories = signal<Category[]>([]);
  selectedCategory = signal<Category | null>(null);
  showCategoryDropdown = signal(false);
  categorySearch = '';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForm();
    this.populateForm();
    this.filteredCategories.set(this.categories);
  }

  private initializeForm(): void {
    this.editForm = this.fb.group({
      productName: ['', [Validators.required, Validators.maxLength(40)]],
      productDescription: ['', [Validators.maxLength(200)]],
      unitPrice: ['', [Validators.required, Validators.min(0.01)]],
      categoryId: ['', [Validators.required]],
    });
  }

  private populateForm(): void {
    if (this.product) {
      // Encontrar la categoría por nombre
      const category = this.categories.find((cat) => cat.categoryName === this.product.category);

      this.editForm.patchValue({
        productName: this.product.name,
        productDescription: this.product.subtitle || '',
        unitPrice: this.product.price,
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
    this.editForm.patchValue({ categoryId: category.categoryId });
    this.showCategoryDropdown.set(false);
  }

  clearCategory(): void {
    this.selectedCategory.set(null);
    this.categorySearch = '';
    this.editForm.patchValue({ categoryId: '' });
    this.filteredCategories.set(this.categories);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['maxlength'])
        return `Máximo ${field.errors['maxlength'].requiredLength} caracteres`;
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
    }
    return '';
  }

  onSubmit(): void {
    if (this.editForm.valid && !this.isSubmitting()) {
      this.isSubmitting.set(true);

      const formValue = this.editForm.value;
      const updateData: UpdateProductDto = {
        productName: formValue.productName.trim(),
        productDescription: formValue.productDescription?.trim() || '',
        unitPrice: parseFloat(formValue.unitPrice),
        categoryId: formValue.categoryId,
      };

      this.updateProduct.emit(updateData);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  // Método para resetear el estado de envío desde el componente padre
  resetSubmitting(): void {
    this.isSubmitting.set(false);
  }
}
