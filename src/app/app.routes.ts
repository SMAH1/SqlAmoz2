import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: 'dbquery',
    loadComponent: () => import('./db-query/db-query.component').then(m => m.DbQueryComponent)
  },
  { path: '**', redirectTo: '/dbquery' }
];
