import { Injectable, EventEmitter } from '@angular/core';
import { NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
import { ISettings } from '../../../shared/interfaces';

@Injectable()
export class SettingsService extends ElectronComponent {

    save = new EventEmitter<any>();

    constructor(
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
        this.registerIpcRendererMethod('settingsUpdated', this._handleSettingsUpdated);
    }

    private _handleSettingsUpdated(event, args) {
        this.save.emit(true);
    }

    public getSettings(): Promise<ISettings> {
        let promise = new Promise<ISettings>((resolve, reject) => {
            // Set the register listener that only listens 1 time.
            this.registerIpcRendererMethodOneTime('settingsRetrieved', (event, args) => {
                resolve(args);
            });

            // If we don't hear back from the method in time
            // then we should reject it, so it doesn't sit
            // forever unresolved.
            setTimeout(() => {
                reject();
            }, 5000);

            // Send the message to the backend.
            this._electron.ipcRenderer.send('getSettings');
        });
        return promise;
    }

    public setSettings(settings: ISettings): void {
        this._electron.ipcRenderer.send('updateSettings', settings);
    }
}