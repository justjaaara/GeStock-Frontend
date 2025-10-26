import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment.development';
import { ToastrService } from 'ngx-toastr';

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
  imports: [StatCard, CommonModule],
  templateUrl: './movement-history.html',
  styleUrl: './movement-history.css',
})
export class MovementHistory implements OnInit, OnDestroy {
  private header = inject(Header);
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // Señales para el estado
  movements = signal<Movement[]>([]);
  pagination = signal<PaginationInfo | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  currentPage = signal(1);
  itemsPerPage = signal(20);

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

    this.header.actionsTitle.set([
      { label: 'Exportar Excel', onClick: () => console.log('Exportar excel') },
      { label: 'Importar CSV', onClick: () => console.log('Importar') },
      { label: 'Reporte Diario', onClick: () => console.log('Reportes') },
    ]);
  }

  private loadMovements(page: number = 1): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Construir parámetros de filtro
    let params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', this.itemsPerPage().toString());

    if (this.startDate()) {
      params.append('startDate', this.startDate());
    }
    if (this.endDate()) {
      params.append('endDate', this.endDate());
    }
    if (this.selectedMovementType()) {
      params.append('movementType', this.selectedMovementType());
    }

    this.http
      .get<HistoricalMovementsResponse>(
        `${environment.BACKENDBASEURL}/historical-movements/filtered?${params.toString()}`
      )
      .subscribe({
        next: (response) => {
          this.movements.set(response.data);
          this.pagination.set(response.pagination);
          this.currentPage.set(response.pagination.currentPage);
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
      const targetPage = pag.currentPage - 1;
      this.loadMovements(targetPage);
    }
  }

  nextPage(): void {
    const pag = this.pagination();
    if (pag && pag.hasNextPage) {
      const targetPage = pag.currentPage + 1;
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

  // Getters para el template
  get page() {
    return this.currentPage();
  }

  get totalPages() {
    return this.pagination()?.totalPages || 1;
  }

  get totalProducts() {
    return this.pagination()?.totalItems || 0;
  }
}
