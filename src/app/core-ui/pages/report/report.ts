import { ReportCard } from '@/shared/components/report-card/report-card';
import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

type ReportRow = {
  id: string;
  title: string;
  subtitle: string;
  period: string;
  generated: string;
  user: string;
  size: string;
  downloads: number;
  status: string;
};

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [StatCard, CommonModule, ReportCard],
  templateUrl: './report.html',
  styleUrl: './report.css',
})
export class Report implements OnInit, OnDestroy {
  constructor(private header: Header) {}

  ngOnInit(): void {
    this.header.title.set('Centro de Reportes');
    this.header.breadcrumbs.set([
      { label: 'Inicio', link: '/' },
      { label: 'Analisis', link: '/' },
      { label: 'Reportes' },
    ]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([
      { label: '', icon: '🌙', onClick: () => console.log('Modo Oscuro') },
      { label: 'Nuevo Reporte', icon: '➕', onClick: () => console.log('Nuevo proveedor') },
    ]);
    this.header.actionsTitle.set([
      { label: 'Programar envio', onClick: () => console.log('Programar envio') },
      { label: 'Exportar todo', onClick: () => console.log('Exportar todo') },
    ]);
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  reportActions = [
    {
      icon: '📦',
      title: 'Reporte de Inventario',
      desc: 'Stock actual, valorización y rotación de productos',
      onClick: () => console.log('Inventario'),
    },
    {
      icon: '📄',
      title: 'Reporte de Movimientos',
      desc: 'Entradas, salidas y transferencias por período',
      onClick: () => console.log('Movimientos'),
    },
    {
      icon: '🛒',
      title: 'Reporte de Compras',
      desc: 'Órdenes, proveedores y análisis de gastos',
      onClick: () => console.log('Compras'),
    },
    {
      icon: '💵',
      title: 'Reporte de Ventas',
      desc: 'Clientes, pedidos y análisis de ingresos',
      onClick: () => console.log('Ventas'),
    },
    {
      icon: '📊',
      title: 'Análisis ABC',
      desc: 'Clasificación de productos por importancia',
      onClick: () => console.log('ABC'),
    },
    {
      icon: '🔁',
      title: 'Rotación de Inventario',
      desc: 'Velocidad de rotación y días de inventario',
      onClick: () => console.log('Rotación'),
    },
  ];

  reports: ReportRow[] = [
    {
      id: 'R2025-048',
      title: 'Inventario General',
      subtitle: 'Stock y valorización',
      period: 'Septiembre 2025',
      generated: '2025-09-03T08:30:00',
      user: 'Admin',
      size: '2.4 MB',
      downloads: 5,
      status: 'Generado',
    },

    {
      id: 'R2025-047',
      title: 'Movimientos Diarios',
      subtitle: 'Entradas y salidas',
      period: '02/09/2025',
      generated: '2025-09-02T18:00:00',
      user: 'Sistema',
      size: '890 KB',
      downloads: 2,
      status: 'Enviado',
    },

    {
      id: 'R2025-046',
      title: 'Compras Mensuales',
      subtitle: 'Órdenes y proveedores',
      period: 'Agosto 2025',
      generated: '2025-09-01T09:15:00',
      user: 'Laura',
      size: '1.8 MB',
      downloads: 12,
      status: 'Descargado',
    },

    {
      id: 'R2025-045',
      title: 'Análisis ABC',
      subtitle: 'Clasificación productos',
      period: 'Q3 2025',
      generated: '2025-08-30T15:28:00',
      user: 'Admin',
      size: '3.2 MB',
      downloads: 8,
      status: 'Generado',
    },

    {
      id: 'R2025-044',
      title: 'Rotación de Stock',
      subtitle: 'Velocidad inventario',
      period: 'Agosto 2025',
      generated: '2025-08-28T16:45:00',
      user: 'Carlos',
      size: '1.5 MB',
      downloads: 0,
      status: 'Error',
    },
  ];

  page = 1;
  totalPages = 1;
  totalProducts = 5;

  prevPage() {
    if (this.page > 1) this.page--;
  }
  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }
}
