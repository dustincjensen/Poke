import * as net from 'net';
import * as os from 'os';
import { MainElectron } from './main';

export class TcpServer {

    private static _openSocket: net.Socket;
    private static _server: net.Server;
    private static _address: string;
    private static _port: number;

    public static createServer(): void {
        this._setupServer();
        this._determineServerConnectionDetails();
        this._server.listen(this._port, this._address);
    }

    public static hasOpenSocket(): boolean {
        return this._openSocket != null;
    }

    public static writeOnOpenSocket(msg: string): void {
        this._openSocket.write(msg);
    }

    private static _setupServer(): void {
        this._server = net.createServer(socket => {
            console.log('Client Connected');

            // Receive the data on the socket
            socket.on('data', this._receiveDataOnSocket);

            // Keep a reference to the socket.
            if (this._openSocket) {
                console.log('Closing Old Socket');
                this._openSocket.end();
            }
            this._openSocket = socket;
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
                    this._address = element.address;
                    this._port = 8971;
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

        if (body.indexOf('<EOF>')) {
            MainElectron.sendMessageToMainContents(
                'new-message', body.replace('<EOF>', ''));
            body = '';
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