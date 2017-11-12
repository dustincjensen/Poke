import { Injectable } from '@angular/core';
import { NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
import { ISettings } from '../../../shared/interfaces';

@Injectable()
export class SettingsService extends ElectronComponent {

    constructor(
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public getSettings(): Promise<ISettings> {
        return this._toPromise('settingsRetrieved', 'getSettings');
    }

    public setSettings(settings: ISettings): Promise<void> {
        return this._toPromise('settingsUpdated', 'updateSettings', settings);
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