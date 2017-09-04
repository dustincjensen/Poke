import { ipcMain } from 'electron';
import { MainElectron } from './main';
import { TcpServer } from './tcpServer';
import { Conversations } from './conversations';

export class Intercommunication {
    public static setupListeners(): void {
        // This is the message from the dom back to the electron
        // main process and we can use this to push to the socket.
        ipcMain.on('newMessageForAndroid', (event, arg) => {
            if (TcpServer.hasOpenSocket()) {
                TcpServer.writeOnOpenSocket(arg);
            }
        });

        // Retrieve the list of conversation list.
        ipcMain.on('getConversationList', (event, args) => {
            let conversationList = Conversations.getConversationList();
            MainElectron.sendMessageToMainContents('conversationListRetrieved', conversationList);
        });

        // Retrieve the conversation with id.
        ipcMain.on('getConversation', (event, args) => {
            let conversation = Conversations.getConversation(args.id);
            MainElectron.sendMessageToMainContents('conversationRetrieved', {
                conversation: conversation,
                subscriptionCount: args.subscriptionCount
            });
        });
    }
}