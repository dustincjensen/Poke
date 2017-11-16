import { Injectable, EventEmitter } from '@angular/core';
import { NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
import { ISettings } from '../../../shared/interfaces';

@Injectable()
export class SettingsService extends ElectronComponent {

    public settingsUpdated = new EventEmitter<ISettings>();

    constructor(
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public async getSettings(): Promise<ISettings> {
        return await this._toPromise<ISettings>('settingsRetrieved', 'getSettings');
    }

    public async setSettings(settings: ISettings): Promise<void> {
        await this._toPromise<void>('settingsUpdated', 'updateSettings', settings);
        this.settingsUpdated.emit(settings);
    }

    /**
     * Returns a promise that can be awaited instead of the callback
     * stuff we have now for the ipc renderer.
     * @param on the string to register ipc renderer listener with.
     * @param send the string to send to the ipc main listener.
     * @param sendArgs the arguments to send to the ipc main listener.
     */
    private _toPromise<T>(on: string, send: string, sendArgs?: any): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            // Set the register listener that only listens 1 time.
            this.registerIpcRendererMethodOneTime(on, (event, args) => resolve(args));

            // If we don't hear back from the method in time then we should reject 
            // it, so it doesn't sit forever unresolved.
            setTimeout(() => reject(), 5000);

            // Send the message to the backend
            this._electron.ipcRenderer.send(send, sendArgs);
        });
    }
}