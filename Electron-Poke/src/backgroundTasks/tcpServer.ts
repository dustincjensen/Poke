import * as net from 'net';
import * as os from 'os';
import { ipcRenderer } from 'electron';
import { PublicPrivate } from './publicPrivate';
import { Symmetric } from './symmetric';
import { Conversations } from './conversations';
import { Contacts } from './contacts';

export class TcpServer {

    private static _openSocket: net.Socket;
    private static _server: net.Server;
    private static _address: string;
    private static _port: number;

    // TMP
    // Need to find a better way to handle this.
    private static _otherPublic: any;
    private static _ourPublic: any;
    private static _ourPrivate: any;
    private static _encryptedStartMessage: string;
    private static _sharedSymmetricKey: any;

    public static createServer(): void {
        TcpServer._setupServer();
        TcpServer._determineServerConnectionDetails();
        TcpServer._server.listen(TcpServer._port, TcpServer._address);
    }

    public static hasOpenSocket(): boolean {
        return TcpServer._openSocket != null;
    }

    public static writeOnOpenSocket(msg: string): void {
        TcpServer._openSocket.write(msg);
    }

    public static writeEncryptedOnOpenSocket(msg: string): void {
        let encrypted = Symmetric.encryptIV(
            msg, TcpServer._sharedSymmetricKey.key,
            TcpServer._sharedSymmetricKey.iv);
        TcpServer._openSocket.write(encrypted + '<EOF>');
    }

    private static _setupServer(): void {
        TcpServer._server = net.createServer(socket => {
            // We can get who connected to us using remoteAddress
            // The remote address will be useful to see if we know about
            // the connection from previous times.            
            console.log('Client Connected', socket.remoteAddress, socket.remotePort);

            // A new connection was received...
            // Let the UI know about it.
            ipcRenderer.send('background-tcp-connected', true);

            // Socket will never timeout
            socket.setTimeout(0);

            // Keep the socket alive.
            socket.setKeepAlive(true, 0);

            // Receive the data on the socket
            socket.on('data', TcpServer._receiveDataOnSocket);

            // TODO contemplate
            // Socket error?
            socket.on('error', error => {
                console.log('Socket Error', error);
            });

            // TODO contemplate
            // Testing socket timeout...
            socket.on('timeout', () => {
                console.log('Socket has timed out...');
            });

            // Keep a reference to the socket.
            if (TcpServer._openSocket) {
                console.log('Closing Old Socket');
                TcpServer._openSocket.end();
            }
            TcpServer._openSocket = socket;
        });
    }

    private static _determineServerConnectionDetails(): void {
        let networkInterfaces = os.networkInterfaces();
        let addressFound: boolean = false;
        for (let iface in networkInterfaces) {
            let x = networkInterfaces[iface];
            for (let i = 0; i < x.length; i++) {
                let element = x[i];
                if (element.address.startsWith('192')) {
                    TcpServer._address = element.address;
                    TcpServer._port = 8971;
                    addressFound = true;
                    break;
                }
            }
            if (addressFound) break;
        }
    }

    private static _receiveDataOnSocket(data: Buffer): void {
        let body: string = '';
        body += data;

        // This is a message that is encrypted
        // This will fail if we don't have a symmetric key.
        if (body.endsWith('<EOF>')) {
            let decrypted = Symmetric.decryptIV(body.replace('<EOF>', ''),
                TcpServer._sharedSymmetricKey.key, TcpServer._sharedSymmetricKey.iv);
            let obj = JSON.parse(decrypted);
            Conversations.handleIncomingMessage(obj);
            body = '';
        }

        // This is the start of the passcode / public / private key exchange
        if (body.endsWith('<BEG>')) {
            let encrypted = body.replace('<BEG>', '');
            TcpServer._encryptedStartMessage = encrypted;
        }

        // TMP
        // Handle the contact list
        if (body.endsWith('<TAC>')) {
            let decrypted = Symmetric.decryptIV(body.replace('<TAC>', ''),
                TcpServer._sharedSymmetricKey.key, TcpServer._sharedSymmetricKey.iv);
            let obj = JSON.parse(decrypted);
            Contacts.handleIncomingContactList(obj);
            body = '';
        }

        // This is the end of the passcode / public / private key exchange.
        // We are receiving the shared symmetric key we will be encrypting with.
        if (body.endsWith('<END>')) {
            let encrypted = body.replace('<END>', '');
            TcpServer._sharedSymmetricKey = JSON.parse(
                PublicPrivate.decryptWithPrivateKey(TcpServer._ourPrivate, encrypted));
        }
    }

    public static handlePasscodeEntered(passcode: string) {
        try {
            let decrypted = Symmetric.decrypt(TcpServer._encryptedStartMessage, passcode);
            let obj = JSON.parse(decrypted);

            // Store their public key...
            TcpServer._otherPublic = obj;

            // Create our keys
            let keys = PublicPrivate.getKeys();
            TcpServer._ourPublic = keys[0];
            TcpServer._ourPrivate = keys[1];

            // Encrypt our public key back to them...
            let ourPublicKey = keys[0].valueOf() as any;
            let publicKeyObj = {
                n: ourPublicKey.n.toString('base64'),
                e: Buffer.from(PublicPrivate.getExponentForCSharp(ourPublicKey.e)).toString('base64')
            };

            let writeBack = Symmetric.encrypt(JSON.stringify(publicKeyObj), passcode);
            TcpServer.writeOnOpenSocket(writeBack + '<BEG>');

            ipcRenderer.send('background-passcode-success', null);
        } catch (error) {
            ipcRenderer.send('background-passcode-error', null);
        }
    }
}