import { ipcRenderer } from 'electron';
import { TcpServer } from './tcpServer';
import { IConversation, IMessage, IContact } from '../shared/interfaces';
import { Contacts } from './contacts';
import { ColorUtil } from './colorUtil';
import { Util } from './util';

export class Conversations {

    public static conversations: IConversation[] = [];

    public static setupConversations() {
        Conversations.conversations = [
            {
                id: 10000,
                phoneNumber: 'FAKE_NUMBER',
                name: 'Dave Grohl',
                display: 'DG',
                color: ColorUtil.getRandomColor(),
                newMessages: false,
                messages: [
                    {
                        isSelf: false,
                        message: 'Hey, how are you doing today friend?',
                        time: Date.now() - (36 * 60 * 1000)
                    },
                    {
                        isSelf: false,
                        message: 'I was wondering what you are up to today?',
                        time: Date.now() - (35 * 60 * 1000)
                    },
                    {
                        isSelf: true,
                        message: 'Hey Dave. I\'m doing pretty well, thanks for asking',
                        time: Date.now() - (30 * 60 * 1000)
                    },
                    {
                        isSelf: true,
                        message: 'I\'m not up to much, did you have something in mind? I would totally be up for some food or something.',
                        time: Date.now() - (30 * 60 * 1000)
                    },
                    {
                        isSelf: false,
                        message: 'How about we get together and jam?',
                        time: Date.now() - (29 * 60 * 1000)
                    },
                    {
                        isSelf: false,
                        message: 'I have all the equipment here still from last time we got together and played.',
                        time: Date.now() - (29 * 60 * 1000)
                    },
                    {
                        isSelf: false,
                        message: 'Why don\'t you grab some food on your way over? Does pizza sound good?',
                        time: Date.now() - (29 * 60 * 1000)
                    }
                ] as IMessage[]
            },
            {
                id: 10001,
                phoneNumber: 'FAKE_NUMBER',
                name: 'Taylor Hawkins',
                display: 'TH',
                color: ColorUtil.getRandomColor(),
                newMessages: false,
                messages: [] as IMessage[]
            },
            {
                id: 10002,
                phoneNumber: 'FAKE_NUMBER',
                name: 'Chris Shiflett',
                display: 'CS',
                color: ColorUtil.getRandomColor(),
                newMessages: true,
                messages: [{
                    isSelf: false,
                    message: 'Hey man I really need my guitar back! Get it to me ASAP.',
                    time: Date.now() - (92 * 60 * 1000)
                }] as IMessage[]
            }
        ];
    }

    public static handleOutgoingMessage(obj: any): any {
        let index = Conversations.conversations.findIndex(value => {
            return value.id === obj.contact.id;
        });

        // Error... ?
        // TODO what to do?
        if (index < 0) {
            console.log('No conversation to add to...');
            return;
        }

        // Add to the conversation and send it to the open socket.
        let conversation = Conversations.conversations[index];
        conversation.messages.push(obj.message);

        // The conversation you are pushing to shouldn't have any
        // new messages at this point. We also need to let the front
        // end know that we don't have new messages on the object
        // any longer.
        conversation.newMessages = false;
        ipcRenderer.send('background-conversation-read', conversation.id);


        // Update the message headed out with a phone number
        TcpServer.writeEncryptedOnOpenSocket(JSON.stringify({
            contact: {
                id: obj.contact.id,
                phoneNumber: conversation.phoneNumber
            },
            message: obj.message.message
        }));
    }

    public static handleIncomingMessage(obj: any): any {
        let index = Conversations.conversations.findIndex(value => {
            return value.id === obj.contact.id;
        });

        // We didn't find it... but we should also check the list again
        // because it might be a non-contact.
        if (index === -1) {
            index = Conversations.conversations.findIndex(value => {
                return value.phoneNumber === obj.contact.phoneNumber;
            });
        }

        // If there is a conversation go ahead and add to the existing
        // conversation.
        if (index >= 0) {
            let newMessage = {
                isSelf: false,
                message: obj.message,
                time: Date.now()
            };
            Conversations.conversations[index].messages.push(newMessage);
            Conversations.conversations[index].newMessages = true;

            // Since we might be on the conversation send a new message
            let contactMessage = {
                conversationId: Conversations.conversations[index].id,
                message: newMessage
            };
            ipcRenderer.send('background-new-message-received', contactMessage);
        } else {
            let conversation: IConversation = {
                id: obj.contact.id != -1 ? obj.contact.id : Util.generateRandomId(),
                phoneNumber: obj.contact.phoneNumber,
                name: obj.contact.id != -1 ? obj.contact.name : obj.contact.phoneNumber,
                display: obj.contact.id != -1
                    ? Conversations._determineDisplayName(obj.contact.name)
                    : '??',
                color: ColorUtil.getRandomColor(),
                newMessages: true,
                messages: [
                    {
                        isSelf: false,
                        message: obj.message,
                        time: Date.now()
                    }
                ] as IMessage[]
            };
            Conversations.conversations.unshift(conversation);

            // Since we have a new conversation...
            ipcRenderer.send('background-new-conversation-received', conversation);
        }
    }

    private static _determineDisplayName(name: string): string {
        let split = name.split(' ');
        if (split.length === 2) {
            return split[0][0].toUpperCase() + split[1][0].toUpperCase();
        }
        else {
            return name[0].toUpperCase();
        }
    }

    public static getConversationList(): any[] {
        return Conversations.conversations.map(value => {
            return {
                id: value.id,
                name: value.name,
                display: value.display,
                color: value.color,
                newMessages: value.newMessages
            };
        });
    }

    public static getConversation(id: number): any {
        let index = Conversations.conversations.findIndex(value => {
            // Sometimes the id is a string so... triple equals would fail.
            return value.id == id;
        });

        // Is more than 1 a possibility?
        if (index >= 0) {
            let conversation = Conversations.conversations[index];
            conversation.newMessages = false;

            // Let the listing know we selected this so it can toggle off
            // the dirty marker.
            ipcRenderer.send('background-conversation-read', conversation.id);
            return conversation;
        }

        // Didn't find a conversation, check the contacts...
        let contact = Contacts.getContact(id);

        let conversation: IConversation = {
            id: contact.id,
            phoneNumber: contact.phoneNumber,
            name: contact.name,
            display: Conversations._determineDisplayName(contact.name),
            color: ColorUtil.getRandomColor(),
            newMessages: false,
            messages: [] as IMessage[]
        };

        // Add it so the server knows...
        Conversations.conversations.unshift(conversation);

        // Since the component asking for this likely doesn't know that this is 
        // "technically" a new conversation we need to let the conversation list
        // know.
        ipcRenderer.send('background-new-conversation-started', conversation);

        // Return the conversation that we just created.
        return conversation;
    }

    public static removeConversation(id: number): any {
        let index = Conversations.conversations.findIndex(value => {
            // Sometimes the id is a string so... triple equals would fail.
            return value.id == id;
        });

        // Is more than 1 a possibility?
        if (index >= 0) {
            Conversations.conversations.splice(index, 1);
        }
    }
}