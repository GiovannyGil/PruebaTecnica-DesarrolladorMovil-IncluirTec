import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonButtons, IonBackButton } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Tarea, TareasService } from 'src/app/services/tareas.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tareaform',
  templateUrl: './tareaform.component.html',
  styleUrls: ['./tareaform.component.scss'],
  imports: [IonBackButton, IonButtons,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonInput, IonButton,
    FormsModule
  ]
})
/**
 * Componente para crear y editar tareas
 */
export class TareaformComponent implements OnInit {
  /**
   * Inicializa una nueva tarea
   */
  tarea: Tarea = { titulo: '', descripcion: '', completada: false };
  modoEdicion = false;

  /**
   * Constructor de la clase
   * @param route 
   * @param router 
   * @param tareasService 
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tareasService: TareasService
  ) { }

  /**
   * Se ejecuta al inicializar el componente
   */
  ngOnInit() {
    // Detectar si viene en modo edición
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.modoEdicion = true;
      this.tareasService.obtenerTareaPorId(+id).subscribe((data) => {
        this.tarea = data;
      });
    }
  }

  /**
   * Guarda o actualiza la tarea segun sea el caso
   * @returns // devuelve a la página principal con la tarea guardada
   */
  guardar() {
    if (this.modoEdicion) {
      // Actualizar
      this.tareasService.actualizarTarea(this.tarea.id!, this.tarea).subscribe(() => {
        this.router.navigateByUrl('/home');
      });
    } else {
      // Crear
      this.tareasService.agregarTarea(this.tarea).subscribe(() => {
        this.router.navigateByUrl('/home');
      });
    }
  }

}
