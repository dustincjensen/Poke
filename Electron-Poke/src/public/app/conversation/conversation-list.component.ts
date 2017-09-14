import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
import { ConversationService } from './conversation.service';
import { IConversation } from '../../../shared/interfaces';

@Component({
    moduleId: module.id,
    selector: 'conversation-list',
    templateUrl: 'conversation-list.html'
})
export class ConversationListComponent extends ElectronComponent implements OnInit, OnDestroy {

    conversations: IConversation[];
    selectedConversation: IConversation;
    private _newConversationSubscription: any;

    constructor(
        private _router: Router,
        private _internal: ConversationService,
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
        this.registerIpcRendererMethod('newConversationStarted', this._handleNewConversationStarted);
        this._electron.ipcRenderer.send('getConversationList');
    }

    public async ngOnDestroy() {
        this._newConversationSubscription.dispose();
    }

    private _handleNewConversation(id: number): void {
        // We navigate because the first event to happen will be a call to getConversation.
        // If the conversation/contact id doesn't exist we can deal with that... but I don't
        // think that could ever happen. You literally selected a contact that was retrieved
        // from the back end in the first place.
        this._router.navigate(['conversations', { outlets: { conversationListOutlet: ['conversation', id] } }]);
    }

    private _handleConversationsLoaded(event, args) {
        this.conversations = args;
    }

    private _handleNewConversationReceived(event, args) {
        this.conversations.unshift(args);
    }

    /**
     * This is fired when the backend realizes we asked for a conversation
     * but knows that we didn't have it our list already. I separated this
     * out from the same event as _handleNewConversationReceived because
     * there may be differences in the future.
     */
    private _handleNewConversationStarted(event, args) {
        this.conversations.unshift(args);

        // Set the selected conversation because we are likely on it...
        this.selectedConversation = args;
    }

    public selectConversation(conversation: IConversation): void {
        this.selectedConversation = conversation;
        this._router.navigate(['conversations', { outlets: { conversationListOutlet: ['conversation', conversation.id] } }]);
    }

    public loadContacts(): void {
        this.selectedConversation = null;
        this._router.navigate(['conversations', { outlets: { conversationListOutlet: ['contacts'] } }]);
    }
}