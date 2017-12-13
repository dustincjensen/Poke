import * as dgram from 'dgram';
import * as os from 'os';
import { Util } from './util';
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

            let host = Util.getHostingIpAddress();
            let payload = {
                name: os.hostname(),
                port: host.port,
                ipAddress: host.ipAddress
            };
            let json = JSON.stringify(payload);

            // TODO review this... had to change from BROADCAST_ADDRESS to rinfo.address to work on my new network. 
            this._socket.send(new Buffer(json), 0, json.length,
                UdpServer.BROADCAST_PORT, rinfo.address,
                (error) => {
                    if (error) console.log(error);
                });
        });

        this._socket.bind(UdpServer.LISTEN_PORT, UdpServer.LISTEN_ADDRESS);
    }
}