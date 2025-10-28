import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-alerts',
  standalone: true,
  imports: [StatCard, CommonModule],
  templateUrl: './alerts.html',
  styleUrl: './alerts.css',
})
export class Alerts implements OnInit, OnDestroy {
  constructor(private header: Header) {}

  ngOnInit(): void {
    this.header.title.set('Centro de Alertas');
    this.header.breadcrumbs.set([
      { label: 'Inicio', link: '/' },
      { label: 'Analisis', link: '/' },
      { label: 'Alertas' },
    ]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([]);
    this.header.actionsTitle.set([]);
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  categories = [
    { icon: '🚨', label: 'Stock Crítico', count: 3, tone: 'danger' },
    { icon: '⚠️', label: 'Stock Bajo', count: 2, tone: 'warn' },
    { icon: '📦', label: 'Órdenes Retrasadas', count: 1, tone: 'info' },
    { icon: '🗓️', label: 'Próximos Vencimientos', count: 0, tone: 'ok' },
  ];

  weekly = [
    { label: 'Nuevas', value: 12 },
    { label: 'Resueltas', value: 9 },
    { label: 'Canceladas', value: 1 },
  ];

  alerts = [
    {
      id: 'A001',
      type: 'Stock Crítico',
      product: 'Tóner HP 12A',
      stock: 8,
      min: 15,
      priority: 'Crítica',
      detected: new Date(2025, 8, 3, 7, 30),
    },
    {
      id: 'A002',
      type: 'Sin Stock',
      product: 'Papel Fotográfico',
      stock: 0,
      min: 10,
      priority: 'Crítica',
      detected: new Date(2025, 8, 2, 16, 45),
    },
    {
      id: 'A003',
      type: 'Stock Bajo',
      product: 'Papel A4',
      stock: 12,
      min: 50,
      priority: 'Alta',
      detected: new Date(2025, 8, 2, 14, 20),
    },
  ];
}
