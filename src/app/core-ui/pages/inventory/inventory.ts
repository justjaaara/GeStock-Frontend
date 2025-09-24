import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

type Product = {
  code: string;
  name: string;
  subtitle?: string;
  category: string;
  stock: number;      // Stock Actual
  min: number;        // Stock Mínimo
  price: number;      // Precio Unit.
  provider: string;   // Proveedor
  status: string;
};

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [StatCard, CommonModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css'
})
export class Inventory implements OnInit, OnDestroy {

  constructor(private header: Header) { }

  ngOnInit(): void {
    this.header.title.set('Inventario de productos');
    this.header.breadcrumbs.set([{ label: 'Inicio', link: '/' }, { label: 'Inventario' }]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([
      { label: '', icon: '🌙', onClick: () => console.log('Modo Oscuro') },
      { label: 'Nuevo producto', icon: '➕', onClick: () => console.log('Nuevo producto') },
      { label: 'Admin v1', icon: '🟢', onClick: () => console.log('Admin') }
    ]);
    this.header.actionsTitle.set([
      { label: 'Exportar Excel', onClick: () => console.log('Exportar excel') },
      { label: 'Importar', onClick: () => console.log('Importar') },
      { label: 'Reporte Stock', onClick: () => console.log('Reportes')}
    ]);
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  products: Product[] = [
    { code: '#P001', name: 'Papel A4 Blanco', subtitle: 'Resma 500 hojas', category: 'Oficina', stock: 620, min: 50, price: 4.50, provider: 'Papelería Central', status: 'Activo' },
    { code: '#P002', name: 'Tóner HP 12A', subtitle: 'Negro Original', category: 'Tecnología', stock: 8, min: 15, price: 89.99, provider: 'TechSupply', status: 'Stock Bajo' },
    { code: '#P003', name: 'Caja de Clips', subtitle: '100 unidades', category: 'Oficina', stock: 182, min: 20, price: 2.25, provider: 'Papelería Central', status: 'Activo' },
    { code: '#P004', name: 'Monitor 24\" LED', subtitle: 'Full HD', category: 'Tecnología', stock: 4, min: 5, price: 245.00, provider: 'TechSupply', status: 'Crítico' },
    { code: '#P005', name: 'Cajas de Archivo', subtitle: 'Pack 10 unidades', category: 'Oficina', stock: 17, min: 25, price: 15.80, provider: 'Papelería Central', status: 'Stock Bajo' },
  ];

  page = 1;
  totalPages = 1;
  totalProducts = 5;

  prevPage() { if (this.page > 1) this.page--; }
  nextPage() { if (this.page < this.totalPages) this.page++; }

}
