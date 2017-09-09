import { Component, OnInit, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
import { IContact } from '../../../shared/interfaces';

@Component({
    moduleId: module.id,
    selector: 'contact-selector',
    templateUrl: 'contact-selector.html'
})
export class ContactSelectorComponent extends ElectronComponent implements OnInit {

    contacts: IContact[];

    constructor(
        private _router: Router,
        electron: ElectronService,
        ngZone: NgZone
    ) {
        super(electron, ngZone);
    }

    /**
     * We will set up the mechanism for the contacts to be retrieved.
     * But instead of hooking up something that reloads the contact
     * list everytime we open the component, we will put in a refresh later.
     * TODO create a refresh contact list button.
     */
    public async ngOnInit() {
        this.registerIpcRendererMethod('contactListRetrieved', this._handleContactsLoaded);
        this._electron.ipcRenderer.send('getContactList');
    }

    private _handleContactsLoaded(event, args): void {
        this.contacts = args.sort(this._sortByName);
    }

    private _sortByName(x: any, y: any): number {
        if (x.name > y.name) return 1;
        if (x.name < y.name) return -1;
        return 0;
    }

    /**
     * This allows us to close contacts, but not move back to a conversation.
     */
    public cancelContactSelection(): void {
        this._router.navigateByUrl('/conversations');
    }
}