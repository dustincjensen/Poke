import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';

@Component({
    moduleId: module.id,
    selector: 'waiting',
    templateUrl: 'waiting.html'
})
export class WaitingComponent extends ElectronComponent implements OnInit {

    constructor(
        private _router: Router,
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
        this.registerIpcRendererMethod('tcp-connected', this._handleTcpConnected)
    }

    private _handleTcpConnected(event, args) {
        if (args) {
            this._router.navigateByUrl('verification');
        }
    }
}