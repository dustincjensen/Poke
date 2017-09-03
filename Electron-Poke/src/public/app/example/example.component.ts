import { Component, OnInit, NgZone } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';

@Component({
    moduleId: module.id,
    selector: 'example',
    templateUrl: 'example.html'
})
export class ExampleComponent extends ElectronComponent implements OnInit {

    displayName: string;
    messages: any[];
    messageToAndroid: string;

    constructor(
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
        this.displayName = '';
        this.messages = [];

        // TMP
        this.displayName = 'Dave Grohl';
        this.messages.push(
            {
                contact: {
                    id: 784,
                    phoneNumber: '+19695553215',
                    name: 'Dave Grohl',
                    isSelf: false
                },
                message: 'Hey, how are you doing today friend?',
                time: Date.now() - (36 * 60 * 1000)
            },
            {
                contact: {
                    id: 784,
                    phoneNumber: '+19695553215',
                    name: 'Dave Grohl',
                    isSelf: false
                },
                message: 'I was wondering what you are up to today?',
                time: Date.now() - (35 * 60 * 1000)
            },
            {
                contact: {
                    id: 0,
                    phoneNumber: null,
                    name: 'Me',
                    isSelf: true
                },
                message: 'Hey Dave. I\'m doing pretty well, thanks for asking',
                time: Date.now() - (30 * 60 * 1000)
            },
            {
                contact: {
                    id: 0,
                    phoneNumber: null,
                    name: 'Me',
                    isSelf: true
                },
                message: 'I\'m not up to much, did you have something in mind? I would totally be up for some food or something.',
                time: Date.now() - (30 * 60 * 1000)
            },
            {
                contact: {
                    id: 784,
                    phoneNumber: '+19695553215',
                    name: 'Dave Grohl',
                    isSelf: false
                },
                message: 'How about we get together and jam?',
                time: Date.now() - (29 * 60 * 1000)
            }
        );
        // TMP

        this.registerIpcRendererMethod('new-message', this._handleNewMessage);
    }

    private _handleNewMessage(event, args) {
        console.log('New Message', args);
        let obj = JSON.parse(args);
        this.messages.push(obj);
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