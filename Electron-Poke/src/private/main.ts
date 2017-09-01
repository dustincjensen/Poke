import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';

import { TcpServer } from './tcpServer';
import { Intercommunication } from './intercommunication';

export class MainElectron {

    // Keep a reference to the window object, if you don't, the 
    // window will be closed automatically when the Javascript
    // object is garbage collected.
    private static _win: Electron.BrowserWindow;

    public static start() {
        MainElectron._initializeElectron();
        TcpServer.createServer();
        Intercommunication.setupListeners();
    }

    private static _initializeElectron(): void {
        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        app.on('ready', MainElectron._createWindow);

        // This handles window activation, like in macOS.
        app.on('activate', MainElectron._windowActivate);

        // Quit when all windows are closed
        app.on('window-all-closed', MainElectron._allWindowsClosed);
    }

    private static _windowActivate(): void {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (MainElectron._win === null) {
            MainElectron._createWindow();
        }
    }

    private static _allWindowsClosed(): void {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    }

    private static _createWindow(): void {
        // Create the browser window
        MainElectron._win = new BrowserWindow({
            darkTheme: true,
            width: 1600,
            height: 900
        });

        // and load the index.html of the app.
        MainElectron._win.loadURL(url.format({
            pathname: path.join(__dirname, '../public/index.html'),
            protocol: 'file:',
            slashes: true
        }));

        // Open the DevTools.
        MainElectron._win.webContents.openDevTools();

        // Emitted when the window is closed.
        MainElectron._win.on('closed', () => {
            // Dereference the window object.
            MainElectron._win = null;
        });
    }

    public static sendMessageToMainContents(type: string, msg: string): void {
        MainElectron._win.webContents.send(type, msg);
    }
}

MainElectron.start();