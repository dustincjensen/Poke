import { IContact } from '../shared/interfaces';
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

    public static getContactList(): IContact[] {
        return Contacts.contacts;
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