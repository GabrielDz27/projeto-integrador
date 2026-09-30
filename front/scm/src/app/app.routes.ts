import { Routes } from '@angular/router';
import { ShellComponent } from './core/layout/shell/shell.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./features/auth/pages/cadastro/cadastro').then((m) => m.Cadastro),
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
    path: '',
    component: ShellComponent,
    children: [
      {
        path: 'inicio',
        loadComponent: () => import('./features/inicio/pages/inicio/inicio.component').then((m) => m.InicioComponent),
      },
      {
        path: 'minha-conta',
        loadComponent: () => import('./features/meu-perfil/pages/minha-conta/minha-conta.component').then((m) => m.MinhaContaComponent),
      },
      {
        path: 'lancamentos',
        loadComponent: () => import('./features/lancamento/pages/lancamento-lista/lancamento-lista.component').then((m) => m.LancamentoListaComponent),
      },
      {
        path: 'obrigacoes',
        loadComponent: () => import('./features/obrigacao/pages/obrigacao-lista/obrigacao-lista.component').then((m) => m.ObrigacaoListaComponent),
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
      {
        path: 'fornecedores',
        loadComponent: () => import('./features/fornecedor/pages/fornecedor-lista/fornecedor-lista.component').then((m) => m.FornecedorListaComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
