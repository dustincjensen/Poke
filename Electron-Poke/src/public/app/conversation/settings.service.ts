import { Injectable, EventEmitter } from '@angular/core';
import { NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';

@Injectable()
export class SettingsService extends ElectronComponent {

    settings = new EventEmitter<any>();

    constructor(
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
        this.registerIpcRendererMethod('settingsRetrieved', this._handleSettingsRetrieved);
    }

    private _handleSettingsRetrieved(event, args) {
        this.settings.emit(args);
    }

    public getSettings(): void {
        this._electron.ipcRenderer.send('getSettings');
    }
}