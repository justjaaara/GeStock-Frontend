import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

type OrdenCompra = {
  id: number;
  code: string; // OC-2025-048
  fecha: Date;
  proveedor: string;
  items: number;
  subtotal: number;
  igv: number;
  total: number;
  estado: string;
  entrega: Date;
};

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [StatCard, CommonModule],
  templateUrl: './shopping.html',
  styleUrl: './shopping.css',
})
export class Shopping implements OnInit, OnDestroy {
  constructor(private header: Header) {}

  ngOnInit(): void {
    this.header.title.set('Gestión de Compras');
    this.header.breadcrumbs.set([{ label: 'Inicio', link: '/' }, { label: 'Compras' }]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([
      { label: 'Nueva orden', icon: '➕', onClick: () => console.log('Nueva compra') },
    ]);
    this.header.actionsTitle.set([
      { label: 'Exportar Ordenes', onClick: () => console.log('Exportar excel') },
      { label: 'Plantilla Compra', onClick: () => console.log('Importar') },
      { label: 'Reporte Mensual', onClick: () => console.log('Reportes') },
    ]);
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  orders: OrdenCompra[] = [
    {
      id: 48,
      code: 'OC-2025-048',
      fecha: new Date(2025, 8, 3),
      proveedor: 'Papelería Central',
      items: 8,
      subtotal: 1240,
      igv: 223.2,
      total: 1463.2,
      estado: 'Pendiente',
      entrega: new Date(2025, 8, 5),
    },
    {
      id: 47,
      code: 'OC-2025-047',
      fecha: new Date(2025, 8, 2),
      proveedor: 'TechSupply',
      items: 12,
      subtotal: 2890,
      igv: 520.2,
      total: 3410.2,
      estado: 'Enviada',
      entrega: new Date(2025, 8, 8),
    },
    {
      id: 46,
      code: 'OC-2025-046',
      fecha: new Date(2025, 8, 1),
      proveedor: 'Oficina Total',
      items: 5,
      subtotal: 680,
      igv: 122.4,
      total: 802.4,
      estado: 'Recibida',
      entrega: new Date(2025, 8, 1),
    },
    {
      id: 45,
      code: 'OC-2025-045',
      fecha: new Date(2025, 7, 30),
      proveedor: 'TechSupply',
      items: 3,
      subtotal: 1450,
      igv: 261,
      total: 1711,
      estado: 'Cerrada',
      entrega: new Date(2025, 7, 30),
    },
    {
      id: 44,
      code: 'OC-2025-044',
      fecha: new Date(2025, 7, 28),
      proveedor: 'Papelería Central',
      items: 15,
      subtotal: 2120,
      igv: 381.6,
      total: 2501.6,
      estado: 'Cerrada',
      entrega: new Date(2025, 7, 29),
    },
    {
      id: 43,
      code: 'OC-2025-043',
      fecha: new Date(2025, 7, 25),
      proveedor: 'Muebles Express',
      items: 6,
      subtotal: 4200,
      igv: 756,
      total: 4956,
      estado: 'Retrasada',
      entrega: new Date(2025, 7, 27),
    },
  ];

  // Datos demo (ajusta a tu backend)
  toReplenish = [
    {
      code: 'P-001',
      name: 'Tóner HP 12A',
      stock: 8,
      min: 15,
      suggested: 25,
      supplier: 'TechSupply',
    },
    {
      code: 'P-002',
      name: 'Papel A4',
      stock: 12,
      min: 50,
      suggested: 100,
      supplier: 'Papelería Central',
    },
    {
      code: 'P-003',
      name: 'Cajas Archivo',
      stock: 17,
      min: 25,
      suggested: 50,
      supplier: 'Oficina Total',
    },
  ];

  // Barras de “Gastos por Mes” (max = 30,120 → 100%)
  spendSeries = [
    { label: '18,250', value: 18250, percent: 61, current: true },
    { label: '22,140', value: 22140, percent: 74, current: false },
    { label: '28,450', value: 28450, percent: 94, current: true }, // mes actual
    { label: '19,320', value: 19320, percent: 64, current: true },
    { label: '30,120', value: 30120, percent: 100, current: true },
    { label: '7,890', value: 7890, percent: 26, current: false },
  ];

  // KPIs “visuales” (valores fijos, sin cálculos)
  avgSpend = 22702; // Promedio mensual mostrado en la tarjeta
  currentSpend = 28450; // Mes actual
  variationPct = 0.253; // 25.3%

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
