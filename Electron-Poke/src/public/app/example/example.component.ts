import { Component, ChangeDetectorRef } from '@angular/core';
import { ipcRenderer } from 'electron';

@Component({
    moduleId: module.id,
    selector: 'example',
    templateUrl: 'example.html'
})
export class ExampleComponent {

    title: string;
    nodeVersion: string;
    chromeVersion: string;
    electronVersion: string;
    messages: string[];
    messageToAndroid: string;

    constructor(
        private ref: ChangeDetectorRef
    ) {
    }

    private async ngOnInit() {
        this.title = 'Hello Angular Example!';
        this.nodeVersion = process.versions.node;
        this.chromeVersion = process.versions.chrome;
        this.electronVersion = process.versions.electron;

        this.messages = [];

        // Because this method happens in something that isn't controlled by angular
        // we need to tell angular about the change.
        // TODO re-investigate ngx-electron so we don't have to do this.
        ipcRenderer.on('new-message', (event, args) => {
            console.log('New Message', args);
            let obj = JSON.parse(args);
            this.messages.push(`${obj.contact.name} :: ${obj.contact.phoneNumber} :: ${obj.message}`);
            this.ref.detectChanges();
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
        ipcRenderer.send('newMessageForAndroid', JSON.stringify(obj));
    }
}