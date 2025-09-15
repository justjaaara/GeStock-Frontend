import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-auth-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-header.html',
  styleUrl: './auth-header.css',
  standalone: true
})
export class AuthHeader implements OnInit {
  isLoginPage: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // Verificar la ruta inicial
    this.checkCurrentRoute(this.router.url);

    // Suscribirse a cambios de ruta
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.checkCurrentRoute(event.url);
    });
  }

  private checkCurrentRoute(url: string) {
    this.isLoginPage = url.includes('/login');
  }
}
