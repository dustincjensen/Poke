'use strict';
const { ipcRenderer } = require('electron');
const { TcpServer } = require('../backgroundTasks/tcpServer');
const { Conversations } = require('../backgroundTasks/conversations');
const { Contacts } = require('../backgroundTasks/contacts');

class BackgroundTaskWindow {
    constructor() {
        // Initialize background task external classes
        TcpServer.createServer();
        Conversations.setupConversations();
        Contacts.setupContacts();

        window.onload = () => {
            this._setupTaskListeners();
        };
    }

    _setupTaskListeners() {
        ipcRenderer.on('backgroundPasscodeEntered', this._passcodeEntered);
        ipcRenderer.on('backgroundNewMessageForAndroid', this._newMessageForAndroid);
        ipcRenderer.on('backgroundGetConversationList', this._getConversationList);
        ipcRenderer.on('backgroundGetConversation', this._getConversation);
        ipcRenderer.on('backgroundGetContactList', this._getContactList);
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

    // Retrieve the contact list
    _getContactList(event, args) {
        let contactList = Contacts.getContactList();
        ipcRenderer.send('background-contact-list-retrieved', contactList);
    }
}
new BackgroundTaskWindow();