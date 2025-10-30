import { StatCard } from '@/shared/components/stat-card/stat-card';
import { MovementStatsCard } from '@/shared/components/movement-stats-card/movement-stats-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment.development';
import { ToastrService } from 'ngx-toastr';
import { InventoryService, MovementStats } from '@/core-ui/services/inventory';

export interface Movement {
  movementId: number;
  movementDate: string;
  productName: string;
  movementType: 'ENTRADA' | 'SALIDA';
  quantity: number;
  userName: string;
  reference: string;
  movementReason: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface HistoricalMovementsResponse {
  data: Movement[];
  pagination: PaginationInfo;
}

export interface FilterParams {
  productName?: string;
  movementType?: 'ENTRADA' | 'SALIDA';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

@Component({
  selector: 'app-movement-history',
  standalone: true,
  imports: [StatCard, MovementStatsCard, CommonModule],
  templateUrl: './movement-history.html',
  styleUrl: './movement-history.css',
})
export class MovementHistory implements OnInit, OnDestroy {
  private header = inject(Header);
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private inventoryService = inject(InventoryService);

  // Señales para el estado
  movements = signal<Movement[]>([]);
  pagination = signal<PaginationInfo | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  itemsPerPage = signal(20);

  // Señales para estadísticas de movimientos
  movementStats = signal<MovementStats | null>(null);
  isLoadingStats = signal(false);

  // Señales para filtros
  startDate = signal<string>('');
  endDate = signal<string>('');
  selectedMovementType = signal<'ENTRADA' | 'SALIDA' | ''>('');

  // Señal computada para información de paginación
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

  // Estadísticas computadas
  stats = computed(() => {
    const movements = this.movements();
    const totalMovements = this.pagination()?.totalItems || 0;
    const entradas = movements.filter((m) => m.movementType === 'ENTRADA').length;
    const salidas = movements.filter((m) => m.movementType === 'SALIDA').length;
    const totalQuantity = movements.reduce((sum, m) => sum + m.quantity, 0);

    return {
      totalMovements,
      entradas,
      salidas,
      totalQuantity,
    };
  });

  ngOnInit(): void {
    this.setupHeader();
    this.loadMovements(1);
    this.loadMovementStats();
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  private setupHeader(): void {
    this.header.title.set('Movimientos de inventario');
    this.header.breadcrumbs.set([
      { label: 'Inicio', link: '/' },
      { label: 'Historial de movimientos' },
    ]);
    this.header.showSearch.set(true);

    this.header.actionsTitle.set([]);
  }

  private loadMovements(page: number = 1): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Construir parámetros de filtro
    let params = new URLSearchParams();
    params.append('page', page.toString());

    // Solo agregar filtros si tienen valor
    if (this.startDate()) {
      params.append('startDate', this.startDate());
    }
    if (this.endDate()) {
      params.append('endDate', this.endDate());
    }
    if (this.selectedMovementType()) {
      params.append('movementType', this.selectedMovementType());
    }

    // Determinar el endpoint según si hay filtros o no
    const hasFilters = this.startDate() || this.endDate() || this.selectedMovementType();
    const endpoint = hasFilters
      ? `${environment.BACKENDBASEURL}/historical-movements/filtered?${params.toString()}`
      : `${environment.BACKENDBASEURL}/historical-movements?${params.toString()}`;

    this.http.get<HistoricalMovementsResponse>(endpoint).subscribe({
      next: (response) => {
        this.movements.set(response.data);
        // Asegurar que currentPage sea un número
        const paginationData = {
          ...response.pagination,
          currentPage: Number(response.pagination.currentPage),
          totalPages: Number(response.pagination.totalPages),
          totalItems: Number(response.pagination.totalItems),
          itemsPerPage: Number(response.pagination.itemsPerPage),
        };
        this.pagination.set(paginationData);
        this.currentPage.set(paginationData.currentPage);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading movements:', error);
        this.error.set(this.getErrorMessage(error));
        this.isLoading.set(false);
      },
    });
  }

  prevPage(): void {
    const pag = this.pagination();
    if (pag && pag.hasPreviousPage) {
      const targetPage = Number(pag.currentPage) - 1;
      this.loadMovements(targetPage);
    }
  }

  nextPage(): void {
    const pag = this.pagination();
    if (pag && pag.hasNextPage) {
      const targetPage = Number(pag.currentPage) + 1;
      this.loadMovements(targetPage);
    }
  }

  refreshMovements(): void {
    this.loadMovements(this.currentPage());
  }

  applyFilters(): void {
    // Reiniciar a página 1 cuando se aplican filtros
    this.loadMovements(1);
  }

  clearFilters(): void {
    this.startDate.set('');
    this.endDate.set('');
    this.selectedMovementType.set('');
    this.currentPage.set(1);
    this.loadMovements(1);
  }

  private getErrorMessage(error: any): string {
    if (error?.error?.message) {
      return error.error.message;
    }
    if (error?.status) {
      return `Error ${error.status}: No se pudieron cargar los movimientos`;
    }
    return 'Error desconocido al cargar los movimientos';
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

  loadMovementStats(): void {
    this.isLoadingStats.set(true);
    this.inventoryService.getMovementStats().subscribe({
      next: (stats) => {
        this.movementStats.set(stats);
        this.isLoadingStats.set(false);
      },
      error: (error) => {
        console.error('Error loading movement stats:', error);
        this.isLoadingStats.set(false);
      },
    });
  }
}
