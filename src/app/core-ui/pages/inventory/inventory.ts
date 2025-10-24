import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, computed, inject } from '@angular/core';
import { InventoryService, Product, PaginationInfo } from '@/core-ui/services/inventory';
import type {
  Category,
  CreateProductDto,
  MeasurementType,
  ProductDetailView,
  ProductUI,
} from '@/core-ui/interfaces/product';
import { Modal } from '@/shared/components/modal/modal';
import { ProductForm } from '@/core-ui/components/product-form/product-form';
import { ProductDetail } from '@/core-ui/components/product-detail/porduct-detail/product-detail';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [StatCard, CommonModule, Modal, ProductForm, ProductDetail],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
})
export class Inventory implements OnInit, OnDestroy {
  private inventoryService = inject(InventoryService);
  private header = inject(Header);

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

  ngOnInit(): void {
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
      { label: 'Exportar Excel', onClick: () => console.log('Exportar excel') },
      { label: 'Importar', onClick: () => console.log('Importar') },
      { label: 'Reporte Stock', onClick: () => this.generateStockReport() },
      { label: 'Actualizar', onClick: () => this.loadInventory() },
    ]);
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
    // Aquí abrirías el modal de edición
  }

  handleUpdateStock(product: ProductDetailView): void {
    console.log('Actualizar stock:', product);
    this.closeProductDetailModal();
    // Aquí abrirías el modal de actualización de stock
  }

  handleCreateProduct(productData: CreateProductDto): void {
    console.log('Producto a crear:', productData);
    // Aquí irá la lógica para enviar al backend
    // Por ahora solo cerramos el modal
    setTimeout(() => {
      this.closeCreateProductModal();
      // Recargar inventario después de crear
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

  private mapProductsToUI(products: Product[]): ProductUI[] {
    return products.map((product) => ({
      code: product.productCode,
      name: product.productName,
      subtitle: product.productDescription,
      category: product.productCategory,
      stock: product.currentStock,
      min: product.minimunStock,
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
      this.loadInventory(page);
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
