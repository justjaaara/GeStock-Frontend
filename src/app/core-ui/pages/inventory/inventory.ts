import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  InventoryService,
  Product,
  PaginationInfo,
  UpdateProductDto,
} from '@/core-ui/services/inventory';
import type {
  Category,
  CreateProductDto,
  MeasurementType,
  ProductDetailView,
  ProductUI,
  UpdateProductDto as UpdateProductInterface,
} from '@/core-ui/interfaces/product';
import { Modal } from '@/shared/components/modal/modal';
import { ProductForm } from '@/core-ui/components/product-form/product-form';
import { ProductDetail } from '@/core-ui/components/product-detail/porduct-detail/product-detail';
import { EditProductFormComponent } from '@/core-ui/components/edit-product-form/edit-product-form';
import { StockUpdateFormComponent } from '@/core-ui/components/stock-update-form/stock-update-form';
import { JwtUtil } from '@/core/utils/jwt.util';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    StatCard,
    CommonModule,
    Modal,
    ProductForm,
    ProductDetail,
    EditProductFormComponent,
    StockUpdateFormComponent,
  ],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit, OnDestroy {
  private inventoryService = inject(InventoryService);
  private header = inject(Header);
  private toastr = inject(ToastrService);
  private http = inject(HttpClient);

  // Señales para el estado
  products = signal<ProductUI[]>([]);
  pagination = signal<PaginationInfo | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  categories = signal<Category[]>([]);
  categoriesLoading = signal(false);
  measurementTypes = signal<MeasurementType[]>([]);
  measurementTypesLoading = signal(false);

  // Señal para la página actual
  currentPage = signal(1);
  itemsPerPage = signal(20);

  // Señales para los filtros
  categoryFilter = signal<string>('');
  stockLevelFilter = signal<string>('');
  stateFilter = signal<string>('');
  hasAppliedFilters = signal(false);

  // Señales computadas para estadísticas
  stats = computed(() => {
    const products = this.products();
    const totalProducts = this.pagination()?.totalItems || 0;
    const lowStockProducts = products.filter((p) => p.stock <= p.min).length;
    const criticalStockProducts = products.filter((p) => p.stock < p.min * 0.5).length;
    const inactiveProducts = products.filter((p) => p.status !== 'Activo').length;
    const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

    return {
      totalProducts,
      lowStockProducts,
      criticalStockProducts,
      inactiveProducts,
      totalValue,
    };
  });

  // Información de paginación computada
  paginationInfo = computed(() => {
    const pag = this.pagination();
    if (!pag) return null;

    return {
      currentPage: pag.currentPage,
      totalPages: pag.totalPages,
      totalItems: pag.totalItems,
      itemsPerPage: pag.itemsPerPage,
      hasNext: pag.hasNextPage,
      hasPrevious: pag.hasPreviousPage,
      showingFrom: (pag.currentPage - 1) * pag.itemsPerPage + 1,
      showingTo: Math.min(pag.currentPage * pag.itemsPerPage, pag.totalItems),
    };
  });

  // Fecha del mes actual para el cierre
  currentMonthInfo = computed(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() devuelve 0-11
    const year = now.getFullYear();
    const monthNames = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];

    return {
      month,
      year,
      monthName: monthNames[month - 1],
      formattedDate: `${monthNames[month - 1]} ${year}`,
    };
  });

  showCreateProductModal = signal(false);
  showProductDetailModal = signal(false);
  selectedProductForDetail = signal<ProductDetailView | null>(null);
  showEditProductModal = signal(false);
  selectedProductForEdit = signal<ProductUI | null>(null);
  showDeleteConfirmModal = signal(false);
  selectedProductForDelete = signal<ProductUI | null>(null);
  isDeleting = signal(false);
  showStockUpdateModal = signal(false);
  isUpdatingStock = signal(false);
  userId = signal<number | null>(null);
  roleId = signal<number | null>(null);
  showClosureConfirmModal = signal(false);
  isGeneratingClosure = signal(false);

  ngOnInit(): void {
    this.extractUserIdFromToken();
    this.setupHeader();
    this.loadInventory();
    this.loadCategories();
    this.loadMeasurementTypes();
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  private setupHeader(): void {
    this.header.title.set('Inventario de productos');
    this.header.breadcrumbs.set([{ label: 'Inicio', link: '/' }, { label: 'Inventario' }]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([
      { label: 'Nuevo producto', icon: '➕', onClick: () => this.openCreateProductModal() },
    ]);
    this.header.actionsTitle.set([
      { label: 'Reporte Stock', onClick: () => this.generateStockReport() },
      { label: 'Actualizar', onClick: () => this.loadInventory() },
      // Botón condicional para generar cierre mensual, visible solo para ADMIN (1) o JEFE DE ALMACEN (2)
      ...(this.roleId() === 1 || this.roleId() === 2
        ? [{ label: 'Generar Cierre Mensual', onClick: () => this.generateMonthlyClosure() }]
        : []),
    ]);
  }

  private extractUserIdFromToken(): void {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const decoded = JwtUtil.decode(token);
        if (decoded && decoded.sub) {
          this.userId.set(decoded.sub);
        } else {
          console.warn('Could not extract user ID from token');
        }
        if (decoded && decoded.roleId) {
          this.roleId.set(decoded.roleId);
        } else {
          console.warn('Could not extract user roleId from token');
        }
      } else {
        console.warn('No access token found in localStorage');
      }
    } catch (error) {
      console.error('Error extracting user ID/roleId from token:', error);
    }
  }

  openCreateProductModal(): void {
    this.showCreateProductModal.set(true);
  }

  closeCreateProductModal(): void {
    this.showCreateProductModal.set(false);
  }

  openProductDetailModal(product: ProductUI): void {
    // Encontrar el producto completo del backend para obtener todos los campos
    const backendProduct = this.products().find((p) => p.code === product.code);

    // Convertir ProductUI a ProductDetail usando los datos del backend
    const productDetail: ProductDetailView = {
      productId: 0,
      productCode: product.code,
      productName: product.name,
      productDescription: product.subtitle,
      unitPrice: product.price,
      categoryName: product.category,
      measurementName: product.measurementType || 'N/A',
      currentStock: product.stock,
      minimumStock: product.min,
      lotId: product.lotId || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
      status: product.status,
    };

    this.selectedProductForDetail.set(productDetail);
    this.showProductDetailModal.set(true);
  }

  closeProductDetailModal(): void {
    this.showProductDetailModal.set(false);
    this.selectedProductForDetail.set(null);
  }

  handleEditProduct(product: ProductDetailView): void {
    this.closeProductDetailModal();
    // Convertir ProductDetailView a ProductUI para edición
    const productForEdit: ProductUI = {
      code: product.productCode,
      name: product.productName,
      subtitle: product.productDescription,
      category: product.categoryName,
      stock: product.currentStock,
      min: product.minimumStock || 0,
      price: product.unitPrice,
      status: product.status,
      measurementType: product.measurementName,
      lotId: product.lotId,
    };
    this.openEditProductModal(productForEdit);
  }

  handleUpdateStock(product: ProductDetailView): void {
    this.closeProductDetailModal();
  }

  openEditProductModal(product: ProductUI): void {
    this.selectedProductForEdit.set(product);
    this.showEditProductModal.set(true);
  }

  closeEditProductModal(): void {
    this.showEditProductModal.set(false);
    this.selectedProductForEdit.set(null);
  }

  openDeleteConfirmModal(product: ProductUI): void {
    this.selectedProductForDelete.set(product);
    this.showDeleteConfirmModal.set(true);
  }

  closeDeleteConfirmModal(): void {
    this.showDeleteConfirmModal.set(false);
    this.selectedProductForDelete.set(null);
  }

  openStockUpdateModal(): void {
    this.showStockUpdateModal.set(true);
  }

  closeStockUpdateModal(): void {
    this.showStockUpdateModal.set(false);
  }

  handleStockUpdate(updateData: {
    productId: number;
    lotId: number | null;
    quantity: number;
    productCode: string;
    userId: number;
    type: string;
    movementReason: 'AJUSTE INVENTARIO' | 'DEVOLUCION CLIENTE' | 'DAÑO';
  }): void {
    this.isUpdatingStock.set(true);
    this.inventoryService.updateStock(updateData).subscribe({
      next: (response) => {
        this.toastr.success(response.message, 'Stock Actualizado');
        this.isUpdatingStock.set(false);
        this.closeStockUpdateModal();
        this.refreshInventory();
      },
      error: (error) => {
        console.error('Error updating stock:', error);
        const errorMessage = error?.error?.message || 'Error al actualizar el stock';
        this.toastr.error(errorMessage, 'Error');
        this.isUpdatingStock.set(false);
      },
    });
  }

  handleUpdateProduct(productData: UpdateProductInterface): void {
    const productToEdit = this.selectedProductForEdit();
    if (!productToEdit) return;

    this.inventoryService.updateProduct(productToEdit.code, productData).subscribe({
      next: (response) => {
        this.toastr.success('Producto actualizado con éxito', 'Actualización Exitosa');
        this.closeEditProductModal();
        this.loadInventory(this.currentPage());
      },
      error: (error) => {
        console.error('Error actualizando producto:', error);
        this.toastr.error('Error al actualizar el producto', 'Error');
      },
    });
  }

  confirmDeleteProduct(): void {
    const productToDelete = this.selectedProductForDelete();
    if (!productToDelete) return;

    this.isDeleting.set(true);

    this.inventoryService.deleteProduct(productToDelete.code).subscribe({
      next: (response) => {
        this.toastr.success('Producto eliminado con éxito', 'Eliminación Exitosa');
        this.isDeleting.set(false);
        this.closeDeleteConfirmModal();
        this.loadInventory(this.currentPage());
      },
      error: (error) => {
        console.error('Error eliminando producto:', error);
        this.toastr.error('Error al eliminar el producto', 'Error');
        this.isDeleting.set(false);
      },
    });
  }

  handleCreateProduct(productData: any): void {
    // El toast ya se muestra en el componente product-form
    this.closeCreateProductModal();
    this.loadInventory();
  }

  private loadCategories(): void {
    this.categoriesLoading.set(true);
    this.inventoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.categoriesLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.categoriesLoading.set(false);
        // En caso de error, mantener las categorías vacías
        this.categories.set([]);
      },
    });
  }

  private loadMeasurementTypes(): void {
    this.measurementTypesLoading.set(true);
    this.inventoryService.getMeasurementTypes().subscribe({
      next: (measurementTypes) => {
        this.measurementTypes.set(measurementTypes);
        this.measurementTypesLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading measurement types:', error);
        this.measurementTypesLoading.set(false);
        // En caso de error, mantener los tipos de medida vacíos
        this.measurementTypes.set([]);
      },
    });
  }

  private loadInventory(page?: number): void {
    const pageToLoad = page || this.currentPage();
    this.isLoading.set(true);
    this.error.set(null);

    this.inventoryService.getInventory(pageToLoad, this.itemsPerPage()).subscribe({
      next: (response) => {
        const mappedProducts = this.mapProductsToUI(response.data);
        this.products.set(mappedProducts);
        this.pagination.set(response.pagination);
        this.currentPage.set(response.pagination.currentPage);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading inventory:', error);
        this.error.set(this.getErrorMessage(error));
        this.isLoading.set(false);
      },
    });
  }

  private loadFilteredInventory(page?: number): void {
    const pageToLoad = page || this.currentPage();
    this.isLoading.set(true);
    this.error.set(null);

    // Mapear los valores del UI a los valores del backend
    const categoryName = this.categoryFilter() || undefined;
    const stockLevel = this.mapStockLevelToBackend(this.stockLevelFilter());
    const state = this.mapStateToBackend(this.stateFilter());

    this.inventoryService
      .getFilteredInventory(pageToLoad, this.itemsPerPage(), categoryName, stockLevel, state)
      .subscribe({
        next: (response) => {
          const mappedProducts = this.mapProductsToUI(response.data);
          this.products.set(mappedProducts);
          this.pagination.set(response.pagination);
          this.currentPage.set(response.pagination.currentPage);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading filtered inventory:', error);
          this.error.set(this.getErrorMessage(error));
          this.isLoading.set(false);
        },
      });
  }

  private mapStockLevelToBackend(uiValue: string): string | undefined {
    if (!uiValue) return undefined;
    const mapping: { [key: string]: string } = {
      Crítico: 'critical',
      'Stock Bajo': 'low',
      'Sin Stock': 'out',
    };
    return mapping[uiValue] || undefined;
  }

  private mapStateToBackend(uiValue: string): string | undefined {
    if (!uiValue) return undefined;
    const mapping: { [key: string]: string } = {
      Activo: 'active',
      Inactivo: 'inactive',
    };
    return mapping[uiValue] || undefined;
  }

  applyFilters(): void {
    this.hasAppliedFilters.set(true);
    this.currentPage.set(1);
    this.loadFilteredInventory(1);
  }

  resetFilters(): void {
    this.categoryFilter.set('');
    this.stockLevelFilter.set('');
    this.stateFilter.set('');
    this.hasAppliedFilters.set(false);
    this.currentPage.set(1);
    this.loadInventory(1);
  }

  private mapProductsToUI(products: Product[]): ProductUI[] {
    return products.map((product) => ({
      code: product.productCode,
      name: product.productName,
      subtitle: product.productDescription,
      category: product.productCategory,
      stock: product.currentStock,
      min: product.minimunStock || product.minimumStock || 0, // Soporta ambas ortografías
      price: product.unitPrice,
      status: product.productState || product.stateName || 'Desconocido',
      measurementType: product.measurementType || product.measurementName,
      lotId: product.lotId,
    }));
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'No se puede conectar al servidor. Verifica que el backend esté ejecutándose.';
    }
    if (error.status === 401) {
      return 'No tienes autorización para ver el inventario. Inicia sesión nuevamente.';
    }
    if (error.status === 404) {
      return 'Endpoint de inventario no encontrado.';
    }
    if (error.status >= 500) {
      return 'Error del servidor. Intenta más tarde.';
    }
    return error.error?.message || 'Error al cargar el inventario. Intenta nuevamente.';
  }

  // Métodos de paginación
  goToPage(page: number): void {
    const pag = this.pagination();

    if (pag && page >= 1 && page <= pag.totalPages && page !== pag.currentPage) {
      this.pagination.set({ ...pag, currentPage: page });

      // Usar el endpoint correcto según si hay filtros aplicados
      if (this.hasAppliedFilters()) {
        this.loadFilteredInventory(page);
      } else {
        this.loadInventory(page);
      }
    }
  }

  prevPage(): void {
    const pag = this.pagination();
    if (pag && pag.hasPreviousPage) {
      const targetPage = pag.currentPage - 1;
      this.goToPage(targetPage);
    }
  }

  nextPage(): void {
    const pag = this.pagination();
    if (pag && pag.hasNextPage) {
      const targetPage = Number(pag.currentPage) + 1;
      this.goToPage(targetPage);
    }
  }

  // Métodos de utilidad
  refreshInventory(): void {
    this.loadInventory(this.currentPage());
  }

  private generateStockReport(): void {
    const lowStockItems = this.products().filter(
      (p) => p.status !== 'Activo' // Filtrar productos que no estén activos
    );
  }

  // Método para cambiar items por página
  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage.set(newLimit);
    this.currentPage.set(1);
    this.loadInventory(1);
  }

  get page() {
    return this.currentPage();
  }
  get totalPages() {
    return this.pagination()?.totalPages || 1;
  }
  get totalProducts() {
    return this.pagination()?.totalItems || 0;
  }

  getPaginationPages(): number[] {
    const pag = this.pagination();
    if (!pag) return [];

    const totalPages = pag.totalPages;
    const currentPage = pag.currentPage;
    const maxPagesToShow = 5;

    // Si hay pocas páginas, mostrar todas
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calcular el rango centrado alrededor de la página actual
    const halfRange = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    // Ajustar si estamos cerca del final
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  generateMonthlyClosure(): void {
    this.showClosureConfirmModal.set(true);
  }

  confirmGenerateClosure(): void {
    this.showClosureConfirmModal.set(false);
    this.isGeneratingClosure.set(true);

    this.http
      .post<{ message: string; headerId: number; month: number; year: number; createdAt: string }>(
        `${environment.BACKENDBASEURL}/inventory/generate-monthly-closure`,
        {}
      )
      .subscribe({
        next: (response) => {
          this.toastr.success(response.message, 'Cierre Generado');
          this.isGeneratingClosure.set(false);
        },
        error: (error) => {
          if (error.status === 400) {
            this.toastr.warning('Ya existe un cierre para este mes.', 'Advertencia');
          } else if (error.status === 401) {
            this.toastr.error('No autorizado. Verifica tu sesión.', 'Error');
          } else {
            this.toastr.error('Error al generar cierre mensual.', 'Error');
          }
          console.error('Error generando cierre:', error);
          this.isGeneratingClosure.set(false);
        },
      });
  }

  cancelClosure(): void {
    this.showClosureConfirmModal.set(false);
  }
}
