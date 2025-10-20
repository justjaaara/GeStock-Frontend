import { StatCard } from '@/shared/components/stat-card/stat-card';
import { UiModal } from '@/shared/components/ui-modal/ui-modal';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

type Movimiento = {
  id: number;
  date: string;
  product: string;
  type: 'Entrada' | 'Salida';
  cant: number;
  user: string;
  status: 'OK' | 'Rev.';
  balance: number;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [StatCard, CommonModule, UiModal],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  newOpen = false;

  constructor(private header: Header) {}

  ngOnInit(): void {
    this.header.title.set('Visión General');
    this.header.breadcrumbs.set([{ label: 'Inicio', link: '/' }, { label: 'Dashboard' }]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([
      { label: '', icon: '🌙', onClick: () => console.log('Nuevo') },
      { label: 'Nuevo', icon: '➕', onClick: () => this.openNew() },
    ]);
    this.header.actionsTitle.set([
      { label: 'Exportar', onClick: () => console.log('Exportar') },
      { label: 'Reportes rapidos', onClick: () => console.log('Nuevo') },
    ]);
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  movs: Movimiento[] = [
    {
      id: 5481,
      date: '02/09/2025',
      product: 'Papel A4',
      type: 'Entrada',
      cant: 120,
      user: 'Admin',
      status: 'OK',
      balance: 620,
    },
    {
      id: 5480,
      date: '02/09/2025',
      product: 'Tóner HP 12A',
      type: 'Salida',
      cant: -2,
      user: 'Laura',
      status: 'Rev.',
      balance: 18,
    },
    {
      id: 5479,
      date: '02/09/2025',
      product: 'Caja Clips',
      type: 'Entrada',
      cant: 50,
      user: 'Admin',
      status: 'OK',
      balance: 182,
    },
    {
      id: 5478,
      date: '01/09/2025',
      product: 'Papel A4',
      type: 'Salida',
      cant: -30,
      user: 'Laura',
      status: 'Rev.',
      balance: 500,
    },
    {
      id: 5477,
      date: '01/09/2025',
      product: 'Tóner HP 12A',
      type: 'Entrada',
      cant: 5,
      user: 'Admin',
      status: 'OK',
      balance: 20,
    },
  ];

  stockTop = [
    { label: 'Papel A4', value: 12 },
    { label: 'Tóner HP 12A', value: 24 },
    { label: 'Cajas Archivo', value: 8 },
    { label: 'Resmas Carta', value: 17 },
    { label: 'Carpetas', value: 28 },
  ];

  get maxStock() {
    return Math.max(...this.stockTop.map((x) => x.value));
  }

  barHeight(v: number) {
    return (v / this.maxStock) * 100;
  }

  alerts = [
    { sev: 'Crítico', text: 'Tóner HP 12A debajo mínimo' },
    { sev: 'Bajo', text: 'Papel A4 punto de reorden' },
    { sev: 'Info', text: 'Nueva orden pendiente aprobación' },
  ];

  openNew() {
    this.newOpen = true;
  }

  closeNew() {
    this.newOpen = false;
  }

  saveNew(e: Event) {
    e.preventDefault();
    console.log('Simulacro guardado');
    this.closeNew();
  }
}
