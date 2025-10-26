import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SalesFormComponent } from '@/core-ui/components/sales-form/sales-form';
import { SalesService, SaleMovement, PaginationInfo } from '@/core-ui/services/sales';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [CommonModule, SalesFormComponent, FormsModule],
  templateUrl: './shopping.html',
  styleUrl: './shopping.css',
})
export class Shopping implements OnInit, OnDestroy {
  private header = inject(Header);
  private salesService = inject(SalesService);
  private toastr = inject(ToastrService);

  showSalesModal = signal(false);
  sales = signal<SaleMovement[]>([]);
  pagination = signal<PaginationInfo | null>(null);
  isLoading = signal(false);
  currentPage = signal(1);
  itemsPerPage = 20;

  // Filtros
  startDate = signal<string>('');
  endDate = signal<string>('');

  ngOnInit(): void {
    this.header.title.set('Gestión de Compras');
    this.header.breadcrumbs.set([{ label: 'Inicio', link: '/' }, { label: 'Compras' }]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([
      { label: 'Nueva orden', icon: '➕', onClick: () => this.openSalesModal() },
    ]);
    this.header.actionsTitle.set([
      { label: 'Exportar Ordenes', onClick: () => console.log('Exportar excel') },
      { label: 'Plantilla Compra', onClick: () => console.log('Importar') },
      { label: 'Reporte Mensual', onClick: () => console.log('Reportes') },
    ]);

    this.loadSalesHistory();
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  loadSalesHistory(): void {
    this.isLoading.set(true);
    console.log('Iniciando carga de historial de ventas, página:', this.currentPage());

    // Determinar si hay filtros activos
    const hasFilters = this.startDate() || this.endDate();

    const request$ = hasFilters
      ? this.salesService.getFilteredSales(
          this.startDate() || undefined,
          this.endDate() || undefined,
          this.currentPage(),
          this.itemsPerPage
        )
      : this.salesService.getSalesHistory(this.currentPage(), this.itemsPerPage);

    request$.subscribe({
      next: (response: any) => {
        console.log('Respuesta completa recibida:', response);

        // Manejo flexible de la respuesta
        if (response.data && Array.isArray(response.data)) {
          this.sales.set(response.data);
          console.log('Datos asignados (array directo):', this.sales());
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          this.sales.set(response.data.data);
          console.log('Datos asignados (data.data):', this.sales());
        } else {
          console.warn('Estructura de respuesta no esperada:', response);
          this.sales.set([]);
        }

        // Asignar paginación
        if (response.pagination) {
          this.pagination.set(response.pagination);
        } else if (response.data?.pagination) {
          this.pagination.set(response.data.pagination);
        } else {
          console.warn('Paginación no encontrada en respuesta');
          this.pagination.set(null);
        }

        console.log('Estado final - Sales:', this.sales().length, 'Pagination:', this.pagination());
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Error al cargar historial de ventas:', error);
        this.toastr.error('Error al cargar el historial de ventas');
      },
    });
  }

  prevPage(): void {
    const pag = this.pagination();
    if (pag && pag.hasPreviousPage) {
      this.currentPage.update((page) => page - 1);
      this.loadSalesHistory();
    }
  }

  nextPage(): void {
    const pag = this.pagination();
    if (pag && pag.hasNextPage) {
      this.currentPage.update((page) => page + 1);
      this.loadSalesHistory();
    }
  }

  applyFilters(): void {
    // Resetear a la primera página cuando se aplican filtros
    this.currentPage.set(1);
    this.loadSalesHistory();
  }

  clearFilters(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.currentPage.set(1);
    this.loadSalesHistory();
  }

  openSalesModal(): void {
    this.showSalesModal.set(true);
  }

  closeSalesModal(): void {
    this.showSalesModal.set(false);
  }

  onSaleCreated(sale: any): void {
    console.log('Venta creada:', sale);
    // Recargar la lista de ventas
    this.currentPage.set(1);
    this.loadSalesHistory();
  }
}
