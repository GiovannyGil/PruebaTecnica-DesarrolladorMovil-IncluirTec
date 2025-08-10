export interface Tarea {
    id?: number; // en backend es number; offline usamos ids temporales negativos
    titulo: string;
    descripcion?: string;
    completada: boolean; // local usamos 'completada'
    createdAt?: string | null; // opcional, si el backend lo provee usamos para sincronización
    updatedAt?: string | null; // opcional, importante para la política de resolución
    deletedAt?: string | null; // soft delete timestamp
    pending?: boolean; // tiene cambios pendientes
    pendingAction?: 'create' | 'update' | 'delete' | 'terminar';
}
