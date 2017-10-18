import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
import { ConversationService } from './conversation.service';
import { NotificationService } from '../services/notificationService';
import { IConversation } from '../../../shared/interfaces';

@Component({
    moduleId: module.id,
    selector: 'conversation-list',
    templateUrl: 'conversation-list.html'
})
export class ConversationListComponent extends ElectronComponent implements OnInit, OnDestroy {

    conversations: IConversation[];
    selectedConversation: IConversation;
    menuOpen: boolean;
    private _newConversationSubscription: any;

    constructor(
        private _router: Router,
        private _internal: ConversationService,
        private _notifications: NotificationService,
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
        // Subscribe to the new conversation event.
        // This will be triggered when the contact selector chooses a contact.
        this._newConversationSubscription =
            this._internal.newConversation.subscribe((id) => { this._handleNewConversation(id); });

        // Register methods to handle events from the backend of Electron.
        this.registerIpcRendererMethod('conversationListRetrieved', this._handleConversationsLoaded);
        this.registerIpcRendererMethod('newConversationReceived', this._handleNewConversationReceived);
        this.registerIpcRendererMethod('newMessageReceived', this._handleNewMessageReceived);
        this.registerIpcRendererMethod('newConversationStarted', this._handleNewConversationStarted);
        this.registerIpcRendererMethod('conversationRead', this._handleConversationRead);
        this._electron.ipcRenderer.send('getConversationList');
    }

    public async ngOnDestroy() {
        this._newConversationSubscription.unsubscribe();
    }

    private _handleNewConversation(id: number): void {
        // We navigate because the first event to happen will be a call to getConversation.
        // If the conversation/contact id doesn't exist we can deal with that... but I don't
        // think that could ever happen. You literally selected a contact that was retrieved
        // from the back end in the first place.
        this._router.navigate(['conversations', { outlets: { conversationListOutlet: ['conversation', id] } }]);
    }

    private _handleConversationsLoaded(event, conversations) {
        this.conversations = conversations;
    }

    private _handleNewConversationReceived(event, conversation) {
        this.conversations.unshift(conversation);

        this._sendNotificationIfNotFocused(
            conversation.name, conversation.messages[0].message, conversation);
    }

    private _handleNewMessageReceived(event, newMessage) {
        let index = this.conversations.findIndex(value => {
            return value.id === newMessage.conversationId;
        });

        if (index >= 0) {
            let conversation = this.conversations[index];
            conversation.newMessages = true;

            this._sendNotificationIfNotFocused(
                conversation.name, newMessage.message.message, conversation);

            // TODO consider not making the messages unread if you are in the conversation.
        }
    }

    private _sendNotificationIfNotFocused(name: string, message: string, conversation: IConversation): void {
        if (!document.hasFocus()) {
            // Send a notification that we received a new message.
            // We give them a function to call which will select
            // the conversation if they click on the notification.
            // TODO the boolean should be based on the privacy flag.
            this._notifications.sendNewMessageReceivedNotification(
                name, message, false, () => {
                    this.selectConversation(conversation);
                });
        }
    }

    /**
     * This is fired when the backend realizes we asked for a conversation
     * but knows that we didn't have it our list already. I separated this
     * out from the same event as _handleNewConversationReceived because
     * there may be differences in the future.
     */
    private _handleNewConversationStarted(event, conversation) {
        this.conversations.unshift(conversation);

        // Set the selected conversation because we are likely on it...
        this.selectedConversation = conversation;
    }

    /**
     * This will be fired when the backend receives the getConversation
     * call from the conversation component. When we find an existing
     * conversation we mark it as read.
     */
    private _handleConversationRead(event, id) {
        // TODO this only occurs because "getConversation" on the "server" fires on load, and it may beat the list of conversations being retrieved.
        if (!this.conversations) return;

        let index = this.conversations.findIndex(value => {
            return value.id === id;
        });

        if (index >= 0) {
            let conversation = this.conversations[index];
            conversation.newMessages = false;

            // When we have "read" a conversation we most likely
            // clicked it and indeed that is what happens on the server.
            // So if we haven't selected the conversation, let's do so.
            // TODO this is a bit obtuse... this could be refactored and simplified.
            if (this.selectedConversation !== conversation) {
                this.selectedConversation = conversation;
            }
        }
    }

    public selectConversation(conversation: IConversation): void {
        this.selectedConversation = conversation;
        this._router.navigate(['conversations', { outlets: { conversationListOutlet: ['conversation', conversation.id] } }]);
    }

    public loadContacts(): void {
        this.selectedConversation = null;
        this._router.navigate(['conversations', { outlets: { conversationListOutlet: ['contacts'] } }]);
    }

    public openMenu(): void {
        this.menuOpen = !this.menuOpen;
    }
}