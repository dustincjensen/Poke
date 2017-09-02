import { NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';

export abstract class ElectronComponent {
    constructor(
        protected _electron: ElectronService,
        protected _ngZone: NgZone
    ) { }

    /**
     * Registers a method on the ipc renderer that will be called in the context of angular.
     * @param type The message to listen on the ipc renderer.
     * @param method The method to run when the event is fired.
     */
    protected registerIpcRendererMethod(type: string, method: (event, args) => void) {
        this._electron.ipcRenderer.on(type, (event, args) => {
            this._ngZone.run(() => {
                method.apply(this, [event, args]);
            });
        });
    }
}