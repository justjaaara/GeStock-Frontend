import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { InventoryService, Closure } from '@/core-ui/services/inventory';

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
  imports: [CommonModule],
  templateUrl: './closure.html',
  styleUrl: './closure.css',
})
export class Closures implements OnInit, OnDestroy {
  constructor(private header: Header, private inventoryService: InventoryService) {}

  ngOnInit(): void {
    console.log('Closures component initialized');
    this.header.title.set('Cierres Históricos de Inventario');
    this.header.breadcrumbs.set([{ label: 'Inicio', link: '/' }, { label: 'Cierres' }]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([
      { label: 'Nuevo Cierre', icon: '➕', onClick: () => console.log('Nuevo cierre') },
    ]);
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
}
