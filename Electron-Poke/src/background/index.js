'use strict';
const { ipcRenderer } = require('electron');
const { TcpServer } = require('../private/tcpServer');

class BackgroundTaskWindow {
    constructor() {
        // Initialize background task external classes
        TcpServer.createServer();

        window.onload = () => {
            this._setupTaskListeners();
        };
    }

    _setupTaskListeners() {
        ipcRenderer.on('backgroundPasscodeEntered', this._passcodeEntered);
    }

    _passcodeEntered(event, passcode) {
        console.log('Handling Passcode entered...', passcode);
        TcpServer.handlePasscodeEntered(passcode);
    }
}
new BackgroundTaskWindow();
console.log('Ran new BackgroundTaskWindow()...');