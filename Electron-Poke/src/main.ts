import { app, BrowserWindow, ipcMain, Notification } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as ChildProcess from 'child_process';

import { Squirrel } from './ipcMain/squirrel';
import { Intercommunication } from './ipcMain/intercommunication';

export class MainElectron {

    // Keep a reference to the window object, if you don't, the 
    // window will be closed automatically when the Javascript
    // object is garbage collected.
    private static _win: Electron.BrowserWindow;
    public static background: Electron.BrowserWindow;

    public static start() {
        if (Squirrel.HandleSquirrelEvent(app)) {
            return;
        }

        MainElectron._initializeElectron();
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
        let windowOptions: Electron.BrowserWindowConstructorOptions = {
            title: 'Poke',
            width: 1600,
            minWidth: 300,
            height: 900,
            minHeight: 300,
            backgroundColor: '#333333',
            icon: path.join(__dirname, 'assets/Stick.png')
        };

        // if (MainElectron.__DARWIN__) {
        //     windowOptions.titleBarStyle = 'hidden';
        // } else if (MainElectron.__WIN32__) {
        //     windowOptions.frame = false;
        // }

        // Create the browser window
        MainElectron._win = new BrowserWindow(windowOptions);

        // and load the index.html of the app.
        MainElectron._win.loadURL(url.format({
            pathname: path.join(__dirname, './public/index.html'),
            protocol: 'file:',
            slashes: true
        }));

        // Open the DevTools.
        //MainElectron._win.webContents.openDevTools();

        // Stop the window from changing it's title
        // TODO remove when we have a custom title bar.
        MainElectron._win.on('page-title-updated', (event) => {
            event.preventDefault();
        });

        // Emitted when the window is closed.
        MainElectron._win.on('closed', () => {
            // Dereference the window object.
            MainElectron._win = null;

            // Dereference the background window too.
            MainElectron.background = null;

            // If you don't do this poke keeps running forever.
            app.quit();
        });

        MainElectron._win.on('focus', () => {
            // Whenever the window focuses it will remove the flash
            // frame that may have been put on the icon by the
            // notification paradigm.
            MainElectron._win.flashFrame(false);

            // In addition to turning off the orange flashing frame
            // we let the window know it now has focus.
            MainElectron.sendMessageToMainContents('isFocused', true);
        });

        MainElectron._win.on('blur', () => {
            // When the window blurs sends a message to the main contents
            // that the window no longer has focus.
            MainElectron.sendMessageToMainContents('isFocused', false);
        });

        // Create the background window to handle work for us.
        MainElectron.background = new BrowserWindow({ show: false });
        MainElectron.background.loadURL(url.format({
            pathname: path.join(__dirname, './background/index.html'),
            protocol: 'file:',
            slashes: true
        }));
        //MainElectron.background.webContents.openDevTools();
    }

    // public static __DARWIN__ = process.platform === 'darwin';
    // public static __WIN32__ = process.platform === 'win32';
    // public static __LINUX__ = process.platform === 'linux';
    // public static __FREEBSD__ = process.platform === 'freebsd';
    // public static __SUNOS__ = process.platform === 'sunos';

    public static sendMessageToMainContents(type: string, obj: any): void {
        MainElectron._win.webContents.send(type, obj);
    }
}

MainElectron.start();
