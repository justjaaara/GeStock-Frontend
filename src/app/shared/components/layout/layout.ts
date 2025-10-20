import { Component, inject, signal, HostListener } from '@angular/core';
import { Header } from '@/shared/services/header';
import { Auth } from '@/auth/services/auth';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Sidebar } from '@/shared/components/sidebar/sidebar';
import { Modal } from '@/shared/components/modal/modal';
import { SidebarService } from '@/shared/services/sidebar/sidebar';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, Sidebar, Modal],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {
  header = inject(Header);
  private authService = inject(Auth);
  sidebarService = inject(SidebarService);

  showLogoutModal = signal(false);

  getUserName(): string {
    return this.authService.userName();
  }
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  openLogoutModal(): void {
    this.showLogoutModal.set(true);
  }

  confirmLogout(): void {
    this.authService.logout();
  }

  cancelLogout(): void {
    this.showLogoutModal.set(false);
  }
}
