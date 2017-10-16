import { IContact } from '../shared/interfaces';
import { TcpServer } from './tcpServer';
import { ipcRenderer } from 'electron';
//import { ColorUtil } from './colorUtil';

export class Contacts {

    public static contacts: IContact[] = [];

    // TODO display should be calculated
    public static setupContacts() {
        Contacts.contacts = [
            { id: 10000, name: 'Dave Grohl', display: 'DG', phoneNumber: 'FAKE_NUMBER' },
            { id: 10001, name: 'Taylor Hawkins', display: 'TH', phoneNumber: 'FAKE_NUMBER' },
            { id: 10002, name: 'Chris Shiflett', display: 'CS', phoneNumber: 'FAKE_NUMBER' },
            { id: 10003, name: 'Nate Mendel', display: 'NM', phoneNumber: 'FAKE_NUMBER' },
            { id: 10004, name: 'Pat Smear', display: 'PS', phoneNumber: 'FAKE_NUMBER' },
            { id: 10005, name: 'Rami Jaffee', display: 'RJ', phoneNumber: 'FAKE_NUMBER' },
            { id: 10006, name: 'William Goldsmith', display: 'WG', phoneNumber: 'FAKE_NUMBER' },
            { id: 10007, name: 'Franz Stahl', display: 'FS', phoneNumber: 'FAKE_NUMBER' }
        ];
    }

    // public static getContactList(): IContact[] {
    //     return Contacts.contacts;
    // }

    public static getContactList(): void {
        if (Contacts.contacts.length === 0) {
            TcpServer.writeOnOpenSocket('<TAC>');
        } else {
            ipcRenderer.send('background-contact-list-retrieved', Contacts.contacts);
        }
    }

    public static handleIncomingContactList(json: any) {
        console.log(json);

        for (let i = 0; i < json.length; i++) {
            let contact = json[i];
            Contacts.contacts.push({
                id: contact.id,
                name: contact.name,
                phoneNumber: contact.phoneNumber,
                display: Contacts._determineDisplayName(contact.name)
            })
        }

        Contacts.contacts.sort(Contacts._sortContacts);
        ipcRenderer.send('background-contact-list-retrieved', Contacts.contacts);
    }

    private static _sortContacts(contact: IContact, other: IContact): number {
        if (contact.name < other.name) return -1;
        if (contact.name > other.name) return 1;
        return 0;
    }

    // TODO this already exists in conversations...
    private static _determineDisplayName(name: string): string {
        let split = name.split(' ');
        if (split.length === 2) {
            return split[0][0].toUpperCase() + split[1][0].toUpperCase();
        }
        else {
            return name[0].toUpperCase();
        }
    }

    public static getContact(id: number): IContact {
        let possibleContacts = Contacts.contacts.filter(value => {
            return value.id == id;
        });

        if (possibleContacts && possibleContacts.length > 0) {
            return possibleContacts[0];
        }

        throw new Error(`No contact with ID ${id}`);
    }
}