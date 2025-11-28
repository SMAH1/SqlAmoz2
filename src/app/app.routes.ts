import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'dbquery',
    loadComponent: () => import('./db-query/db-query.component').then(m => m.DbQueryComponent)
  },
  { path: '**', redirectTo: '' }
];
