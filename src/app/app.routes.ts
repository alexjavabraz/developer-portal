import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPasswordComponent),
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout/layout').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
      },
      {
        path: 'keys',
        loadComponent: () => import('./pages/keys/keys').then(m => m.KeysComponent),
      },
      {
        path: 'docs',
        loadComponent: () => import('./pages/docs/docs').then(m => m.DocsComponent),
      },
      {
        path: 'security',
        loadComponent: () => import('./pages/security/security').then(m => m.SecurityComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
