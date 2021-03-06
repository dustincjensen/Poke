'use strict';
const { ipcRenderer } = require('electron');
const { TcpServer } = require('../backgroundTasks/tcpServer');
const { UdpServer } = require('../backgroundTasks/udpServer');
const { Conversations } = require('../backgroundTasks/conversations');
const { Contacts } = require('../backgroundTasks/contacts');
const { Settings } = require('../backgroundTasks/settings');

class BackgroundTaskWindow {

    constructor() {
        // Set up the settings...
        Settings.initializeSettings();

        // Initialize background task external classes
        TcpServer.createServer();

        // Start up the udp server to listen to udp requests.
        let udp = new UdpServer();

        // Since we can now add our own contacts this doesn't
        // need to be there for the next build
        //Conversations.setupConversations();
        //Contacts.setupContacts();

        window.onload = () => {
            this._setupTaskListeners();
        };
    }

    _setupTaskListeners() {
        ipcRenderer.on('backgroundPasscodeEntered', this._passcodeEntered);
        ipcRenderer.on('backgroundNewMessageForAndroid', this._newMessageForAndroid);
        ipcRenderer.on('backgroundGetConversationList', this._getConversationList);
        ipcRenderer.on('backgroundGetConversation', this._getConversation);
        ipcRenderer.on('backgroundRemoveConversation', this._removeConversation);
        ipcRenderer.on('backgroundGetContactList', this._getContactList);
        ipcRenderer.on('backgroundGetSettings', this._getSettings);
        ipcRenderer.on('backgroundUpdateSettings', this._setSettings);
    }

    _passcodeEntered(event, passcode) {
        console.log('Handling Passcode entered...', passcode);
        TcpServer.handlePasscodeEntered(passcode);
    }

    // This is the message from the dom back to the electron
    // main process and we can use this to push to the socket.
    _newMessageForAndroid(event, args) {
        if (TcpServer.hasOpenSocket()) {
            Conversations.handleOutgoingMessage(args);
        } else {
            console.log('TODO: Error Not Connected to TCP Socket.');
        }
    };

    // Retrieve the list of conversation list.
    _getConversationList(event, args) {
        let conversationList = Conversations.getConversationList();
        ipcRenderer.send('background-conversation-list-retrieved', conversationList);
    }

    // Retrieve the conversation with id.
    _getConversation(event, args) {
        let conversation = Conversations.getConversation(args.id);
        ipcRenderer.send('background-conversation-retrieved', {
            conversation: conversation,
            subscriptionCount: args.subscriptionCount
        });
    }

    _removeConversation(event, id) {
        Conversations.removeConversation(id);
        ipcRenderer.send('background-conversation-removed', id);
    }

    // Retrieve the contact list
    _getContactList(event, args) {
        //let contactList = Contacts.getContactList();
        //ipcRenderer.send('background-contact-list-retrieved', contactList);

        // TODO revisit this.
        // This now will send ipcRenderer calls on it's own
        // depending on whether or not it needs to wait on TCP contact list.
        Contacts.getContactList();
    }

    // Retrieve the settings...
    _getSettings(event, args) {
        ipcRenderer.send('background-settings-retrieved',
            Settings.getSettings());
    }

    // Update the settings
    _setSettings(event, args) {
        Settings.setSettings(args);
        ipcRenderer.send('background-settings-updated');
    }
}
new BackgroundTaskWindow();