import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { InventoryService, Closure, ClosureDetail } from '@/core-ui/services/inventory';
import { Modal } from '@/shared/components/modal/modal';
import { Auth } from '@/auth/services/auth';

type ClosureRow = {
  headerId: number;
  closureDate: string;
  closureMonth: number;
  closureYear: number;
  userName: string;
  status: string;
};

@Component({
  selector: 'app-closures',
  standalone: true,
  imports: [CommonModule, Modal],
  templateUrl: './closure.html',
  styleUrl: './closure.css',
})
export class Closures implements OnInit, OnDestroy {
  constructor(
    private header: Header,
    private inventoryService: InventoryService,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    console.log('Closures component initialized');
    this.header.title.set('Cierres Históricos de Inventario');
    this.header.breadcrumbs.set([{ label: 'Inicio', link: '/' }, { label: 'Cierres' }]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([]);
    this.header.actionsTitle.set([
      { label: 'Exportar Lista', onClick: () => console.log('Exportar lista') },
      { label: 'Importar CSV', onClick: () => console.log('Importar CSV') },
      { label: 'Reporte General', onClick: () => console.log('Reporte General') },
    ]);
    this.loadClosures();
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  page = signal(1);
  totalPages = signal(1);
  totalClosures = signal(0);
  closures = signal<ClosureRow[]>([]);

  // Modal signals
  isModalOpen = signal(false);
  modalTitle = signal('Detalle del Cierre');
  selectedClosureId = signal<number | null>(null);
  closureDetails = signal<ClosureDetail[]>([]);
  detailsPage = signal(1);
  detailsTotalPages = signal(1);
  detailsTotalItems = signal(0);

  // Computed properties
  isAdmin = computed(() => this.auth.userProfile()?.role === 'ADMIN');

  loadClosures() {
    console.log('Loading closures for page:', this.page());
    this.inventoryService.getClosures(this.page(), 10).subscribe({
      next: (response) => {
        console.log('Full response:', response);
        this.closures.set(response.data);
        this.totalPages.set(Number(response.pagination.totalPages));
        this.totalClosures.set(Number(response.pagination.totalItems));
        console.log('Closures loaded:', this.closures());
        console.log('Closures array length:', this.closures().length);
        console.log('Pagination:', response.pagination);
      },
      error: (error) => {
        console.error('Error loading closures:', error);
      },
    });
  }

  prevPage() {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.loadClosures();
    }
  }

  nextPage() {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.loadClosures();
    }
  }

  viewDetails(closure: ClosureRow) {
    this.selectedClosureId.set(closure.headerId);
    this.modalTitle.set(`Detalle del Cierre #${closure.headerId}`);
    this.detailsPage.set(1);
    this.loadClosureDetails();
    this.isModalOpen.set(true);
  }

  loadClosureDetails() {
    if (!this.selectedClosureId()) return;
    this.inventoryService
      .getClosureDetails(this.selectedClosureId()!, this.detailsPage(), 20)
      .subscribe({
        next: (response) => {
          this.closureDetails.set(response.data);
          this.detailsTotalPages.set(Number(response.pagination.totalPages));
          this.detailsTotalItems.set(Number(response.pagination.totalItems));
        },
        error: (error) => {
          console.error('Error loading closure details:', error);
        },
      });
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.closureDetails.set([]);
    this.selectedClosureId.set(null);
  }

  prevDetailsPage() {
    if (this.detailsPage() > 1) {
      this.detailsPage.update((p) => p - 1);
      this.loadClosureDetails();
    }
  }

  nextDetailsPage() {
    if (this.detailsPage() < this.detailsTotalPages()) {
      this.detailsPage.update((p) => p + 1);
      this.loadClosureDetails();
    }
  }

  isUserAdmin(): boolean {
    return this.auth.userRole() === 'admin';
  }
}
