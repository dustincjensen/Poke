import { ipcMain } from 'electron';
import { MainElectron } from '../main';

export class Intercommunication {
    public static setupListeners(): void {
        // Passcode Entered
        ipcMain.on('passcodeEntered', async (event, args) => {
            MainElectron.background.webContents.send('backgroundPasscodeEntered', args);
        });

        // This is the message from the dom back to the electron
        // main process and we can use this to push to the socket.
        ipcMain.on('newMessageForAndroid', (event, args) => {
            MainElectron.background.webContents.send('backgroundNewMessageForAndroid', args);
        });

        // Retrieve the list of conversation list.
        ipcMain.on('getConversationList', (event, args) => {
            MainElectron.background.webContents.send('backgroundGetConversationList', args);
        });

        // Retrieve the conversation with id.
        ipcMain.on('getConversation', (event, args) => {
            MainElectron.background.webContents.send('backgroundGetConversation', args);
        });

        // Retrieve the contact list
        ipcMain.on('getContactList', (event, args) => {
            MainElectron.background.webContents.send('backgroundGetContactList', args);
        });


        // ========================================================================================
        // background communicating to public renderer
        // ========================================================================================

        ipcMain.on('background-tcp-connected', (event, arg) => {
            MainElectron.sendMessageToMainContents('tcp-connected', arg);
        });

        ipcMain.on('background-conversation-read', (event, arg) => {
            MainElectron.sendMessageToMainContents('conversationRead', arg);
        });

        ipcMain.on('background-new-message-received', (event, arg) => {
            MainElectron.sendMessageToMainContents('newMessageReceived', arg);
        });

        ipcMain.on('background-new-conversation-received', (event, arg) => {
            MainElectron.sendMessageToMainContents('newConversationReceived', arg);
        });

        ipcMain.on('background-new-conversation-started', (event, arg) => {
            MainElectron.sendMessageToMainContents('newConversationStarted', arg);
        });

        ipcMain.on('background-passcode-success', (event, arg) => {
            MainElectron.sendMessageToMainContents('passcodeSuccess', null);
        });

        ipcMain.on('background-passcode-error', (event, arg) => {
            MainElectron.sendMessageToMainContents('passcodeError', null);
        })

        ipcMain.on('background-conversation-list-retrieved', (event, args) => {
            MainElectron.sendMessageToMainContents('conversationListRetrieved', args);
        });

        ipcMain.on('background-conversation-retrieved', (event, args) => {
            MainElectron.sendMessageToMainContents('conversationRetrieved', args);
        });

        ipcMain.on('background-contact-list-retrieved', (event, args) => {
            MainElectron.sendMessageToMainContents('contactListRetrieved', args);
        });
    }
}