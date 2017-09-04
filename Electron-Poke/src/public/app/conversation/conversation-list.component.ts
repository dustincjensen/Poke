import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
import { IConversation } from '../../../shared/interfaces';

@Component({
    moduleId: module.id,
    selector: 'conversation-list',
    templateUrl: 'conversation-list.html'
})
export class ConversationListComponent extends ElectronComponent implements OnInit {

    conversations: IConversation[];
    hasSelectedConversation: boolean;

    constructor(
        private _router: Router,
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
        this.registerIpcRendererMethod('conversationListRetrieved', this._handleConversationsLoaded);
        this.registerIpcRendererMethod('newConversationReceived', this._handleNewConversationReceived);
        this._electron.ipcRenderer.send('getConversationList');
    }

    private _handleConversationsLoaded(event, args) {
        this.conversations = args;
    }

    private _handleNewConversationReceived(event, args) {
        this.conversations.unshift(args);
    }

    public selectConversation(conversation: IConversation): void {
        this.hasSelectedConversation = true;
        this._router.navigate(['/conversationList', { outlets: { 'conversationListOutlet': [conversation.id] } }]);
    }

    public loadContacts(): void {

    }
}