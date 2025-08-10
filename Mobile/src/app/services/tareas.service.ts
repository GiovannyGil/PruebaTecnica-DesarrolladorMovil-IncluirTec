import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Tarea } from '../models/tarea.model';

@Injectable({
  providedIn: 'root'
})
export class TareasService {
  /**
   * se inicializa la URL de la API y las claves de caché
   */
  private apiUrl = 'https://logical-rapid-dingo.ngrok-free.app/tareas';
  // private apiUrl = 'http://localhost:3000/tareas';
  private cacheKey = 'tareas-cache';
  private pendientesKey = 'tareas-pendientes';
  private httpOptions = {
    headers: { 'ngrok-skip-browser-warning': 'true' }
  };

  /**
   * Constructor de la clase TareasService
   * @param http El cliente HTTP para realizar las peticiones
   */
  constructor(private http: HttpClient) {
    this.syncPendientes().catch(console.error);

    window.addEventListener('online', () => {
      this.syncPendientes().catch(console.error);
    });
  }

  private async isBackendAlive(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 1500);
      const res = await fetch(this.apiUrl, { method: 'HEAD', signal: controller.signal, ...this.httpOptions });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  }

  /** ---------------------- MÉTODOS CACHE ---------------------- **/
  /**
   * ! Guarda las tareas en caché
   * @param tareas Las tareas a guardar
   */
  private guardarCache(tareas: Tarea[]) {
    localStorage.setItem(this.cacheKey, JSON.stringify(tareas));
  }

  /**
   * ! Obtiene las tareas de la caché
   * @returns Las tareas almacenadas en caché
   */
  private obtenerCache(): Tarea[] {
    return JSON.parse(localStorage.getItem(this.cacheKey) || '[]');
  }

  /** ------------------- MÉTODOS PENDIENTES -------------------- **/
  /**
   * ! Obtiene las tareas pendientes de la caché -> Las tareas que están en proceso de ser sincronizadas
   * @returns Las tareas pendientes almacenadas en caché
   */
  private obtenerLocalPendientes(): any[] {
    return JSON.parse(localStorage.getItem(this.pendientesKey) || '[]');
  }

  /**
   * ! Guarda una tarea pendiente en la caché
   * @param tarea La tarea a guardar
   */
  private guardarLocalPendiente(tarea: any) {
    const pendientes = this.obtenerLocalPendientes();

    // Si ya existe una operación pendiente para esta tarea, la reemplazamos
    const index = pendientes.findIndex(p => p.id === tarea.id && p.operacion === tarea.operacion);
    if (index !== -1) {
      pendientes[index] = tarea;
    } else {
      pendientes.push(tarea);
    }

    localStorage.setItem(this.pendientesKey, JSON.stringify(pendientes));
  }

  /** ---------------------- SINCRONIZACIÓN --------------------- **/
  /**
   * ! Sincroniza las tareas pendientes con el servidor
   * @returns
   */
  private async syncPendientes() {
    if (!(await this.isBackendAlive())) return;

    const pendientes = this.obtenerLocalPendientes();

    // Primero, identificamos las tareas que fueron eliminadas
    const tareasEliminadas = new Set(
      pendientes
        .filter(p => p.operacion === 'eliminar')
        .map(p => p.id)
    );

    // Filtramos las operaciones: no sincronizamos creaciones de tareas que luego fueron eliminadas
    const operacionesASync = pendientes.filter(p => {
      if (p.operacion === 'crear' && tareasEliminadas.has(p.id)) {
        // Esta tarea fue creada offline y luego eliminada offline, no la sincronizamos
        return false;
      }
      return true;
    });

    // Ahora sincronizamos en orden: crear -> actualizar -> eliminar
    const operacionesOrdenadas = [
      ...operacionesASync.filter(p => p.operacion === 'crear'),
      ...operacionesASync.filter(p => p.operacion === 'actualizar'),
      ...operacionesASync.filter(p => p.operacion === 'eliminar')
    ];

    for (const tarea of operacionesOrdenadas) {
      try {
        if (tarea.operacion === 'eliminar') {
          // Eliminación (solo si la tarea existe en el servidor)
          await this.http.delete(`${this.apiUrl}/${tarea.id}`, this.httpOptions).toPromise();
        } else if (tarea.operacion === 'actualizar') {
          // Actualización (incluyendo cambios de estado)
          await this.http.patch(`${this.apiUrl}/${tarea.id}`, {
            titulo: tarea.titulo,
            descripcion: tarea.descripcion,
            completada: tarea.completada
          }, this.httpOptions).toPromise();
        } else if (tarea.operacion === 'crear') {
          // Creación
          await this.http.post(this.apiUrl, {
            titulo: tarea.titulo,
            descripcion: tarea.descripcion,
            completada: tarea.completada
          }, this.httpOptions).toPromise();
        }
      } catch (error) {
        console.error('Error sincronizando tarea:', error);
        // Si hay error, la tarea queda pendiente para el próximo intento
        continue;
      }
    }

    // Solo limpiamos las pendientes si todo salió bien
    localStorage.removeItem(this.pendientesKey);

    // Actualizamos el cache con los datos del servidor
    const tareasActualizadas = await this.http.get<Tarea[]>(this.apiUrl, this.httpOptions).toPromise() ?? [];
    this.guardarCache(tareasActualizadas);
  }

  /** ------------------------ CRUD ----------------------------- **/
  /**
   * ! Obtiene las tareas almacenadas en caché si está offline, si está online obtiene del servidor
   * @returns Las tareas almacenadas en caché/base de datos 
   */
  async obtenerTareas(): Promise<Tarea[]> {
    if (await this.isBackendAlive()) {
      const tareas = await this.http.get<Tarea[]>(this.apiUrl, this.httpOptions).toPromise() ?? [];
      this.guardarCache(tareas);
      return tareas;
    } else {
      // OFFLINE: Combinamos cache con nuevas tareas creadas offline
      const cache = this.obtenerCache();
      const pendientes = this.obtenerLocalPendientes();

      // Creamos un mapa de todas las tareas (cache + creadas offline)
      const todasLasTareas = new Map();

      // Primero agregamos las del cache
      cache.forEach(tarea => {
        todasLasTareas.set(tarea.id, { ...tarea });
      });

      // Luego agregamos las tareas creadas offline
      pendientes
        .filter(p => p.operacion === 'crear')
        .forEach(p => {
          todasLasTareas.set(p.id, {
            id: p.id,
            titulo: p.titulo,
            descripcion: p.descripcion,
            completada: p.completada,
            isOffline: true
          });
        });

      // Aplicamos las actualizaciones pendientes
      pendientes.forEach(p => {
        if (p.operacion === 'actualizar') {
          const tareaExistente = todasLasTareas.get(p.id);
          if (tareaExistente) {
            // Actualizamos la tarea existente con los nuevos datos
            todasLasTareas.set(p.id, {
              ...tareaExistente,
              titulo: p.titulo,
              descripcion: p.descripcion,
              completada: p.completada
            });
          }
        } else if (p.operacion === 'eliminar') {
          // Eliminamos la tarea
          todasLasTareas.delete(p.id);
        }
      });

      // Convertimos el Map de vuelta a array
      return Array.from(todasLasTareas.values());
    }
  }

  /**
   * ! Obtiene una tarea por su ID
   * @param id El ID de la tarea
   * @returns La tarea encontrada o undefined si no existe
   */
  async obtenerTareaPorId(id: number): Promise<Tarea | undefined> {
    if (await this.isBackendAlive()) {
      // ONLINE: pide al backend
      return await this.http.get<Tarea>(`${this.apiUrl}/${id}`, this.httpOptions).toPromise() ?? undefined;
    } else {
      // OFFLINE: busca en cache primero
      let tarea = this.obtenerCache().find(t => t.id === id);

      if (tarea) {
        // Verificamos si hay actualizaciones pendientes para esta tarea
        const pendientes = this.obtenerLocalPendientes();
        const actualizacionPendiente = pendientes.find(p => p.id === id && p.operacion === 'actualizar');

        if (actualizacionPendiente) {
          // Aplicamos la actualización pendiente
          tarea = { ...tarea, ...actualizacionPendiente };
        }

        return tarea;
      }

      // Si no está en cache, busca en las tareas creadas offline (pendientes)
      const pendientes = this.obtenerLocalPendientes();
      const tareaOffline = pendientes.find(p => p.id === id && p.operacion === 'crear');

      if (tareaOffline) {
        return {
          id: tareaOffline.id,
          titulo: tareaOffline.titulo,
          descripcion: tareaOffline.descripcion,
          completada: tareaOffline.completada
        } as Tarea;
      }

      return undefined;
    }
  }

  /**
   * ! Agrega una nueva tarea
   * @param tarea La tarea a agregar
   * @returns La tarea agregada
   *
   * *NOTA: Si está offline, se guardará como creación pendiente, cuando esté online se aplicará la creación (sincronización)
   */
  async agregarTarea(tarea: Tarea): Promise<Tarea> {
    if (await this.isBackendAlive()) {
      const nueva = await this.http.post<Tarea>(this.apiUrl, tarea, this.httpOptions).toPromise();
      const cache = this.obtenerCache();
      cache.push(nueva!);
      this.guardarCache(cache);
      return nueva!;
    } else {
      // OFFLINE: guardamos como pendiente de crear
      const tareaOffline = {
        ...tarea,
        completada: false,
        operacion: 'crear',
        id: Date.now() + Math.random() // ID temporal
      };

      this.guardarLocalPendiente(tareaOffline);
      return tareaOffline;
    }
  }

  /**
   * ! Actualiza una tarea existente
   * @param id El ID de la tarea a actualizar
   * @param tarea Los nuevos datos de la tarea
   * @returns La tarea actualizada
   *
   * *NOTA si está offline, se guardará como actualización pendiente, cuando esté online se aplicará la actualización (sincronización)
   */
  async actualizarTarea(id: number, tarea: Tarea): Promise<Tarea> {
    if (await this.isBackendAlive()) {
      const actualizada = await this.http.patch<Tarea>(`${this.apiUrl}/${id}`, tarea, this.httpOptions).toPromise();
      const cache = this.obtenerCache().map(t => t.id === id ? actualizada! : t);
      this.guardarCache(cache);
      return actualizada!;
    } else {
      // OFFLINE: verificamos si es una tarea creada offline o una del cache
      const pendientes = this.obtenerLocalPendientes();
      const tareaOffline = pendientes.find(p => p.id === id && p.operacion === 'crear');

      if (tareaOffline) {
        // Es una tarea creada offline, actualizamos la entrada de creación directamente
        const pendientesFiltrados = pendientes.filter(p => !(p.id === id && p.operacion === 'crear'));
        const tareaActualizada = {
          id,
          titulo: tarea.titulo,
          descripcion: tarea.descripcion,
          completada: tarea.completada,
          operacion: 'crear' // Sigue siendo una operación de crear, pero con datos actualizados
        };
        pendientesFiltrados.push(tareaActualizada);
        localStorage.setItem(this.pendientesKey, JSON.stringify(pendientesFiltrados));
      } else {
        // Es una tarea del cache, procedemos normalmente
        const cache = this.obtenerCache().map(t => t.id === id ? { ...t, ...tarea } : t);
        this.guardarCache(cache);

        // Guardamos como actualización pendiente
        this.guardarLocalPendiente({
          ...tarea,
          id,
          operacion: 'actualizar'
        });
      }

      return { ...tarea, id } as Tarea;
    }
  }

  /**
   * ! Elimina una tarea por su ID
   * @param id El ID de la tarea a eliminar
   *
   * *NOTA: Si está offline, se guardará como eliminación pendiente, cuando esté online se aplicará la eliminación (sincronización)
   */
  async eliminarTarea(id: number): Promise<void> {
    if (await this.isBackendAlive()) {
      await this.http.delete(`${this.apiUrl}/${id}`, this.httpOptions).toPromise();
      const cache = this.obtenerCache().filter(t => t.id !== id);
      this.guardarCache(cache);
    } else {
      // OFFLINE: verificamos si es una tarea creada offline o una del servidor
      const pendientes = this.obtenerLocalPendientes();
      const tareaOffline = pendientes.find(p => p.id === id && p.operacion === 'crear');

      if (tareaOffline) {
        // Es una tarea creada offline, simplemente la eliminamos de pendientes
        // No necesita sincronización porque nunca existió en el servidor
        const pendientesFiltrados = pendientes.filter(p => p.id !== id);
        localStorage.setItem(this.pendientesKey, JSON.stringify(pendientesFiltrados));
      } else {
        // Es una tarea del servidor, marcamos para eliminar en la sincronización
        this.guardarLocalPendiente({
          id,
          operacion: 'eliminar'
        });
      }

      // En ambos casos, removemos del cache local inmediatamente
      const cache = this.obtenerCache().filter(t => t.id !== id);
      this.guardarCache(cache);
    }
  }

  /**
   * Termina una tarea por su ID
   * @param id El ID de la tarea a terminar
   * @param nuevoEstado El nuevo estado de la tarea (completada o no)
   *
   * *NOTA: Si está offline, se guardará como actualización pendiente, cuando esté online se aplicará la actualización (sincronización)
   */
  async terminarTarea(id: number, nuevoEstado: boolean): Promise<Tarea> {
    if (await this.isBackendAlive()) {
      const actualizada = await this.http.patch<Tarea>(`${this.apiUrl}/terminar/${id}`, {
        completada: nuevoEstado
      }, this.httpOptions).toPromise();
      const cache = this.obtenerCache().map(t => t.id === id ? actualizada! : t);
      this.guardarCache(cache);
      return actualizada!;
    } else {
      // OFFLINE: actualizamos localmente
      const cache = this.obtenerCache();
      const tareaIndex = cache.findIndex(t => t.id === id);

      if (tareaIndex !== -1) {
        cache[tareaIndex] = { ...cache[tareaIndex], completada: nuevoEstado };
        this.guardarCache(cache);

        // Guardamos la actualización como pendiente
        this.guardarLocalPendiente({
          ...cache[tareaIndex],
          operacion: 'actualizar'
        });

        return cache[tareaIndex];
      }

      throw new Error('Tarea no encontrada');
    }
  }
}