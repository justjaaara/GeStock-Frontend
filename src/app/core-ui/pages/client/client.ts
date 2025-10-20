import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

type ClientRow = {
  code: string;
  name: string;
  ruc: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  type: string;
  orders: number;
  lastSale: string;
  total: number;
  credit: number | null;
  status: string;
};

type TopClient = { name: string; orders: number; total: number; avg: number };
type TypeBar = { label: string; percent: number };
type TypeTotal = { label: string; total: number };

@Component({
  selector: 'app-client',
  standalone: true,
  imports: [StatCard, CommonModule],
  templateUrl: './client.html',
  styleUrl: './client.css',
})
export class Client implements OnInit, OnDestroy {
  constructor(private header: Header) {}

  ngOnInit(): void {
    this.header.title.set('Gestión de Clientes');
    this.header.breadcrumbs.set([{ label: 'Inicio', link: '/' }, { label: 'Clientes' }]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([
      { label: '', icon: '🌙', onClick: () => console.log('Modo Oscuro') },
      { label: 'Nuevo cliente', icon: '➕', onClick: () => console.log('Nuevo cliente') },
    ]);
    this.header.actionsTitle.set([
      { label: 'Exportar Lista', onClick: () => console.log('Exportar lista') },
      { label: 'Importar CSV', onClick: () => console.log('Importar CSV') },
      { label: 'Reporte Ventas', onClick: () => console.log('Reporte Ventas') },
    ]);
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  page = 1;
  totalPages = 1;
  totalClients = 6;

  prevPage() {
    if (this.page > 1) this.page--;
  }
  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }

  clients: ClientRow[] = [
    {
      code: 'CL001',
      name: 'Corporación ABC S.A.',
      ruc: '20123456789',
      city: 'Lima',
      country: 'Perú',
      phone: '(01) 234-5678',
      email: 'compras@corpabc.com',
      type: 'Mayorista',
      orders: 28,
      lastSale: '2025-09-01',
      total: 18450,
      credit: 5000,
      status: 'Activo',
    },

    {
      code: 'CL002',
      name: 'Oficinas del Sur',
      ruc: '20987654321',
      city: 'Arequipa',
      country: 'Perú',
      phone: '(054) 987-6543',
      email: 'pedidos@oficsur.pe',
      type: 'Distribuidor',
      orders: 15,
      lastSale: '2025-08-30',
      total: 12680,
      credit: 3500,
      status: 'Activo',
    },

    {
      code: 'CL003',
      name: 'TechStore Lima',
      ruc: '20456789123',
      city: 'Lima',
      country: 'Perú',
      phone: '(01) 456-7890',
      email: 'ventas@techstore.com',
      type: 'Minorista',
      orders: 42,
      lastSale: '2025-09-02',
      total: 8920,
      credit: 1500,
      status: 'Activo',
    },

    {
      code: 'CL004',
      name: 'Empresa Norte',
      ruc: '20789123456',
      city: 'Trujillo',
      country: 'Perú',
      phone: '(044) 789-1234',
      email: 'admin@empresanorte.pe',
      type: 'Mayorista',
      orders: 8,
      lastSale: '2025-08-25',
      total: 15200,
      credit: 4000,
      status: 'Inactivo',
    },

    {
      code: 'CL005',
      name: 'Departamento RR.HH.',
      ruc: '—',
      city: 'Oficina Central',
      country: '—',
      phone: 'Ext. 2401',
      email: 'rrhh@empresa.com',
      type: 'Interno',
      orders: 65,
      lastSale: '2025-09-03',
      total: 2180,
      credit: null,
      status: 'Activo',
    },

    {
      code: 'CL006',
      name: 'Distribuidora Costa',
      ruc: '20321665487',
      city: 'Lima',
      country: 'Perú',
      phone: '(01) 321-6549',
      email: 'ventas@distcosta.pe',
      type: 'Distribuidor',
      orders: 22,
      lastSale: '2025-08-28',
      total: 9840,
      credit: 2500,
      status: 'Moroso',
    },
  ];

  topClients: TopClient[] = [
    { name: 'Corporación ABC S.A.', orders: 28, total: 18450, avg: 659 },
    { name: 'Empresa Norte', orders: 8, total: 15200, avg: 1900 },
    { name: 'Oficinas del Sur', orders: 15, total: 12680, avg: 845 },
    { name: 'Distribuidora Costa', orders: 22, total: 9840, avg: 447 },
    { name: 'TechStore Lima', orders: 42, total: 8920, avg: 212 },
  ];

  // barras simples (porcentaje relativo al máximo)
  typeSeries: TypeBar[] = [
    { label: 'Mayorista', percent: 100 },
    { label: 'Distribuidor', percent: Math.round((22520 / 29400) * 100) }, // ≈77
    { label: 'Minorista', percent: Math.round((8920 / 29400) * 100) }, // ≈30
    { label: 'Interno', percent: Math.round((2180 / 29400) * 100) }, // ≈7
  ];

  typeTotals: TypeTotal[] = [
    { label: 'Mayorista', total: 29400 },
    { label: 'Interno', total: 2180 },
    { label: 'Distribuidor', total: 22520 },
    { label: 'Minorista', total: 8920 },
  ];
}
