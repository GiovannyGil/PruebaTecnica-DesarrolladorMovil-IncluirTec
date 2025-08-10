import { Injectable } from '@angular/core';
import { LocalDbService } from './local-db.service';
import { NetworkService } from './network.service';
import { HttpClient } from '@angular/common/http';
import { Tarea } from '../models/tarea.model';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
    providedIn: 'root'
})
export class SyncService {
    private netSub: Subscription | null = null;
    private syncing = false;

    constructor(
        private localDb: LocalDbService,
        private network: NetworkService,
        private http: HttpClient
    ) {
        // escucha cambios de network status
        this.netSub = this.network.status$.subscribe(ok => {
            if (ok) {
                this.syncAll();
            }
        });
    }

    // sincroniza pendientes primero y luego trae todos del backend y hace merge
    async syncAll() {
        if (this.syncing) return;
        this.syncing = true;
        try {
            // 1) enviar pendientes
            await this.sendPendingToServer();

            // 2) traer del backend
            const backendTareas: Tarea[] = (await this.http.get<Tarea[]>(`${this.network.backendUrl}/tareas`).toPromise()) ?? [];

            // 3) merge (aplicar política: gana quien editó primero -> menor updatedAt)
            const localAll = await this.localDb.getAllIncludingDeleted();
            const localMap = new Map(localAll.map(l => [l.id, l]));

            for (const bt of backendTareas) {
                const lt = localMap.get(bt.id);
                if (!lt) {
                    // no existe local -> insert del backend (no pending)
                    await this.localDb.upsert(bt, false);
                } else {
                    // existe local -> decidir
                    // ambos tienen updatedAt: comparamos
                    const localDate = new Date(lt.updatedAt ?? 0).getTime();
                    const backendDate = new Date(bt.updatedAt ?? 0).getTime();

                    if (localDate === backendDate) {
                        // iguales -> nada
                    } else {
                        // *gana el que editó primero* => menor timestamp
                        if (localDate < backendDate) {
                            // local ganó: mantén local (y actualizar backend si no está sincronizado)
                            // pero asumimos ya se enviaron pendientes
                            // nada que hacer
                        } else {
                            // backend fue editado antes -> backend gana, reemplazamos local
                            await this.localDb.upsert(bt, false);
                        }
                    }
                }
            }

            // 4) por si hay registros locales que no existen en backend
            for (const lt of localAll) {
                const existsInBackend = backendTareas.find(b => b.id === lt.id);
                if (!existsInBackend && !lt.deletedAt) {
                    // registro local sin equivalente en backend
                    // si lt.pendingAction === 'create' o pending == true -> lo dejamos
                    // si no, podríamos enviar como create
                    if (!lt.pending) {
                        // enviar create
                        try {
                            await this.http.post(`${this.network.backendUrl}/tareas`, lt).toPromise();
                        } catch (err) {
                            // si falla, lo dejamos para la próxima sync
                        }
                    }
                }
            }

        } catch (err) {
            console.error('syncAll error', err);
        } finally {
            this.syncing = false;
        }
    }

    private async sendPendingToServer() {
        const pendings = await this.localDb.getPending();
        for (const p of pendings) {
            try {
                if (p.pendingAction === 'create') {
                    await this.http.post(`${this.network.backendUrl}/tareas`, p).toPromise();
                    await this.localDb.markSynced(String(p.id));
                } else if (p.pendingAction === 'update' || p.pendingAction === 'terminar') {
                    await this.http.patch(`${this.network.backendUrl}/tareas/${p.id}`, p).toPromise();
                    await this.localDb.markSynced(String(p.id));
                } else if (p.pendingAction === 'delete') {
                    await this.http.delete(`${this.network.backendUrl}/tareas/${p.id}`).toPromise();
                    // borramos o marcamos como sincronizado
                    await this.localDb.markSynced(String(p.id));
                } else {
                    // unknown action - mark synced to avoid loop
                    await this.localDb.markSynced(String(p.id));
                }
            } catch (err) {
                // si falla, dejamos el registro pendiente para reintentar
                console.warn(`sync send failed for ${p.id}`, err);
            }
        }
    }
}
