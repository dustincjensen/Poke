import { MainElectron } from './main';
import { TcpServer } from './tcpServer';
import { IConversation, IMessage, IContact } from '../shared/interfaces';
import { Contacts } from './contacts';
import { ColorUtil } from './colorUtil';

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
                    }
                ] as IMessage[]
            },
            {
                id: 10001,
                phoneNumber: 'FAKE_NUMBER',
                name: 'Taylor Hawkins',
                display: 'TH',
                color: ColorUtil.getRandomColor(),
                messages: [] as IMessage[]
            },
            {
                id: 10002,
                phoneNumber: 'FAKE_NUMBER',
                name: 'Chris Shiflett',
                display: 'CS',
                color: ColorUtil.getRandomColor(),
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

        // Update the message headed out with a phone number
        TcpServer.writeOnOpenSocket(JSON.stringify({
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

        // If there is a conversation go ahead and add to the existing
        // conversation.
        if (index >= 0) {
            let newMessage = {
                isSelf: false,
                message: obj.message,
                time: Date.now()
            };
            Conversations.conversations[index].messages.push(newMessage);

            // Since we might be on the conversation send a new message
            let contactMessage = {
                conversationId: obj.contact.id,
                message: newMessage
            };
            MainElectron.sendMessageToMainContents('new-message', contactMessage);
        } else {
            let conversation: IConversation = {
                id: obj.contact.id,
                phoneNumber: obj.contact.phoneNumber,
                name: obj.contact.name,
                display: Conversations._determineDisplayName(obj.contact.name),
                color: ColorUtil.getRandomColor(),
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
            MainElectron.sendMessageToMainContents('newConversationReceived', conversation);
        }
    }

    private static _determineDisplayName(name: string): string {
        let split = name.split(' ');
        if (split.length === 2) {
            return split[0][0].toUpperCase() + split[1][0].toUpperCase();
        }
        else {
            return '??';
        }
    }

    public static getConversationList(): any[] {
        return Conversations.conversations.map(value => {
            return {
                id: value.id,
                name: value.name,
                display: value.display,
                color: value.color
            };
        });
    }

    public static getConversation(id: number): any {
        let possibleConversations = Conversations.conversations.filter(value => {
            return value.id == id;
        });

        // Is more than 1 a possibility?
        if (possibleConversations && possibleConversations.length > 0) {
            return possibleConversations[0];
        }

        // Didn't find a conversation, check the contacts...
        let contact = Contacts.getContact(id);

        let conversation: IConversation = {
            id: contact.id,
            phoneNumber: contact.phoneNumber,
            name: contact.name,
            display: Conversations._determineDisplayName(contact.name),
            color: ColorUtil.getRandomColor(),
            messages: [] as IMessage[]
        };

        // Add it so the server knows...
        Conversations.conversations.unshift(conversation);

        // Since the component asking for this likely doesn't know that this is 
        // "technically" a new conversation we need to let the conversation list
        // know.
        MainElectron.sendMessageToMainContents('newConversationStarted', conversation);

        // Return the conversation that we just created.
        return conversation;
    }
}