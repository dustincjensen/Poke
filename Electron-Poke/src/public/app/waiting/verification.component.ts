import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';

@Component({
    moduleId: module.id,
    selector: 'verification',
    templateUrl: 'verification.html'
})
export class VerificationComponent extends ElectronComponent implements OnInit {

    private _password: string;
    verifyingPassword: boolean;

    constructor(
        private _router: Router,
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
    }

    public passwordChanged(newPassword: string) {
        this._password = newPassword;

        console.log(this._password);
        this.verifyingPassword = true;
    }
}