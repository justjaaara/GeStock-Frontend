import { Routes } from '@angular/router';
import { Login } from './auth/pages/login/login';
import { SignUp } from './auth/pages/sign-up/sign-up';
import { Dashboard } from './core-ui/pages/dashboard/dashboard';
import { guestGuard } from './auth/guards/guest.guard';
import { authGuard } from './auth/guards/auth.guard';
import { Layout } from './shared/components/layout/layout';
import { Inventory } from './core-ui/pages/inventory/inventory';
import { MovementHistory } from './core-ui/pages/movement-history/movement-history';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'sign-up', component: SignUp, canActivate: [guestGuard] },
  { path: 'dashboard', component: Layout,
    children:[
      {
        path: '',
        component: Dashboard
      },
    ], canActivate: [authGuard] },
  { path: 'inventario', component: Layout,
    children:[
      { 
        path: '', 
        component: Inventory 
      },
    ], canActivate: [authGuard] },

  { path: 'movimientos', component: Layout,
    children:[
      { 
        path: '', 
        component: MovementHistory 
      },
    ], canActivate: [authGuard] },
  { path: '**', redirectTo: '/login' },
];
