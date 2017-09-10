import * as net from 'net';
import * as os from 'os';
import { MainElectron } from './main';
import { PublicPrivate } from './publicPrivate';
import { Symmetric } from './symmetric';
import { Conversations } from './conversations';

export class TcpServer {

    private static _openSocket: net.Socket;
    private static _server: net.Server;
    private static _address: string;
    private static _port: number;

    // TMP
    private static _otherPublic: any;
    private static _ourPublic: any;
    private static _ourPrivate: any;

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

    private static _setupServer(): void {
        TcpServer._server = net.createServer(socket => {
            // A new connection was received...
            // Let the UI know about it.
            console.log('Client Connected');
            MainElectron.sendMessageToMainContents(
                'tcp-connected', true);

            // Receive the data on the socket
            socket.on('data', TcpServer._receiveDataOnSocket);

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

        if (body.endsWith('<EOF>')) {
            let obj = JSON.parse(body.replace('<EOF>', ''));
            Conversations.handleIncomingMessage(obj);
            body = '';
        }

        if (body.endsWith('<BEG>')) {
            let encrypted = body.replace('<BEG>', '');
            let decrypted = Symmetric.decrypt(encrypted, 'GAMMA');
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

            let writeBack = Symmetric.encrypt(JSON.stringify(publicKeyObj), 'GAMMA');
            TcpServer.writeOnOpenSocket(writeBack + '<BEG>');
        }

        if (body.endsWith('<END>')) {
            let encrypted = body.replace('<END>', '');
            let decrypted = PublicPrivate.decryptWithPrivateKey(TcpServer._ourPrivate, encrypted);
            console.log(decrypted);
        }
    }
}

/*

// TODO maybe use this to keep the socket alive?
// setInterval(() => {
//     if (keepSocket) {
//         keepSocket.write('Hello World');
//     }
// }, 5000);

*/