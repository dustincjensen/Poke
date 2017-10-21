import * as dgram from 'dgram';
import * as os from 'os';
import { TcpServer } from './tcpServer';

export class UdpServer {

    private static LISTEN_ADDRESS: string = '0.0.0.0';
    private static LISTEN_PORT: number = 5555;
    private static BROADCAST_ADDRESS: string = '255.255.255.255';
    private static BROADCAST_PORT: number = 11000;

    private _socket;

    constructor() {
        this._socket = dgram.createSocket('udp4');

        this._socket.on('listening', () => {
            this._socket.setBroadcast(true);
        });

        this._socket.on('message', (data, rinfo) => {
            console.log('Data Received', data.toString());

            // Do not respond if it is already connected.
            if (TcpServer.hasOpenSocket()) {
                return;
            }

            let payload = {
                name: os.hostname(),
                port: 7102,
                ipAddress: UdpServer.getIpAddress()
            };
            let json = JSON.stringify(payload);

            this._socket.send(new Buffer(json), 0, json.length,
                UdpServer.BROADCAST_PORT, UdpServer.BROADCAST_ADDRESS,
                (error) => {
                    if (error) console.log(error);
                });
        });

        this._socket.bind(UdpServer.LISTEN_PORT, UdpServer.LISTEN_ADDRESS);
    }

    // TODO this is duplicated code.
    private static getIpAddress(): string {
        let networkInterfaces = os.networkInterfaces();
        let addressFound: boolean = false;
        for (let iface in networkInterfaces) {
            let x = networkInterfaces[iface];
            for (let i = 0; i < x.length; i++) {
                let element = x[i];
                if (element.address.startsWith('192')) {
                    return element.address;
                }
            }
        }
        return null;
    }
}