import { Component, OnDestroy, AfterViewChecked, NgZone, ElementRef, ViewChild, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
export class ConversationComponent extends ElectronComponent implements AfterViewChecked {

    @ViewChild('scrollConversation')
    private _scrollContainer: ElementRef;
    private _subscriptionCountAskedFor = 0;
    private _oldMessageCount: number;

    public conversation: IConversation;
    public messageToAndroid: string;
    public optionsClicked: boolean;

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);

        // TODO investigate whether this is the right choice...
        // This had to be put into the constructor because ngOnInit
        // was not firing on the first navigation event from notification clicks.
        this.registerIpcRendererMethod('conversationRetrieved', this._handleConversationRetrieved);
        this.registerIpcRendererMethod('newMessageReceived', this._handleNewMessage);

        // TODO review...
        // Instead of subscribing to parameter changes...
        // look for the url change and get the param out of it.
        // This lets us always reload the data instead of waiting
        // for the parameter to change. This fixes a few issues.
        this._route.url.subscribe(urls => {
            // We do not cast it to a number incase it is a random string
            // in the case of numbers we do not know.
            let param = urls[1].path;
            this._subscriptionCountAskedFor++;
            this._electron.ipcRenderer.send('getConversation', {
                id: param,
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

    // Make it non-async because I believe it is the cause of the issues
    // I was seeing where the "messageToAndroid" would not clear out of
    // the box when pressing enter.
    public onMessageEntered() {
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

    public removeConversation(): void {
        this._electron.ipcRenderer.send('removeConversation', this.conversation.id);
        this._router.navigateByUrl('/conversations');
    }

    /**
     * This listens to the document for clicks.
     * If something other than the more-options
     * button is clicked... then we hide the options flag.
     * TODO investigate how this clashes with other context menus.
     * @param event the click event.
     */
    @HostListener('document:click', ['$event'])
    public documentClick(event: Event): void {
        // If they click on an option, it will fire it's click first.
        // If they click on anything else, this will just close the menu.
        let target = (event.target as Element);
        if (!target.classList.contains('more-options')) {
            let parent = (target.parentElement as Element);
            if (!parent || !parent.classList.contains('more-options'))
                this.optionsClicked = false;
        }
    }
}