import { Injectable, EventEmitter } from '@angular/core';
import { NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
import { ISettings } from '../../../shared/interfaces';

@Injectable()
export class SettingsService extends ElectronComponent {

    settings = new EventEmitter<ISettings>();
    save = new EventEmitter<any>();

    constructor(
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
        this.registerIpcRendererMethod('settingsRetrieved', this._handleSettingsRetrieved);
        this.registerIpcRendererMethod('settingsUpdated', this._handleSettingsUpdated);
    }

    private _handleSettingsRetrieved(event, args) {
        this.settings.emit(args);
    }

    private _handleSettingsUpdated(event, args) {
        this.save.emit(true);
    }

    public getSettings(): void {
        this._electron.ipcRenderer.send('getSettings');
    }

    public setSettings(settings: ISettings): void {
        this._electron.ipcRenderer.send('updateSettings', settings);
    }
}