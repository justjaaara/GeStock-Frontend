import { Component, Input, signal, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Auth } from '@/auth/services/auth';

type MenuItem = {
  label: string;
  link: string;
  icon: string | SafeHtml;
  notificationCount?: number;
  adminOnly?: boolean;
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

  //Sanitizer para poder usar los svg (Angular considera cualquier contenido HTML o SVG inyectado como potencialmente peligroso)
  //Con el sanitizer le decimos a angular que confiamos en ese contenido
  private sanitizer = inject(DomSanitizer);
  private authService = inject(Auth);

  // Obtener el rol del usuario autenticado
  userRole = this.authService.userRole;
  isAdmin = computed(() => this.userRole() === 'ADMIN');

  constructor() {
    this.groups.update((groups) =>
      groups.map((group) => ({
        ...group,
        items: group.items.map((item) => {
          if (typeof item.icon !== 'string') return item;

          const val = item.icon.trim();

          // 1) SVG inline: ya lo tienes
          if (val.startsWith('<svg')) {
            return {
              ...item,
              icon: this.sanitizer.bypassSecurityTrustHtml(val),
            };
          }

          // 2) Ruta a archivo en /public/icon/*.svg  -> envolver en <img>
          // (También sirve si usas .png/.jpg en el futuro)
          const isIconPath =
            val.startsWith('/icon/') ||
            /\.(svg|png|jpe?g|gif|webp)$/i.test(val);

          if (isIconPath) {
            const imgTag = `<img src="${val}" alt="" width="20" height="20" />`;
            return {
              ...item,
              icon: this.sanitizer.bypassSecurityTrustHtml(imgTag),
            };
          }

          // 3) Emoji u otros textos: déjalo tal cual (se renderiza con innerHTML)
          return item;
        }),
      }))
    );
  }


  groups = signal<MenuGroup[]>([
    {
      title: 'GENERAL',
      items: [
        { label: 'Dashboard', link: '/dashboard', icon: '/icon/diagrama_de_barras.svg' }, //📊
        { label: 'Inventario', link: '/inventario', icon: '/icon/caja.svg', notificationCount: 182 },
        { label: 'Movimientos', link: '/movimientos', icon: '/icon/reload.svg', adminOnly: true },
        { label: 'Compras', link: '/compras', icon: '/icon/paper.svg' },
        { label: 'Cierres', link: '/cierres', icon: '/icon/closes.svg', adminOnly: true },
      ],
    },
    {
      title: 'ANÁLISIS',
      items: [
        { label: 'Reportes', link: '/reportes', icon: '/icon/report.svg' },
        { label: 'Alertas Stock', link: '/alertas', icon: '/icon/alert.svg', notificationCount: 5 },
      ],
    },
    {
      title: 'ADMIN',
      items: [
        {
          label: 'Administración',
          link: '/administracion',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M22 11h-6l-2 2 2 2h6v-4z"/></svg>',
          adminOnly: true,
        },
      ],
    },
    {
      title: 'SISTEMA',
      items: [{ label: 'Configuraciones', link: '/configuraciones', icon: '/icon/settings.svg' }],
    },
  ]);

  // Computed signal para filtrar grupos según el rol del usuario
  filteredGroups = computed(() => {
    const isAdmin = this.isAdmin();
    const allGroups = this.groups();

    return allGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => !item.adminOnly || isAdmin),
      }))
      .filter((group) => group.items.length > 0); // Eliminar grupos vacíos
  });
}
