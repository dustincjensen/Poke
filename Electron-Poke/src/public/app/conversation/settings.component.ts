import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
import { SettingsService } from './settings.service';

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

    private _settingsSubscription: any;

    constructor(
        private _router: Router,
        private _settingsService: SettingsService,
        electron: ElectronService,
        ngZone: NgZone,
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
        // We don't "load" because it will be so fast...
        this._settingsSubscription =
            this._settingsService.settings.subscribe(settings => {
                this.versionNumber = settings.versionNumber;
                this.privacyBlur = settings.privacyBlur;
                this._notificationsEnabled = settings.notificationsEnabled;
                this.anonymousNotifications = settings.anonymousNotifications;
            });
        this._settingsService.getSettings();
    }

    public async ngOnDestroy() {
        this._settingsSubscription.unsubscribe();
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