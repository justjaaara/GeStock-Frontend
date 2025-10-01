import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';

type Critical = {
  sku: string;
  name: string;
  stock: number;
  forecast: number;
  days: number;
  action: string
};

@Component({
  selector: 'app-projections',
  standalone: true,
  imports: [StatCard, CommonModule],
  templateUrl: './projections.html',
  styleUrl: './projections.css'
})
export class Projections implements OnInit, OnDestroy {

  constructor(private header: Header) { }

  ngOnInit(): void {
    this.header.title.set('Proyecciones de Demanda');
    this.header.breadcrumbs.set([{ label: 'Inicio', link: '/' }, { label: 'Analisis', link: '/' }, { label: 'Proyecciones' }]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([
      { label: '', icon: '🌙', onClick: () => console.log('Modo Oscuro') },
      { label: 'Configurar Modelos', onClick: () => console.log('Configurar Modelos') },
      { label: 'Nueva proyección', icon: '➕', onClick: () => console.log('Nueva proyección') },
      { label: 'Admin v1', icon: '🟢', onClick: () => console.log('Admin') }
    ]);
    this.header.actionsTitle.set([
      { label: 'Actualizar Datos', onClick: () => console.log('Actualizar Datos') },
      { label: 'Exportar Previsiones', onClick: () => console.log('Exportar Previsiones') }
    ]);
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  critical: Critical[] = [
    { sku: 'HP12A', name: 'Tóner HP 12A', stock: 8, forecast: 24, days: 10, action: 'Ordenar' },
    { sku: 'PAP-A4', name: 'Papel A4', stock: 12, forecast: 180, days: 2, action: 'Urgente' },
    { sku: 'CAJ-ARCH', name: 'Cajas Archivo', stock: 17, forecast: 32, days: 16, action: 'Planificar' },
    { sku: 'CLIPS', name: 'Clips', stock: 182, forecast: 45, days: 121, action: 'OK' },
    { sku: 'PAP-A3', name: 'Papel A3', stock: 5, forecast: 60, days: 3, action: 'Urgente' },
    { sku: 'TON-HP05', name: 'Tóner HP 05', stock: 3, forecast: 15, days: 5, action: 'Ordenar' },
    { sku: 'BOL-ESCR', name: 'Bolígrafos', stock: 50, forecast: 100, days: 25, action: 'Planificar' },
  ];

  recs = { criticos: 3, planificar: 8, optimos: 234 };

  currInv = 142_580;
  optInv = 128_340;
  get savings() { return this.currInv - this.optInv; }

  nextUpdate = new Date(2025, 8, 4, 6, 0); // dd/mm/yyyy 06:00

}
