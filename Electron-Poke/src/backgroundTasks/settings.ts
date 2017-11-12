import { ISettings } from '../shared/interfaces';

export class Settings {

    private static VERSION_NUMBER: string = 'Settings.VersionNumber';
    private static PRIVACY_BLUR: string = 'Settings.PrivacyBlur';
    private static NOTIFICATIONS_ENABLED: string = 'Settings.NotificationsEnabled';
    private static ANONYMOUS_NOTIFICATIONS: string = 'Settings.AnonymousNotifications';

    private static _settings: ISettings;

    public static initializeSettings(): void {
        Settings._settings = {
            versionNumber: Settings._getValueOrDefault(Settings.VERSION_NUMBER, 'v0.3-beta'),
            privacyBlur: Settings._getValueOrDefaultBoolean(Settings.PRIVACY_BLUR, false),
            notificationsEnabled: Settings._getValueOrDefaultBoolean(Settings.NOTIFICATIONS_ENABLED, true),
            anonymousNotifications: Settings._getValueOrDefaultBoolean(Settings.ANONYMOUS_NOTIFICATIONS, false)
        };
    }

    private static _getValueOrDefault(storage: string, defaultValue: string): string {
        let localValue = window.localStorage.getItem(storage);
        return localValue !== null && localValue !== undefined ? localValue : defaultValue;
    }

    private static _getValueOrDefaultBoolean(storage: string, defaultValue: boolean): boolean {
        let localValue = window.localStorage.getItem(storage);
        return localValue !== null && localValue !== undefined ? localValue === 'true' : defaultValue;
    }

    private static _setValueOrDefaultBoolean(storage: string, value: boolean) {
        value !== null && value !== undefined
            ? window.localStorage.setItem(storage, value.toString())
            : window.localStorage.removeItem(storage);
    }

    public static getSettings(): ISettings {
        return this._settings;
    }

    public static setSettings(settings: ISettings): void {
        Settings._settings = settings;
        Settings._setValueOrDefaultBoolean(Settings.PRIVACY_BLUR, settings.privacyBlur);
        Settings._setValueOrDefaultBoolean(Settings.NOTIFICATIONS_ENABLED, settings.notificationsEnabled);
        Settings._setValueOrDefaultBoolean(Settings.ANONYMOUS_NOTIFICATIONS, settings.anonymousNotifications);
    }
}
