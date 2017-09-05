import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
//import { IConversation } from '../../../shared/interfaces';

@Component({
    moduleId: module.id,
    selector: 'contact-selector',
    templateUrl: 'contact-selector.html'
})
export class ContactSelectorComponent extends ElectronComponent implements OnInit {

    contacts: any[];

    constructor(
        private _router: Router,
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    public async ngOnInit() {
        // this.registerIpcRendererMethod('conversationListRetrieved', this._handleConversationsLoaded);
        // this._electron.ipcRenderer.send('getConversationList');
    }
}