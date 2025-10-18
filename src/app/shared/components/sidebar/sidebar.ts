import { Component, Input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

type MenuItem = {
  label: string;
  link: string;
  icon: string;
  notificationCount?: number;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() appName = 'GeStock';
  @Input() logoUrl = 'logo.png';
  @Input() isOpen = true;

  groups = signal<MenuGroup[]>([
    {
      title: 'GENERAL',
      items: [
        { label: 'Dashboard', link: '/dashboard', icon: '📊' },
        { label: 'Inventario', link: '/inventario', icon: '📦', notificationCount: 182 },
        { label: 'Movimientos', link: '/movimientos', icon: '🔄' },
        { label: 'Compras', link: '/compras', icon: '🧾' },
        { label: 'Proveedores', link: '/proveedores', icon: '🏭' },
        { label: 'Clientes', link: '/clientes', icon: '👥' },
      ],
    },
    {
      title: 'ANÁLISIS',
      items: [
        { label: 'Reportes', link: '/reportes', icon: '📑' },
        { label: 'Proyecciones', link: '/proyecciones', icon: '📈' },
        { label: 'Alertas Stock', link: '/alertas', icon: '⚠️', notificationCount: 5 },
      ],
    },
    {
      title: 'SISTEMA',
      items: [
        { label: 'Usuarios', link: '/usuarios', icon: '👤' },
        { label: 'Configuraciones', link: '/configuraciones', icon: '⚙️' },
      ],
    },
  ]);
}
