import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'esqueci-minha-senha',
    loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password.component').then((m) => m.ForgotPasswordComponent),
  },
  {
    path: 'redefinir-senha',
    loadComponent: () => import('./features/auth/pages/reset-password/reset-password.component').then((m) => m.ResetPasswordComponent),
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./features/usuario/pages/usuario-lista/usuario-lista.component').then((m) => m.UsuarioListaComponent),
  },
  {
    path: 'clientes',
    loadComponent: () => import('./features/cliente/pages/cliente-lista/cliente-lista.component').then((m) => m.ClienteListaComponent),
  },
  {
    path: 'servicos',
    loadComponent: () => import('./features/servico/pages/servico-lista/servico-lista.component').then((m) => m.ServicoListaComponent),
  },
  { path: '**', redirectTo: 'login' },
];
