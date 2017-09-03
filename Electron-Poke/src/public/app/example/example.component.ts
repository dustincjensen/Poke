import { Component, OnInit, AfterViewChecked, NgZone, ElementRef, ViewChild } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';

@Component({
    moduleId: module.id,
    selector: 'example',
    templateUrl: 'example.html'
})
export class ExampleComponent extends ElectronComponent implements OnInit, AfterViewChecked {

    @ViewChild('scrollConversation')
    private _scrollContainer: ElementRef;

    displayName: string;
    messageToAndroid: string;
    messages: any[];
    private _oldMessageCount: number;

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
        // this.messages.push(
        //     {
        //         contact: {
        //             id: 784,
        //             phoneNumber: '+19695553215',
        //             name: 'Dave Grohl',
        //             isSelf: false
        //         },
        //         message: 'Hey, how are you doing today friend?',
        //         time: Date.now() - (36 * 60 * 1000)
        //     },
        //     {
        //         contact: {
        //             id: 784,
        //             phoneNumber: '+19695553215',
        //             name: 'Dave Grohl',
        //             isSelf: false
        //         },
        //         message: 'I was wondering what you are up to today?',
        //         time: Date.now() - (35 * 60 * 1000)
        //     },
        //     {
        //         contact: {
        //             id: 0,
        //             phoneNumber: null,
        //             name: 'Me',
        //             isSelf: true
        //         },
        //         message: 'Hey Dave. I\'m doing pretty well, thanks for asking',
        //         time: Date.now() - (30 * 60 * 1000)
        //     },
        //     {
        //         contact: {
        //             id: 0,
        //             phoneNumber: null,
        //             name: 'Me',
        //             isSelf: true
        //         },
        //         message: 'I\'m not up to much, did you have something in mind? I would totally be up for some food or something.',
        //         time: Date.now() - (30 * 60 * 1000)
        //     },
        //     {
        //         contact: {
        //             id: 784,
        //             phoneNumber: '+19695553215',
        //             name: 'Dave Grohl',
        //             isSelf: false
        //         },
        //         message: 'How about we get together and jam?',
        //         time: Date.now() - (29 * 60 * 1000)
        //     }
        // );
        // TMP

        this.registerIpcRendererMethod('new-message', this._handleNewMessage);
    }

    /**
     * Called after any ng-model is changed.
     * This will compare the messages to the old message count
     * and if they do not equal, means we have a new message in
     * our queue and we should scroll to the bottom of the view.
     */
    public ngAfterViewChecked() {
        if (this._oldMessageCount !== this.messages.length) {
            this._oldMessageCount = this.messages.length;
            this._scrollToBottom();
        }
    }

    /**
     * Scroll to the bottom of the view.
     */
    private _scrollToBottom(): void {
        try {
            this._scrollContainer.nativeElement.scrollTop =
                this._scrollContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    private _handleNewMessage(event, args) {
        console.log('New Message', args);
        let obj = JSON.parse(args);
        this.messages.push(obj);
    }


    public async onMessageEntered() {
        // The message needs to be valid and not empty.
        let message = this.messageToAndroid;
        if (message === null || message === undefined) {
            return;
        }
        message = message.trim();
        if (message === '') {
            return;
        }

        // This is the object to save to our conversation.
        let saveHere = {
            contact: {
                id: 0,
                phoneNumber: null,
                name: 'Me',
                isSelf: true
            },
            message: message,
            time: Date.now()
        };
        this.messages.push(saveHere);
        this.messageToAndroid = '';

        // TODO uncomment when we want to send back to android
        let sendMessage = {
            contact: {
                phoneNumber: 'FILL_IN_TO_DEBUG'
            },
            message: message
        };
        this._electron.ipcRenderer.send('newMessageForAndroid', JSON.stringify(sendMessage));
    }
}