import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';

@Component({
    moduleId: module.id,
    selector: 'settings',
    templateUrl: 'settings.html'
})
export class SettingsComponent extends ElectronComponent implements OnInit {

    public versionNumber: string;

    public minimizeToTray: boolean;
    public privacyBlur: boolean;
    private _notificationsEnabled: boolean;
    public anonymousNotifications: boolean;

    constructor(
        private _router: Router,
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
        // TODO all the settings values...
        this.versionNumber = 'v0.3-beta';
        this._notificationsEnabled = true;
    }

    public get notificationsEnabled() {
        return this._notificationsEnabled;
    }
    public set notificationsEnabled(value: boolean) {
        this._notificationsEnabled = value;
        if (!this._notificationsEnabled) {
            this.anonymousNotifications = false;
        }
    }

    public openGithub() {
        this._electron.shell.openExternal('https://github.com/dustincjensen/poke');
    }

    public closeSettings() {
        this._router.navigateByUrl('/conversations');
    }
}