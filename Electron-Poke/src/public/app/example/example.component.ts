import { Component, OnInit, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Component({
    moduleId: module.id,
    selector: 'example',
    templateUrl: 'example.html'
})
export class ExampleComponent implements OnInit {

    title: string;
    nodeVersion: string;
    chromeVersion: string;
    electronVersion: string;
    messages: string[];
    messageToAndroid: string;

    constructor(
        private _electron: ElectronService,
        private _ngZone: NgZone
    ) {
    }

    public async ngOnInit() {
        this.title = 'Hello Angular Example!';
        this.nodeVersion = process.versions.node;
        this.chromeVersion = process.versions.chrome;
        this.electronVersion = process.versions.electron;
        this.messages = [];

        this._electron.ipcRenderer.on('new-message', (event, args) => {
            this._ngZone.run(() => {
                console.log('New Message', args);
                let obj = JSON.parse(args);
                this.messages.push(`${obj.contact.name} :: ${obj.contact.phoneNumber} :: ${obj.message}`);
            });
        });
    }

    public async onSubmitClicked() {
        let obj = {
            contact: {
                phoneNumber: 'FILL_IN_TO_DEBUG'
            },
            message: this.messageToAndroid
        };
        this.messageToAndroid = '';
        this._electron.ipcRenderer.send('newMessageForAndroid', JSON.stringify(obj));
    }
}