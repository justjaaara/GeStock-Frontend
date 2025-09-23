import { Injectable, signal } from '@angular/core';

export type HeaderAction = {
  label: string;
  icon?: string;
  variant?: 'primary' | 'ghost';
  onClick?: () => void;
  link?: string;
};

@Injectable({
  providedIn: 'root'
})

export class Header {
  title = signal<string>('');
  breadcrumbs = signal<{ label: string; link?: string }[]>([]);
  showSearch = signal<boolean>(true);
  actionsTopbar = signal<HeaderAction[]>([]);
  actionsTitle = signal<HeaderAction[]>([]);

  reset() {
    this.title.set('');
    this.breadcrumbs.set([]);
    this.showSearch.set(true);
    this.actionsTopbar.set([]);
    this.actionsTitle.set([]);
  }
}
