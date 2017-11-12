import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
import { SettingsService } from './settings.service';
import { NotificationService } from '../services/notificationService';
import { ISettings } from '../../../shared/interfaces';

@Component({
    moduleId: module.id,
    selector: 'settings',
    templateUrl: 'settings.html'
})
export class SettingsComponent extends ElectronComponent implements OnInit {

    public versionNumber: string;
    private _privacyBlur: boolean;
    private _notificationsEnabled: boolean;
    private _anonymousNotifications: boolean;

    private _saveSettingsSubscription: any;

    constructor(
        private _router: Router,
        private _settingsService: SettingsService,
        private _notificationService: NotificationService,
        electron: ElectronService,
        ngZone: NgZone,
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
        this._saveSettingsSubscription =
            this._settingsService.save.subscribe(saved => {
                // TODO what should we do with the "saved" message.
            });

        // Retrieve the settings that we have
        // setup our subscription to receive.
        let cs = await this._settingsService.getSettings();
        this.versionNumber = cs.versionNumber;
        this._privacyBlur = cs.privacyBlur;
        this._notificationsEnabled = cs.notificationsEnabled;
        this._anonymousNotifications = cs.anonymousNotifications;
    }

    public async ngOnDestroy() {
        this._saveSettingsSubscription.unsubscribe();
    }

    private get _currentSettings(): ISettings {
        return {
            versionNumber: this.versionNumber,
            privacyBlur: this._privacyBlur,
            notificationsEnabled: this._notificationsEnabled,
            anonymousNotifications: this._anonymousNotifications
        };
    }

    public get privacyBlur(): boolean {
        return this._privacyBlur;
    }
    public set privacyBlur(blur: boolean) {
        this._privacyBlur = blur;
        this._settingsService.setSettings(this._currentSettings);
    }

    public get notificationsEnabled() {
        return this._notificationsEnabled;
    }
    public set notificationsEnabled(value: boolean) {
        this._notificationsEnabled = value;
        if (!this._notificationsEnabled) {
            this._anonymousNotifications = false;
        }
        this._settingsService.setSettings(this._currentSettings);
    }

    public get anonymousNotifications(): boolean {
        return this._anonymousNotifications;
    }
    public set anonymousNotifications(value: boolean) {
        this._anonymousNotifications = value;
        this._settingsService.setSettings(this._currentSettings);
    }

    public sendTestNotification() {
        // Can't send a notification...
        if (!this._notificationsEnabled) { return; }

        // Anonymous or not?
        if (this._anonymousNotifications) {
            this._notificationService.sendNewMessageReceivedNotification(
                'New Message (Test Message)', 'Open Poke to see your new message.', true, () => { });
        } else {
            this._notificationService.sendNewMessageReceivedNotification(
                'Sarah (Test Message)', 'Hey, how is it going?', false, () => { });
        }
    }

    public openGithub() {
        this._electron.shell.openExternal('https://github.com/dustincjensen/poke');
    }

    public closeSettings() {
        this._router.navigateByUrl('/conversations');
    }
}