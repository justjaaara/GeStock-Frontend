import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

type Movement = {
  id: string;
  date: Date;
  product: string;
  productCode: string;
  type: string;
  qty: number;
  balancePrev: number;
  balanceNew: number;
  user: string;
  reason: string;
  status: string;
};

@Component({
  selector: 'app-movement-history',
  standalone: true,
  imports: [StatCard, CommonModule],
  templateUrl: './movement-history.html',
  styleUrl: './movement-history.css',
})
export class MovementHistory implements OnInit, OnDestroy {
  constructor(private header: Header) {}

  ngOnInit(): void {
    this.header.title.set('Movimientos de inventario');
    this.header.breadcrumbs.set([
      { label: 'Inicio', link: '/' },
      { label: 'Historial de movimientos' },
    ]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([
      { label: '', icon: '🌙', onClick: () => console.log('Modo Oscuro') },
      { label: 'Nuevo movimiento', icon: '➕', onClick: () => console.log('Nuevo movimiento') },
    ]);
    this.header.actionsTitle.set([
      { label: 'Exportar Excel', onClick: () => console.log('Exportar excel') },
      { label: 'Importar CSV', onClick: () => console.log('Importar') },
      { label: 'Reporte Diario', onClick: () => console.log('Reportes') },
    ]);
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  movements: Movement[] = [
    {
      id: 'M5481',
      date: new Date('2025-03-09T08:30:00'),
      product: 'Papel A4',
      productCode: 'P001',
      type: 'Entrada',
      qty: +120,
      balancePrev: 500,
      balanceNew: 620,
      user: 'Admin',
      reason: 'Compra mensual',
      status: 'Confirmado',
    },

    {
      id: 'M5480',
      date: new Date('2025-03-09T07:45:00'),
      product: 'Tóner HP 12A',
      productCode: 'P002',
      type: 'Salida',
      qty: -2,
      balancePrev: 10,
      balanceNew: 8,
      user: 'Laura',
      reason: 'Reemplazo impresora',
      status: 'Pendiente',
    },

    {
      id: 'M5479',
      date: new Date('2025-03-02T16:20:00'),
      product: 'Clips',
      productCode: 'P003',
      type: 'Entrada',
      qty: +50,
      balancePrev: 132,
      balanceNew: 182,
      user: 'Admin',
      reason: 'Restock programado',
      status: 'Confirmado',
    },

    {
      id: 'M5478',
      date: new Date('2025-03-02T14:30:00'),
      product: 'Papel A4',
      productCode: 'P001',
      type: 'Salida',
      qty: -30,
      balancePrev: 530,
      balanceNew: 500,
      user: 'Carlos',
      reason: 'Solicitud departamento',
      status: 'Confirmado',
    },

    {
      id: 'M5477',
      date: new Date('2025-03-02T09:05:00'),
      product: 'Monitor 24"',
      productCode: 'P004',
      type: 'Ajuste',
      qty: +1,
      balancePrev: 11,
      balanceNew: 12,
      user: 'Admin',
      reason: 'Corrección inventario',
      status: 'Confirmado',
    },

    {
      id: 'M5476',
      date: new Date('2025-03-01T17:45:00'),
      product: 'Cajas Archivo',
      productCode: 'P005',
      type: 'Salida',
      qty: -8,
      balancePrev: 25,
      balanceNew: 17,
      user: 'Laura',
      reason: 'Organización archivos',
      status: 'Confirmado',
    },
  ];

  page = 1;
  totalPages = 1;
  totalProducts = 6;

  prevPage() {
    if (this.page > 1) this.page--;
  }
  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }
}
