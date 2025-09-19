import { Routes } from '@angular/router';
import { Login } from './auth/pages/login/login';
import { SignUp } from './auth/pages/sign-up/sign-up';
import { Dashboard } from './core-ui/pages/dashboard/dashboard';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'sign-up', component: SignUp },
  { path: 'dashboard', component: Dashboard },
];
