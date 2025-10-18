import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  isOpen = signal(false);
  isMobile = signal(false);

  toggle(): void {
    this.isOpen.update((value) => !value);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  checkMobile(): void {
    this.isMobile.set(window.innerWidth < 768);
    if (this.isMobile()) {
      this.isOpen.set(false);
    }
  }
}
