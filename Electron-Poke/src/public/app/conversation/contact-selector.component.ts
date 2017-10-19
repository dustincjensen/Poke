import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ElectronService } from 'ngx-electron';
import { ElectronComponent } from '../base/electron.component';
import { ConversationService } from './conversation.service';
import { IContact } from '../../../shared/interfaces';

@Component({
    moduleId: module.id,
    selector: 'contact-selector',
    templateUrl: 'contact-selector.html'
})
export class ContactSelectorComponent extends ElectronComponent implements OnInit {

    private _contacts: IContact[];
    private _searchText: string;

    filteredContacts: IContact[];

    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _internal: ConversationService,
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
        // This lets us know when we have been navigated too...
        // whenever we are "fresh" we should clear out the search.
        this._route.url.subscribe(urls => {
            // We make it empty string so we can do .length on it.
            this.searchText = '';
        });

        this.registerIpcRendererMethod('contactListRetrieved', this._handleContactsLoaded);
        this._electron.ipcRenderer.send('getContactList');
    }

    private _handleContactsLoaded(event, args): void {
        this._contacts = args.sort(this._sortByName);
        this.filteredContacts = this._contacts;
    }

    private _sortByName(x: any, y: any): number {
        if (x.name > y.name) return 1;
        if (x.name < y.name) return -1;
        return 0;
    }

    public contactSelected(contact: IContact): void {
        this._internal.startNewConversation(contact.id);
    }

    /**
     * This allows us to close contacts, but not move back to a conversation.
     */
    public cancelContactSelection(): void {
        this._router.navigateByUrl('/conversations');
    }

    public get searchText(): string {
        return this._searchText;
    }
    public set searchText(text: string) {
        this._searchText = text;
        this._search();
    }

    private _search(): void {
        let searchTerms = this._searchText
            ? this._searchText.toLowerCase().split(' ')
            : null;

        if (searchTerms) {
            this.filteredContacts = this._contacts.filter(value => {
                let found = false;
                for (let i = 0; i < searchTerms.length; i++) {
                    if (searchTerms[i] === '') continue;
                    if (value.name.toLowerCase().indexOf(searchTerms[i]) >= 0) {
                        found = true;
                        break;
                    }
                };
                return found;
            });
        } else {
            this.filteredContacts = this._contacts;
        }
    }
}