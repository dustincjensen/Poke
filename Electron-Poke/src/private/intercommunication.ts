import { ipcMain } from 'electron';
import { TcpServer } from './tcpServer';

export class Intercommunication {
    public static setupListeners(): void {
        // This is the message from the dom back to the electron
        // main process and we can use this to push to the socket.
        ipcMain.on('newMessageForAndroid', (event, arg) => {
            if (TcpServer.hasOpenSocket()) {
                TcpServer.writeOnOpenSocket(arg);
            }
        });
    }
}