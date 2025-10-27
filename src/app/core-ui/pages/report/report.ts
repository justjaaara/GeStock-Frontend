import { ReportCard } from '@/shared/components/report-card/report-card';
import { StatCard } from '@/shared/components/stat-card/stat-card';
import { Header } from '@/shared/services/header';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, inject } from '@angular/core';
import { ReportsService } from '@/core-ui/services/reports';
import { lastValueFrom } from 'rxjs';

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
  private reportsService = inject(ReportsService);
  
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
      onClick: () => this.downloadInventoryReport(),
    },
    {
      icon: '📄',
      title: 'Reporte de Movimientos',
      desc: 'Productos vendidos por categoría para entender demanda',
      onClick: () => this.downloadSalesByCategoryReport(),
    },
    {
      icon: '🛒',
      title: 'Reporte de Compras',
      desc: 'Órdenes, proveedores y análisis de gastos',
      onClick: () => console.log('Compras'),
    },
    {
      icon: '💵',
      title: 'Reporte de Ingresos',
      desc: 'Ingresos por lote: cuándo y qué productos entraron',
      onClick: () => this.downloadIncomeByLotReport(),
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

  async downloadInventoryReport() {
    try {
      console.log('📊 Descargando reporte de inventario...');
      const data = await lastValueFrom(this.reportsService.getInventoryReport());
      
      // Importar xlsx dinámicamente
      const XLSX = await import('xlsx');
      
      // Preparar datos para el Excel
      const today = new Date().toISOString().split('T')[0];
      
      // Crear hoja de resumen
      const summaryData = [
        ['REPORTE GENERAL DE INVENTARIO'],
        ['Fecha de generación:', today],
        [''],
        ['RESUMEN'],
        ['Total de Productos:', data.totalProducts],
        ['Total de Unidades:', data.totalUnits],
        ['Valor Total del Inventario:', `$${data.totalInventoryValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
        ['Productos con Stock Bajo:', data.lowStockProducts],
        [''],
        ['DETALLE DE PRODUCTOS'],
      ];
      
      // Encabezados de la tabla
      const headers = [
        'Código',
        'Producto',
        'Categoría',
        'Unidades Disponibles',
        'Stock Mínimo',
        'Precio Unitario',
        'Valor Total',
        'Estado',
        'Lote',
        'Última Actualización'
      ];
      
      summaryData.push(headers);
      
      // Agregar datos de productos
      data.products.forEach(p => {
        summaryData.push([
          p.productCode,
          p.productName,
          p.categoryName,
          p.availableUnits,
          p.minimumStock,
          `$${p.unitPrice.toFixed(2)}`,
          `$${p.totalValue.toFixed(2)}`,
          p.productState,
          p.lotCode,
          new Date(p.lastUpdate).toLocaleString('es-MX')
        ]);
      });
      
      // Crear libro y hoja
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Establecer anchos de columna
      ws['!cols'] = [
        { wch: 12 },  // Código
        { wch: 30 },  // Producto
        { wch: 20 },  // Categoría
        { wch: 18 },  // Unidades
        { wch: 15 },  // Stock Mínimo
        { wch: 15 },  // Precio
        { wch: 15 },  // Valor Total
        { wch: 12 },  // Estado
        { wch: 15 },  // Lote
        { wch: 20 },  // Última Actualización
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
      
      // Descargar archivo
      XLSX.writeFile(wb, `Reporte-Inventario-${today}.xlsx`);
      
      console.log('✅ Reporte descargado exitosamente');
    } catch (error) {
      console.error('❌ Error al descargar reporte:', error);
      alert('Error al generar el reporte. Por favor intente nuevamente.');
    }
  }

  async downloadSalesByCategoryReport() {
    try {
      console.log('📊 Descargando reporte de productos vendidos por categoría...');
      const data = await lastValueFrom(this.reportsService.getSalesByCategoryReport());
      
      // Importar xlsx dinámicamente
      const XLSX = await import('xlsx');
      
      // Preparar datos para el Excel
      const today = new Date().toISOString().split('T')[0];
      
      // Agrupar productos por categoría
      const categoriesMap = new Map<string, {
        products: any[];
        totalUnits: number;
        totalValue: number;
      }>();

      data.products.forEach(p => {
        if (!categoriesMap.has(p.categoryName)) {
          categoriesMap.set(p.categoryName, {
            products: [],
            totalUnits: 0,
            totalValue: 0
          });
        }
        const category = categoriesMap.get(p.categoryName)!;
        category.products.push(p);
        category.totalUnits += p.unitsSold;
        category.totalValue += p.totalSalesValue;
      });

      // Crear hoja de resumen
      const summaryData: any[][] = [
        ['REPORTE DE PRODUCTOS VENDIDOS POR CATEGORÍA'],
        ['Fecha de generación:', today],
        [''],
        ['RESUMEN'],
        ['Total de Categorías:', data.totalCategories],
        ['Total de Productos:', data.totalProducts],
        ['Total de Unidades Vendidas:', data.totalUnitsSold],
        ['Valor Total de Ventas:', `$${data.totalSalesValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
        ['Categoría Top:', data.topCategory],
        [''],
      ];

      // Agregar tabla agrupada por categoría
      summaryData.push(['categoria', 'Unidades vendidas', 'Valor Total Ventas']);

      // Agregar cada categoría con sus totales
      categoriesMap.forEach((categoryData, categoryName) => {
        summaryData.push([
          categoryName,
          categoryData.totalUnits,
          `$${categoryData.totalValue.toFixed(2)}`
        ]);
      });

      // Crear libro y hoja
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Establecer anchos de columna
      ws['!cols'] = [
        { wch: 20 },  // Categoría
        { wch: 20 },  // Unidades vendidas
        { wch: 20 },  // Valor Total Ventas
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Ventas por Categoría');
      
      // Descargar archivo
      XLSX.writeFile(wb, `Reporte-Ventas-Categoria-${today}.xlsx`);
      
      console.log('✅ Reporte de ventas por categoría descargado exitosamente');
    } catch (error) {
      console.error('❌ Error al descargar reporte:', error);
      alert('Error al generar el reporte. Por favor intente nuevamente.');
    }
  }

  async downloadIncomeByLotReport() {
    try {
      console.log('📥 Descargando reporte de ingresos por lote...');
      const data = await lastValueFrom(this.reportsService.getIncomeByLotReport());
      
      // Importar xlsx dinámicamente
      const XLSX = await import('xlsx');
      
      // Preparar datos para el Excel
      const today = new Date().toISOString().split('T')[0];
      
      // Crear hoja de resumen
      const summaryData = [
        ['REPORTE DE INGRESOS POR LOTE'],
        ['Fecha de generación:', today],
        [''],
        ['RESUMEN'],
        ['Total de Lotes:', data.totalLots],
        ['Total de Productos:', data.totalProducts],
        ['Total de Unidades:', data.totalUnits],
        ['Valor Total:', `$${data.totalValue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`],
        ['Entrada Más Reciente:', new Date(data.mostRecentEntry).toLocaleDateString('es-MX')],
        [''],
        ['DETALLE DE INGRESOS POR LOTE'],
      ];
      
      // Encabezados de la tabla
      const headers = [
        'Lote',
        'Código Lote',
        'Descripción',
        'Fecha Entrada',
        'Código Producto',
        'Producto',
        'Categoría',
        'Medida',
        'Unidades Actuales',
        'Precio Unitario',
        'Valor Total',
        'Estado',
        'Última Actualización'
      ];
      
      summaryData.push(headers);
      
      // Agregar datos de lotes
      data.items.forEach(item => {
        summaryData.push([
          item.lotId,
          item.lotCode,
          item.lotDescription,
          new Date(item.entryDate).toLocaleDateString('es-MX'),
          item.productCode,
          item.productName,
          item.categoryName,
          item.measurementName,
          item.currentUnits,
          `$${item.unitPrice.toFixed(2)}`,
          `$${item.totalValue.toFixed(2)}`,
          item.productState,
          new Date(item.lastUpdate).toLocaleString('es-MX')
        ]);
      });
      
      // Crear libro y hoja
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(summaryData);
      
      // Establecer anchos de columna
      ws['!cols'] = [
        { wch: 10 },  // Lote ID
        { wch: 15 },  // Código Lote
        { wch: 25 },  // Descripción
        { wch: 15 },  // Fecha Entrada
        { wch: 15 },  // Código Producto
        { wch: 30 },  // Producto
        { wch: 20 },  // Categoría
        { wch: 12 },  // Medida
        { wch: 15 },  // Unidades
        { wch: 15 },  // Precio
        { wch: 15 },  // Valor Total
        { wch: 12 },  // Estado
        { wch: 20 },  // Última Actualización
      ];
      
      XLSX.utils.book_append_sheet(wb, ws, 'Ingresos por Lote');
      
      // Descargar archivo
      XLSX.writeFile(wb, `Reporte-Ingresos-Lote-${today}.xlsx`);
      
      console.log('✅ Reporte de ingresos por lote descargado exitosamente');
    } catch (error) {
      console.error('❌ Error al descargar reporte:', error);
      alert('Error al generar el reporte. Por favor intente nuevamente.');
    }
  }

  prevPage() {
    if (this.page > 1) this.page--;
  }
  nextPage() {
    if (this.page < this.totalPages) this.page++;
  }
}
