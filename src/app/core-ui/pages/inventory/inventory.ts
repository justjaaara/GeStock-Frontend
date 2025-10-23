import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, computed, inject } from '@angular/core';
import { InventoryService, Product, PaginationInfo } from '@/core-ui/services/inventory';
import { Category, CreateProductDto, MeasurementType } from '@/core-ui/interfaces/product';
import { Modal } from '@/shared/components/modal/modal';
import { ProductForm } from '@/core-ui/components/product-form/product-form';

type ProductUI = {
  code: string;
  name: string;
  subtitle?: string;
  category: string;
  stock: number;
  min: number;
  price: number;
  provider: string;
  status: string;
};

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [StatCard, CommonModule, Modal, ProductForm],
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

  // Señal para la página actual
  currentPage = signal(1);
  itemsPerPage = signal(20);

  // Señales computadas para estadísticas
  stats = computed(() => {
    const products = this.products();
    const totalProducts = this.pagination()?.totalItems || 0;
    const lowStockProducts = products.filter((p) => p.stock <= p.min).length;
    const criticalStockProducts = products.filter((p) => p.stock < p.min * 0.5).length;
    const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

    return {
      totalProducts,
      lowStockProducts,
      criticalStockProducts,
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

  // Datos temporales (luego vendrán del backend)
  categories: Category[] = [
    { categoryId: 1, categoryName: 'Bebidas' },
    { categoryId: 2, categoryName: 'Alimentos' },
    { categoryId: 3, categoryName: 'Limpieza' },
    { categoryId: 4, categoryName: 'Tecnología' },
    { categoryId: 5, categoryName: 'Oficina' },
  ];

  measurementTypes: MeasurementType[] = [
    { measurementId: 1, measurementName: 'Unidad' },
    { measurementId: 2, measurementName: 'Kilogramo' },
    { measurementId: 3, measurementName: 'Litro' },
    { measurementId: 4, measurementName: 'Caja' },
    { measurementId: 5, measurementName: 'Paquete' },
  ];

  ngOnInit(): void {
    this.setupHeader();
    this.loadInventory();
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

  private mapProductsToUI(products: Product[]): ProductUI[] {
    return products.map((product) => ({
      code: product.productCode,
      name: product.productName,
      subtitle: product.productDescription,
      category: product.productCategory,
      stock: product.currentStock,
      min: product.minimunStock,
      price: product.unitPrice,
      provider: 'N/A', // Este campo no viene del backend
      status: this.getStockStatus(product.currentStock, product.minimunStock),
    }));
  }

  private getStockStatus(currentStock: number, minimumStock: number): string {
    if (currentStock <= 0) return 'Sin Stock';
    if (currentStock < minimumStock * 0.5) return 'Crítico';
    if (currentStock <= minimumStock) return 'Stock Bajo';
    return 'Activo';
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
    if (pag && page >= 1 && page <= pag.totalPages && page !== this.currentPage()) {
      this.loadInventory(page);
    }
  }

  prevPage(): void {
    const pag = this.pagination();
    if (pag && pag.hasPreviousPage) {
      this.goToPage(this.currentPage() - 1);
    }
  }

  nextPage(): void {
    const pag = this.pagination();
    if (pag && pag.hasNextPage) {
      this.goToPage(this.currentPage() + 1);
    }
  }

  // Métodos de utilidad
  refreshInventory(): void {
    this.loadInventory(this.currentPage());
  }

  private generateStockReport(): void {
    const lowStockItems = this.products().filter(
      (p) => p.status === 'Stock Bajo' || p.status === 'Crítico' || p.status === 'Sin Stock'
    );
    console.log('Productos con stock bajo:', lowStockItems);
    // Aquí puedes implementar la lógica para generar/descargar el reporte
  }

  // Método para cambiar items por página
  changeItemsPerPage(newLimit: number): void {
    this.itemsPerPage.set(newLimit);
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

  // Agregar este método
  getPaginationPages(): number[] {
    const pag = this.pagination();
    if (!pag) return [];

    const totalPages = pag.totalPages;
    const maxPagesToShow = 5;
    const pagesToShow = Math.min(totalPages, maxPagesToShow);

    return Array.from({ length: pagesToShow }, (_, i) => i + 1);
  }
}
