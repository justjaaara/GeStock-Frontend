import { Routes } from '@angular/router';
import { authGuard } from './auth/guards/auth.guard';
import { guestGuard } from './auth/guards/guest.guard';
import { ForgotPassword } from './auth/pages/forgot-password/forgot-password';
import { Login } from './auth/pages/login/login';
import { ResetPassword } from './auth/pages/reset-password/reset-password';
import { SignUp } from './auth/pages/sign-up/sign-up';
import { Alerts } from './core-ui/pages/alerts/alerts';
import { Client } from './core-ui/pages/client/client';
import { Dashboard } from './core-ui/pages/dashboard/dashboard';
import { Inventory } from './core-ui/pages/inventory/inventory';
import { MovementHistory } from './core-ui/pages/movement-history/movement-history';
import { Projections } from './core-ui/pages/projections/projections';
import { Report } from './core-ui/pages/report/report';
import { Settings } from './core-ui/pages/settings/settings';
import { Shopping } from './core-ui/pages/shopping/shopping';
import { Supplier } from './core-ui/pages/supplier/supplier';
import { Layout } from './shared/components/layout/layout';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'sign-up', component: SignUp, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPassword, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPassword },
  {
    path: 'dashboard',
    component: Layout,
    children: [
      {
        path: '',
        component: Dashboard,
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'inventario',
    component: Layout,
    children: [
      {
        path: '',
        component: Inventory,
      },
    ],
    canActivate: [authGuard],
  },

  {
    path: 'movimientos',
    component: Layout,
    children: [
      {
        path: '',
        component: MovementHistory,
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'compras',
    component: Layout,
    children: [
      {
        path: '',
        component: Shopping,
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'proveedores',
    component: Layout,
    children: [
      {
        path: '',
        component: Supplier,
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'clientes',
    component: Layout,
    children: [
      {
        path: '',
        component: Client,
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'reportes',
    component: Layout,
    children: [
      {
        path: '',
        component: Report,
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'proyecciones',
    component: Layout,
    children: [
      {
        path: '',
        component: Projections,
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'alertas',
    component: Layout,
    children: [
      {
        path: '',
        component: Alerts,
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'configuraciones',
    component: Layout,
    children: [
      {
        path: '',
        component: Settings,
      },
    ],
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '/login' },
];