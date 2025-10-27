import { StatCard } from '@/shared/components/stat-card/stat-card';
import { UiModal } from '@/shared/components/ui-modal/ui-modal';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal, inject, afterNextRender } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '@/auth/services/auth';
import { AlertsService } from '@/alerts/services/alerts.service';
import { StockAlert } from '@/alerts/interfaces/alerts';
import { ProductsService } from '@/core-ui/services/products';

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
  imports: [StatCard, CommonModule, UiModal, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit, OnDestroy {
  newOpen = false;

  // Servicios inyectados
  private header = inject(Header);
  private authService = inject(Auth);
  private alertsService = inject(AlertsService);
  private productsService = inject(ProductsService);

  // Obtener rol del usuario
  userRole = this.authService.userRole;
  isAdmin = computed(() => this.userRole() === 'ADMIN');

  // Señales para alertas
  alerts = signal<StockAlert[]>([]);
  alertsLoading = signal(false);
  totalAlerts = signal(0);

  // Señales para productos
  totalProducts = signal(0);
  productsLoading = signal(false);

  constructor() {
    // Usar afterNextRender para asegurar que todo esté inicializado
    afterNextRender(() => {
      this.loadAlerts();
      this.loadProductStats();
    });
  }

  ngOnInit(): void {
    this.header.title.set('Visión General');
    this.header.breadcrumbs.set([{ label: 'Inicio', link: '/' }, { label: 'Dashboard' }]);
    this.header.showSearch.set(true);
    this.header.actionsTopbar.set([{ label: 'Nuevo', icon: '➕', onClick: () => this.openNew() }]);
    this.header.actionsTitle.set([
      { label: 'Exportar', onClick: () => console.log('Exportar') },
      { label: 'Reportes rapidos', onClick: () => console.log('Nuevo') },
    ]);
  }

  ngOnDestroy(): void {
    this.header.reset();
  }

  loadAlerts(): void {
    this.alertsLoading.set(true);
    
    this.alertsService.getAllStockAlerts().subscribe({
      next: (alerts) => {
        console.log('✅ Alertas cargadas:', alerts);
        this.alerts.set(alerts);
        this.totalAlerts.set(alerts.length);
        this.alertsLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando alertas:', error);
        this.alertsLoading.set(false);
      }
    });
  }

  loadProductStats(): void {
    this.productsLoading.set(true);
    
    console.log('🔄 Iniciando carga de estadísticas de productos...');
    
    this.productsService.getProductStats().subscribe({
      next: (stats) => {
        console.log('✅ Estadísticas de productos cargadas:', stats);
        this.totalProducts.set(stats.totalProducts);
        this.productsLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando estadísticas de productos:', error);
        console.error('Detalles del error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: error.url
        });
        // Establecer un valor por defecto en caso de error
        this.totalProducts.set(0);
        this.productsLoading.set(false);
      }
    });
  }

  // Obtener las primeras 3 alertas para el dashboard
  get topAlerts() {
    return this.alerts().slice(0, 3);
  }

  // Determinar severidad basada en el tipo de alerta
  getAlertSeverity(alert: StockAlert): string {
    if (alert.alertType === 'Sin Stock') return 'Crítico';
    if (alert.alertType === 'Crítico') return 'Crítico';
    return 'Bajo';
  }

  // Datos de movimientos - solo para admin (vacío por ahora, se implementará después)
  movs: Movimiento[] = [];

  // Stock bajo - se calculará desde las alertas
  get stockTop() {
    return this.alerts()
      .slice(0, 5)
      .map(alert => ({
        label: alert.productName,
        value: alert.currentStock
      }));
  }

  get maxStock() {
    const values = this.stockTop.map((x) => x.value);
    return values.length > 0 ? Math.max(...values) : 1;
  }

  barHeight(v: number) {
    return (v / this.maxStock) * 100;
  }

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
