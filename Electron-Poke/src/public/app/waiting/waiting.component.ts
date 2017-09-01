import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';

@Component({
    moduleId: module.id,
    selector: 'waiting',
    templateUrl: 'waiting.html'
})
export class WaitingComponent {

    constructor(
        private _electron: ElectronService,
        private _ngZone: NgZone,
        private _router: Router
    ) {
    }

    private async ngOnInit() {
        this._electron.ipcRenderer.on('tcp-connected', (event, args) => {
            console.log('New TCP connection.');
            if (args) {
                this._ngZone.run(() => {
                    this._router.navigateByUrl('example');
                });
            }
        });
    }
}