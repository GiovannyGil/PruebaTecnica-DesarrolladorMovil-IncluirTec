
/**
 * Modelo que representa una tarea
 * Base y estructura de una tarea en el sistema
 * tipado
 */
export interface Tarea {
    id?: number; // en backend es number; offline usamos ids temporales negativos
    titulo: string;
    descripcion?: string;
    completada: boolean; // local se usa 'completada'
    createdAt?: Date; // si el backend lo provee se usa para sincronización
    updatedAt?: Date; // si el backend lo provee se usa para sincronización
    deletedAt?: Date; // soft delete timestamp
    pending?: boolean; // tiene cambios pendientes
    pendingAction?: 'create' | 'update' | 'delete' | 'terminar';
}
