import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

type ClosureRow = {
  id: number;
  closureDate: string;
  month: number;
  year: number;
  userName: string;
  totalProducts: number;
  totalValue: number;
};

@Component({
  selector: 'app-closures',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './closure.html',
  styleUrl: './closure.css',
})
export class Closures implements OnInit, OnDestroy {
  constructor(private header: Header) {}

  ngOnInit(): void {
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
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  page = 1;
  totalPages = 1;
  totalClosures = 6;

  prevPage() {
    if (this.page > 1) this.page--;
  }
  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  closures: ClosureRow[] = [
    {
      id: 1,
      closureDate: '2025-10-01',
      month: 10,
      year: 2025,
      userName: 'Juan Pérez',
      totalProducts: 150,
      totalValue: 45280,
    },
    {
      id: 2,
      closureDate: '2025-09-01',
      month: 9,
      year: 2025,
      userName: 'María García',
      totalProducts: 145,
      totalValue: 42150,
    },
    {
      id: 3,
      closureDate: '2025-08-01',
      month: 8,
      year: 2025,
      userName: 'Carlos López',
      totalProducts: 152,
      totalValue: 48920,
    },
    {
      id: 4,
      closureDate: '2025-07-01',
      month: 7,
      year: 2025,
      userName: 'Ana Rodríguez',
      totalProducts: 148,
      totalValue: 39850,
    },
    {
      id: 5,
      closureDate: '2025-06-01',
      month: 6,
      year: 2025,
      userName: 'Pedro Martínez',
      totalProducts: 155,
      totalValue: 51200,
    },
    {
      id: 6,
      closureDate: '2025-05-01',
      month: 5,
      year: 2025,
      userName: 'Laura Sánchez',
      totalProducts: 149,
      totalValue: 46780,
    },
  ];
}
