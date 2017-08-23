import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';

import * as net from 'net';
import * as os from 'os';

// Keep a global reference to the window object, if you don't, the window will
// be closed automatically when the Javascript object is garbage collected.
let win: Electron.BrowserWindow;

let createWindow = () => {
    // Create the browser window
    win = new BrowserWindow({
        darkTheme: true,
        width: 800,
        height: 600
    });

    // and load the index.html of the app.
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Open the DevTools.
    win.webContents.openDevTools();

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object.
        win = null;
    });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
        createWindow();
    }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Attempt to create tcp server.
let server = net.createServer((socket) => {
    console.log('Client Connected');
    let body = '';
    socket.on('data', (data) => {
        body += data;
    });
    socket.on('end', () => {
        console.log(body);
        win.webContents.send('new-message', body);
    });
});

let networkInterfaces = os.networkInterfaces();
let address: string = null;
let addressFound: boolean = false;
for (let iface in networkInterfaces) {
    let x = networkInterfaces[iface];
    for (let i = 0; i < x.length; i++) {
        let element = x[i];
        if (element.address.startsWith('192')) {
            address = element.address;
            addressFound = true;
            break;
        }
    }
    if (addressFound) break;
}

console.log('Listening on Address', address);
server.listen(8971, address);