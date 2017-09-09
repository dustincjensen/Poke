import { MainElectron } from './main';
import { TcpServer } from './tcpServer';
import { IContact } from '../shared/interfaces';
//import { ColorUtil } from './colorUtil';

export class Contacts {

    public static contacts: IContact[] = [];

    public static setupContacts() {
        Contacts.contacts = [
            { id: 10000, name: 'Dave Grohl', display: 'DG' },
            { id: 10001, name: 'Taylor Hawkins', display: 'TH' },
            { id: 10002, name: 'Chris Shiflett', display: 'CS' },
            { id: 10003, name: 'Nate Mendel', display: 'NM' },
            { id: 10004, name: 'Pat Smear', display: 'PS' },
            { id: 10005, name: 'Rami Jaffee', display: 'RJ' },
            { id: 10006, name: 'William Goldsmith', display: 'WG' },
            { id: 10007, name: 'Franz Stahl', display: 'FS' }
        ];
    }

    public static getContactList(): IContact[] {
        return Contacts.contacts;
    }
}