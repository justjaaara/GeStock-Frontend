import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, computed, inject } from '@angular/core';
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

  ngOnInit(): void {
    this.setupHeader();
    this.loadInventory();
    this.loadCategories();
    this.loadMeasurementTypes();
    this.extractUserIdFromToken();
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
      { label: 'Exportar Excel', onClick: () => console.log('Exportar excel') },
      { label: 'Importar', onClick: () => console.log('Importar') },
      { label: 'Reporte Stock', onClick: () => this.generateStockReport() },
      { label: 'Actualizar', onClick: () => this.loadInventory() },
    ]);
  }

  private extractUserIdFromToken(): void {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        const decoded = JwtUtil.decode(token);
        if (decoded && decoded.sub) {
          this.userId.set(decoded.sub);
          console.log('User ID extracted from token:', decoded.sub);
        } else {
          console.warn('Could not extract user ID from token');
        }
      } else {
        console.warn('No access token found in localStorage');
      }
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
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
      productId: 0, // Este vendría del backend si se agrega
      productCode: product.code,
      productName: product.name,
      productDescription: product.subtitle,
      unitPrice: product.price,
      categoryName: product.category,
      measurementName: product.measurementType || 'N/A', // Usar el tipo de medida del backend
      currentStock: product.stock,
      minimumStock: product.min,
      lotId: product.lotId || undefined,
      createdAt: new Date().toISOString(), // Este vendría del backend
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
    console.log('Editar producto:', product);
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
    console.log('Actualizar stock:', product);
    this.closeProductDetailModal();
    // Aquí abrirías el modal de actualización de stock
  }

  // Nuevos métodos para edición
  openEditProductModal(product: ProductUI): void {
    this.selectedProductForEdit.set(product);
    this.showEditProductModal.set(true);
  }

  closeEditProductModal(): void {
    this.showEditProductModal.set(false);
    this.selectedProductForEdit.set(null);
  }

  // Nuevos métodos para eliminación
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

    console.log('Actualizando producto:', productToEdit.code, productData);

    this.inventoryService.updateProduct(productToEdit.code, productData).subscribe({
      next: (response) => {
        console.log('Producto actualizado:', response);
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
        console.log('Producto eliminado:', response);
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

  handleCreateProduct(productData: CreateProductDto): void {
    console.log('Producto a crear:', productData);
    setTimeout(() => {
      this.toastr.success('Producto creado con éxito', 'Creación Exitosa');
      this.closeCreateProductModal();
      this.loadInventory();
    }, 1000);
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
    console.log(
      '🔄 Loading inventory - Page to load:',
      pageToLoad,
      'Current page signal:',
      this.currentPage()
    );
    this.isLoading.set(true);
    this.error.set(null);

    this.inventoryService.getInventory(pageToLoad, this.itemsPerPage()).subscribe({
      next: (response) => {
        console.log('📦 Inventory response:', response.pagination);
        const mappedProducts = this.mapProductsToUI(response.data);
        console.log('🚀 ~ Inventory ~ loadInventory ~ mappedProducts:', mappedProducts);
        this.products.set(mappedProducts);
        this.pagination.set(response.pagination);
        this.currentPage.set(response.pagination.currentPage);
        console.log('✅ Updated currentPage signal to:', response.pagination.currentPage);
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
    console.log('🔄 Loading filtered inventory - Page:', pageToLoad);
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
          console.log('📦 Filtered inventory response:', response.pagination);
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
    console.log('🔍 Applying filters:', {
      category: this.categoryFilter(),
      stockLevel: this.stockLevelFilter(),
      state: this.stateFilter(),
    });
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
      min: product.minimumStock,
      price: product.unitPrice,
      status: product.productState,
      measurementType: product.measurementType,
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
    console.log(
      '🎯 goToPage called - Target page:',
      page,
      'Backend current page:',
      pag?.currentPage
    );
    console.log('📊 Pagination info:', pag);

    if (pag && page >= 1 && page <= pag.totalPages && page !== pag.currentPage) {
      console.log('✅ Conditions met, loading page:', page);
      this.pagination.set({ ...pag, currentPage: page });

      // Usar el endpoint correcto según si hay filtros aplicados
      if (this.hasAppliedFilters()) {
        this.loadFilteredInventory(page);
      } else {
        this.loadInventory(page);
      }
    } else {
      console.log('❌ Conditions not met:', {
        hasValidPagination: !!pag,
        pageInRange: page >= 1 && page <= (pag?.totalPages || 0),
        isDifferentPage: page !== pag?.currentPage,
      });
    }
  }

  prevPage(): void {
    const pag = this.pagination();
    console.log(
      '⬅️ prevPage called - Pagination current:',
      pag?.currentPage,
      'Has previous:',
      pag?.hasPreviousPage
    );
    if (pag && pag.hasPreviousPage) {
      const targetPage = pag.currentPage - 1;
      console.log('🎯 prevPage - Going to page:', targetPage);
      this.goToPage(targetPage);
    }
  }

  nextPage(): void {
    const pag = this.pagination();
    console.log(
      '➡️ nextPage called - Pagination current:',
      pag?.currentPage,
      'Has next:',
      pag?.hasNextPage
    );
    if (pag && pag.hasNextPage) {
      const targetPage = Number(pag.currentPage) + 1;
      console.log('🚀 ~ Inventory ~ nextPage ~ currentPage:', pag.currentPage);
      console.log('🎯 nextPage - Going to page:', targetPage);
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
    console.log('Productos con problemas de stock:', lowStockItems);
    // Aquí puedes implementar la lógica para generar/descargar el reporte
  }

  // Método para cambiar items por página
  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage.set(newLimit);
    this.currentPage.set(1); // Asegurarse de que la señal esté en 1
    this.loadInventory(1); // Volver a la primera página
  }

  // Getters para el template (compatibilidad)
  get page() {
    return this.currentPage();
  }
  get totalPages() {
    return this.pagination()?.totalPages || 1;
  }
  get totalProducts() {
    return this.pagination()?.totalItems || 0;
  }

  // Método mejorado para la paginación
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
}
