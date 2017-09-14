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
    passcodeError: boolean;

    constructor(
        private _router: Router,
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    // TODO handle client disconnected error.
    public async ngOnInit() {
        this.registerIpcRendererMethod('passcodeError', this._handlePasscodeError);
        this.registerIpcRendererMethod('passcodeSuccess', this._handlePasscodeSuccess);
    }

    private _handlePasscodeError(event, args) {
        this.passcodeError = true;
        this.verifyingPassword = false;
    }

    private _handlePasscodeSuccess(event, args) {
        this._router.navigateByUrl('conversations');
    }

    /**
     * Is fired when the code-input completes the password.
     * @param newPassword the password.
     */
    public passwordChanged(newPassword: string) {
        this._password = newPassword;
        this.verifyingPassword = true;
        this.passcodeError = false;

        // Ask Electron Main to do some work.
        this._electron.ipcRenderer.send('passcodeEntered', this._password);
    }
}