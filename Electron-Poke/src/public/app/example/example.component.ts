import { Component, OnInit, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';

@Component({
    moduleId: module.id,
    selector: 'example',
    templateUrl: 'example.html'
})
export class ExampleComponent extends ElectronComponent implements OnInit {

    title: string;
    nodeVersion: string;
    chromeVersion: string;
    electronVersion: string;
    messages: string[];
    messageToAndroid: string;

    constructor(
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
        this.title = 'Hello Angular Example!';
        this.nodeVersion = process.versions.node;
        this.chromeVersion = process.versions.chrome;
        this.electronVersion = process.versions.electron;
        this.messages = [];

        this.registerIpcRendererMethod('new-message', this._handleNewMessage);
    }

    private _handleNewMessage(event, args) {
        console.log('New Message', args);
        let obj = JSON.parse(args);
        this.messages.push(`${obj.contact.name} :: ${obj.contact.phoneNumber} :: ${obj.message}`);
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