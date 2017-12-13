import * as net from 'net';
import { Util } from './util';
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
    private static _incomingData: string;

    // TMP
    // Need to find a better way to handle this.
    private static _otherPublic: any;
    private static _ourPublic: any;
    private static _ourPrivate: any;
    private static _encryptedStartMessage: string;
    private static _sharedSymmetricKey: any;

    public static createServer(): void {
        TcpServer._setupServer();

        let hostInfo = Util.getHostingIpAddress();
        TcpServer._port = hostInfo.port;
        TcpServer._address = hostInfo.ipAddress;

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

            // Reject clients because we already have one.
            if (TcpServer._openSocket) {
                socket.end();
                console.log('Client rejected, socket already exists.');
                return;
            }

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
            TcpServer._incomingData = '';
            TcpServer._openSocket = socket;
        });
    }

    // TODO consider using indexOf _incomingData
    // otherwise what would happen if you receive another "event"
    // while doing this one? You might get the scenario of...
    // 231231231<TAC>12308123012<EOF> then it would fail.
    private static _receiveDataOnSocket(data: Buffer): void {
        TcpServer._incomingData += data;

        // This is a message that is encrypted
        // This will fail if we don't have a symmetric key.
        if (TcpServer._incomingData.endsWith('<EOF>')) {
            let decrypted = Symmetric.decryptIV(TcpServer._incomingData.replace('<EOF>', ''),
                TcpServer._sharedSymmetricKey.key, TcpServer._sharedSymmetricKey.iv);
            let obj = JSON.parse(decrypted);
            Conversations.handleIncomingMessage(obj);
            TcpServer._incomingData = '';
        }

        // This is the start of the passcode / public / private key exchange
        else if (TcpServer._incomingData.endsWith('<BEG>')) {
            let encrypted = TcpServer._incomingData.replace('<BEG>', '');
            TcpServer._encryptedStartMessage = encrypted;
            TcpServer._incomingData = '';
        }

        // TMP
        // Handle the contact list
        else if (TcpServer._incomingData.endsWith('<TAC>')) {
            let decrypted = Symmetric.decryptIV(TcpServer._incomingData.replace('<TAC>', ''),
                TcpServer._sharedSymmetricKey.key, TcpServer._sharedSymmetricKey.iv);
            let obj = JSON.parse(decrypted);
            Contacts.handleIncomingContactList(obj);
            TcpServer._incomingData = '';
        }

        // This is the end of the passcode / public / private key exchange.
        // We are receiving the shared symmetric key we will be encrypting with.
        else if (TcpServer._incomingData.endsWith('<END>')) {
            let encrypted = TcpServer._incomingData.replace('<END>', '');
            TcpServer._sharedSymmetricKey = JSON.parse(
                PublicPrivate.decryptWithPrivateKey(TcpServer._ourPrivate, encrypted));
            TcpServer._incomingData = '';
        }

        else {
            console.log('No <> message.', data.length);
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