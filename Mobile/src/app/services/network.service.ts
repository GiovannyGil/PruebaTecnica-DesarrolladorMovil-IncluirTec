import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Network } from '@capacitor/network';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NetworkService {
    private _status$ = new BehaviorSubject<boolean>(false);
    public status$ = this._status$.asObservable();

    // pon aquí la base URL del backend; si está en tu PC y pruebas en dispositivo, usa la IP
    backendUrl = 'http://192.168.18.127:3000'; // reemplaza por la IP de tu PC o por http://localhost:3000 si pruebas en navegador

    constructor(private http: HttpClient) {
        this.init();
    }

    async init() {
        // escucha cambios de red a nivel sistema
        Network.addListener('networkStatusChange', async () => {
            const ok = await this.checkBackend();
            this._status$.next(ok);
        });

        // primera comprobación
        const ok = await this.checkBackend();
        this._status$.next(ok);
    }

    // intenta una petición pequeña al backend para validar conectividad real
    async checkBackend(): Promise<boolean> {
        try {
            const url = `${this.backendUrl}/tareas`; // endpoint existente
            // hacemos peticion corta con timeout manual
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000);
            const resp = await fetch(url, { method: 'GET', signal: controller.signal });
            clearTimeout(id);
            return resp.ok;
        } catch (err) {
            return false;
        }
    }
}
