import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';

@Component({
    moduleId: module.id,
    selector: 'conversation-list',
    templateUrl: 'conversation-list.html'
})
export class ConversationListComponent extends ElectronComponent implements OnInit {

    conversations: any[];

    constructor(
        private _router: Router,
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
        this.registerIpcRendererMethod('conversationListRetrieved', this._handleConversationsLoaded)
        this._electron.ipcRenderer.send('getConversationList');
    }

    private _handleConversationsLoaded(event, args) {
        this.conversations = args;
    }

    public selectConversation(conversation: any): void {
        console.log(conversation);
        this._router.navigate(['/conversationList', { outlets: { 'conversationListOutlet': [conversation.id] } }]);
    }
}