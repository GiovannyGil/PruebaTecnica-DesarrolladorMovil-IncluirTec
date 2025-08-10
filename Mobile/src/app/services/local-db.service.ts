import { Injectable } from '@angular/core';
import {
    CapacitorSQLite,
    SQLiteConnection,
    SQLiteDBConnection
} from '@capacitor-community/sqlite';
import { Tarea } from '../models/tarea.model';

const DB_NAME = 'tasks_db';
const DB_VERSION = 1;

@Injectable({
    providedIn: 'root'
})
export class LocalDbService {
    sqlite: SQLiteConnection;
    db: SQLiteDBConnection | null = null;

    constructor() {
        this.sqlite = new SQLiteConnection(CapacitorSQLite);
    }

    async init() {
        try {
            // crear conexión y abrir
            await this.sqlite.checkConnectionsConsistency();
            this.db = await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', DB_VERSION, false);
            await this.db.open();

            const createSql = `
                CREATE TABLE IF NOT EXISTS tareas (
                    id TEXT PRIMARY KEY,
                    titulo TEXT NOT NULL,
                    descripcion TEXT,
                    completada INTEGER NOT NULL,
                    createdAt TEXT NOT NULL,
                    updatedAt TEXT NOT NULL,
                    deleted INTEGER DEFAULT 0,
                    pending INTEGER DEFAULT 0,
                    pendingAction TEXT
                );`;
            await this.db.execute(createSql);
        } catch (err) {
            console.error('LocalDbService.init error', err);
            throw err;
        }
    }

    // convierte INTEGER 0/1 a boolean
    private rowToTarea(row: any): Tarea {
        return {
            id: row.id,
            titulo: row.titulo,
            descripcion: row.descripcion,
            completada: !!row.completada,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
            deletedAt: row.deletedAt,
            pending: !!row.pending,
            pendingAction: row.pendingAction
        };
    }

    async getAll(): Promise<Tarea[]> {
        if (!this.db) await this.init();
        const res = await this.db!.query('SELECT * FROM tareas WHERE deletedAt IS NULL');
        return res.values ? res.values.map((r: any) => this.rowToTarea(r)) : [];
    }

    async getAllIncludingDeleted(): Promise<Tarea[]> {
        if (!this.db) await this.init();
        const res = await this.db!.query('SELECT * FROM tareas');
        return res.values ? res.values.map((r: any) => this.rowToTarea(r)) : [];
    }

    async upsert(t: Tarea, markPending = true, action?: Tarea['pendingAction']) {
        if (!this.db) await this.init();
        const exists = await this.db!.query('SELECT id FROM tareas WHERE id = ?', [t.id]);
        const params = [
            t.id, t.titulo, t.descripcion ?? null, t.completada ? 1 : 0,
            t.createdAt, t.updatedAt, t.deletedAt ? 1 : 0, markPending ? 1 : 0, action ?? null
        ];
        if (exists.values && exists.values.length > 0) {
            // update
            await this.db!.run(
                `UPDATE tareas SET titulo=?, descripcion=?, completada=?, createdAt=?, updatedAt=?, deletedAt=?, pending=?, pendingAction=? WHERE id=?`,
                [t.titulo, t.descripcion ?? null, t.completada ? 1 : 0, t.createdAt, t.updatedAt, t.deletedAt ? 1 : 0, markPending ? 1 : 0, action ?? null, t.id]
            );
        } else {
            await this.db!.run(
                `INSERT INTO tareas (id, titulo, descripcion, completada, createdAt, updatedAt, deletedAt, pending, pendingAction) VALUES (?,?,?,?,?,?,?,?,?)`,
                params
            );
        }
    }

    async markSynced(id: string) {
        if (!this.db) await this.init();
        await this.db!.run('UPDATE tareas SET pending=0, pendingAction=NULL WHERE id=?', [id]);
    }

    async getPending(): Promise<Tarea[]> {
        if (!this.db) await this.init();
        const res = await this.db!.query('SELECT * FROM tareas WHERE pending = 1 ORDER BY updatedAt ASC');
        return res.values ? res.values.map((r: any) => this.rowToTarea(r)) : [];
    }

    async deleteLocal(id: string, markPending = true) {
        if (!this.db) await this.init();
        // soft delete
        await this.db!.run('UPDATE tareas SET deleted=1, pending=?, pendingAction=? WHERE id=?', [markPending ? 1 : 0, 'delete', id]);
    }

    async clearAll() {
        if (!this.db) await this.init();
        await this.db!.run('DELETE FROM tareas');
    }
}
