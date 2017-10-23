import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Injectable()
export class NotificationService {
    public static iconPath: string = __dirname + '/../../../assets/Stick.png';

    constructor(
        private _electron: ElectronService) {
    }

    public sendNewMessageReceivedNotification(
        title: string,
        body: string,
        privacyMode: boolean,
        func: Function
    ) {
        title = privacyMode ? 'New Message' : title;
        body = privacyMode ? null : body;

        let notificationOptions: any = {
            icon: NotificationService.iconPath
        };

        if (body !== null && body !== undefined && body !== '') {
            if (body.length > 100) {
                body = body.substring(0, 100);
                body += '...';
            }
            notificationOptions.body = body;
        }

        let notification = new Notification(title, notificationOptions);

        notification.onclick = () => {
            this._electron.remote.getCurrentWindow().focus();
            if (func) func();
        };
    }
}