import { Component, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonInput, IonItem, IonButton, IonList, IonCheckbox, IonLabel, IonToggle, IonIcon,} from '@ionic/angular/standalone';
import { Tarea, TareasService } from '../services/tareas.service';
import { IonicModule, ModalController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { RouterModule } from '@angular/router';

import { addIcons } from 'ionicons'; // para registrar iconos
import { addOutline, trashOutline, pencilOutline } from 'ionicons/icons'; // iconos a usar

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonLabel, IonList, IonButton, IonItem,
    IonHeader, IonToolbar, IonTitle, IonContent, FormsModule,
    NgFor, IonToggle, IonIcon, RouterModule
  ]
})
/**
 * Componente principal de la aplicación
 * carga las tareas
 */
export class HomePage {
  tareas: Tarea[] = [];
  nuevaTarea: string = '';

  /**
   * el contructor, inicializa el servicio de tareas
   * @param tareasService 
   */
  constructor(
    private tareasService: TareasService,
  ) {
    /**
     * Registra los iconos que se utilizarán en la aplicación
     */
    addIcons({
      addOutline,
      trashOutline,
      pencilOutline
    });
  }

  /**
   * Se ejecuta al inicializar el componente
   * @returns los metodos incializados dentro
   */
  ngOnInit() {
    this.cargarTareas();
  }

  /**
   * Se ejecuta cuando la vista está a punto de entrar
   * actualiza la lista de tareas "en tiempo real"
   */
  ionViewWillEnter() {
    this.cargarTareas();
  }

  /**
   * Carga las tareas desde el servicio y las asigna a la variable local
   */
  cargarTareas() {
    this.tareasService.obtenerTareas().subscribe((data: Tarea[]) => {
      this.tareas = data;
    });
  }

  /**
   * Cambia el estado de una tarea
   * @param tarea La tarea a modificar
   */
  cambiarEstado(tarea: Tarea) {
    this.tareasService.terminarTarea(tarea.id!).subscribe(() => this.cargarTareas());
  }

  /**
   * Elimina una tarea
   * @param id El ID de la tarea a eliminar
   */
  eliminarTarea(id: number) {
    this.tareasService.eliminarTarea(id).subscribe(() => this.cargarTareas());
  }
}
