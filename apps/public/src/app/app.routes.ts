import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'gallery',
    loadComponent: () =>
      import('./features/gallery/gallery.component').then((m) => m.GalleryComponent),
  },
  {
    path: 'journal',
    loadComponent: () =>
      import('./features/journal/journal.component').then((m) => m.JournalComponent),
  },
  {
    path: 'lodge',
    loadComponent: () =>
      import('./features/lodge/lodge.component').then((m) => m.LodgeComponent),
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./features/about/about.component').then((m) => m.AboutComponent),
  },
  {
    path: 'photo/:id',
    loadComponent: () =>
      import('./features/photo-viewer/photo-viewer.component').then(
        (m) => m.PhotoViewerComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
