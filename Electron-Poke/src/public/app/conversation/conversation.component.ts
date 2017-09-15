import { Component, OnInit, OnDestroy, AfterViewChecked, NgZone, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap';

import { IConversation, IMessage } from '../../../shared/interfaces';

@Component({
    moduleId: module.id,
    selector: 'conversation',
    templateUrl: 'conversation.html'
})
export class ConversationComponent extends ElectronComponent implements OnInit, AfterViewChecked {

    @ViewChild('scrollConversation')
    private _scrollContainer: ElementRef;
    private _subscriptionCountAskedFor = 0;
    private _oldMessageCount: number;

    conversation: IConversation;
    messageToAndroid: string;

    constructor(
        private _route: ActivatedRoute,
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
        this.registerIpcRendererMethod('conversationRetrieved', this._handleConversationRetrieved);
        this.registerIpcRendererMethod('newMessageReceived', this._handleNewMessage);

        this._route.params.subscribe(params => {
            this._subscriptionCountAskedFor++;
            this._electron.ipcRenderer.send('getConversation', {
                id: +params.id,
                subscriptionCount: this._subscriptionCountAskedFor
            });
        });
    }

    /**
     * If the subscription count of the record we asked for,
     * still matches the record we are waiting for, go ahead
     * and update the conversation.
     */
    private _handleConversationRetrieved(event, args) {
        if (args.subscriptionCount === this._subscriptionCountAskedFor) {
            this.conversation = args.conversation;
        }
    }

    /**
     * Called after any ng-model is changed.
     * This will compare the messages to the old message count
     * and if they do not equal, means we have a new message in
     * our queue and we should scroll to the bottom of the view.
     */
    public ngAfterViewChecked() {
        if (!this.conversation) return;

        if (this._oldMessageCount !== this.conversation.messages.length) {
            this._oldMessageCount = this.conversation.messages.length;
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
        if (this.conversation && args.conversationId === this.conversation.id) {
            this.conversation.messages.push(args.message);
        }
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
        let messageObj = {
            isSelf: true,
            message: message,
            time: Date.now()
        };
        this.conversation.messages.push(messageObj);
        this.messageToAndroid = '';

        let sendMessage = {
            contact: {
                id: this.conversation.id
            },
            message: messageObj
        };
        this._electron.ipcRenderer.send('newMessageForAndroid', sendMessage);
    }
}