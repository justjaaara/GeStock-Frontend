import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

type Supplier_list = {
  code: string;
  name: string;
  ruc: string;
  phone: string;
  email: string;
  category: string;
  products: number;
  lastPurchase: string;
  total: number;
  status: string;
};

@Component({
  selector: 'app-supplier',
  standalone: true,
  imports: [StatCard, CommonModule],
  templateUrl: './supplier.html',
  styleUrl: './supplier.css',
})
export class Supplier implements OnInit, OnDestroy {
  constructor(private header: Header) {}

  ngOnInit(): void {
    this.header.title.set('Gestión de Proveedores');
    this.header.breadcrumbs.set([{ label: 'Inicio', link: '/' }, { label: 'Proveedores' }]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([
      { label: 'Nuevo proveedor', icon: '➕', onClick: () => console.log('Nuevo proveedor') },
    ]);
    this.header.actionsTitle.set([
      { label: 'Exportar lista', onClick: () => console.log('Exportar lista') },
      { label: 'Reporte compras', onClick: () => console.log('Reporte compras') },
    ]);
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  suppliers: Supplier_list[] = [
    {
      code: 'PR001',
      name: 'Papelería Central',
      ruc: '20123456789',
      phone: '(01) 234-5678',
      email: 'ventas@papeleriacentral.com',
      category: 'Oficina',
      products: 48,
      lastPurchase: '2025-09-02',
      total: 12580,
      status: 'Activo',
    },
    {
      code: 'PR002',
      name: 'TechSupply',
      ruc: '20987654321',
      phone: '(01) 987-6543',
      email: 'info@techsupply.com',
      category: 'Tecnología',
      products: 24,
      lastPurchase: '2025-08-30',
      total: 8940,
      status: 'Activo',
    },
    {
      code: 'PR003',
      name: 'Oficina Total',
      ruc: '20456789123',
      phone: '(01) 456-7890',
      email: 'pedidos@oficinatotal.pe',
      category: 'Oficina',
      products: 32,
      lastPurchase: '2025-08-25',
      total: 6720,
      status: 'Activo',
    },
    {
      code: 'PR004',
      name: 'Muebles Express',
      ruc: '20789123456',
      phone: '(01) 789-1234',
      email: 'ventas@mueblesexpress.com',
      category: 'Mobiliario',
      products: 12,
      lastPurchase: '2025-08-15',
      total: 15200,
      status: 'En evaluación',
    },
    {
      code: 'PR005',
      name: 'Limpieza Pro',
      ruc: '20321665487',
      phone: '(01) 321-6549',
      email: 'admin@limpiezapro.pe',
      category: 'Servicios',
      products: 8,
      lastPurchase: '2025-08-10',
      total: 2180,
      status: 'Inactivo',
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
