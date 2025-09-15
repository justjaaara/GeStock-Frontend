import { Routes } from '@angular/router';
import { Login } from './auth/pages/login/login';
import { SignUp } from './auth/pages/sign-up/sign-up';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'sign-up', component: SignUp },
];
