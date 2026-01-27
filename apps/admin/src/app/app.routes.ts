import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'photo/:id',
    loadComponent: () =>
      import('./features/photo-editor/photo-editor.component').then(
        (m) => m.PhotoEditorComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
