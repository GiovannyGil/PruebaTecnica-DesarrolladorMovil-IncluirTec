import { Routes } from '@angular/router';
import { TareaformComponent } from './home/tareaform/tareaform.component';


/**
 * Rutas de la aplicación
 */
export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  { path: 'tarea', component: TareaformComponent }, // para agregar
  { path: 'tarea/:id', component: TareaformComponent } // para editar
];
