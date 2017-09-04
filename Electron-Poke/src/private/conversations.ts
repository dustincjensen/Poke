import { MainElectron } from './main';

export class Conversations {

    public static conversations: any[];

    public static setupConversations() {
        Conversations.conversations = [
            {
                id: 10000,
                phoneNumber: '+19695553215',
                name: 'Dave Grohl',
                display: 'DG',
                messages: [
                    {
                        contact: {
                            id: 784,
                            phoneNumber: '+19695553215',
                            name: 'Dave Grohl',
                            isSelf: false
                        },
                        message: 'Hey, how are you doing today friend?',
                        time: Date.now() - (36 * 60 * 1000)
                    },
                    {
                        contact: {
                            id: 784,
                            phoneNumber: '+19695553215',
                            name: 'Dave Grohl',
                            isSelf: false
                        },
                        message: 'I was wondering what you are up to today?',
                        time: Date.now() - (35 * 60 * 1000)
                    },
                    {
                        contact: {
                            id: 0,
                            phoneNumber: null,
                            name: 'Me',
                            isSelf: true
                        },
                        message: 'Hey Dave. I\'m doing pretty well, thanks for asking',
                        time: Date.now() - (30 * 60 * 1000)
                    },
                    {
                        contact: {
                            id: 0,
                            phoneNumber: null,
                            name: 'Me',
                            isSelf: true
                        },
                        message: 'I\'m not up to much, did you have something in mind? I would totally be up for some food or something.',
                        time: Date.now() - (30 * 60 * 1000)
                    },
                    {
                        contact: {
                            id: 784,
                            phoneNumber: '+19695553215',
                            name: 'Dave Grohl',
                            isSelf: false
                        },
                        message: 'How about we get together and jam?',
                        time: Date.now() - (29 * 60 * 1000)
                    }
                ]
            },
            {
                id: 10001,
                phoneNumber: '+17775553112',
                name: 'Taylor Hawkins',
                display: 'TH',
                messages: []
            }
        ];
    }

    public static handleIncomingMessage(obj: any): any {
        let index = Conversations.conversations.findIndex(value => {
            return value.id === obj.contact.id;
        });

        // If there is a conversation go ahead and add to the existing
        // conversation.
        if (index >= 0) {
            let newMessage = {
                contact: {
                    id: obj.contact.id,
                    phoneNumber: obj.contact.phoneNumber,
                    name: obj.contact.name,
                    isSelf: false
                },
                message: obj.message,
                time: Date.now()
            };
            Conversations.conversations[index].messages.push(newMessage);

            // Since we might be on the conversation send a new message
            MainElectron.sendMessageToMainContents('new-message', newMessage);
        } else {
            let conversation = {
                id: obj.contact.id,
                phoneNumber: obj.contact.phoneNumber,
                name: obj.contact.name,
                display: Conversations._determineDisplayName(obj.contact.name),
                messages: [
                    {
                        contact: {
                            id: obj.contact.id,
                            phoneNumber: obj.contact.phoneNumber,
                            name: obj.contact.name,
                            isSelf: false
                        },
                        message: obj.message,
                        time: Date.now()
                    }
                ]
            };
            Conversations.conversations.push(conversation);

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
        Conversations.setupConversations();

        return Conversations.conversations.map(value => {
            return {
                id: value.id,
                name: value.name,
                display: value.display
            };
        });
    }

    public static getConversation(id: number): any {
        return Conversations.conversations.filter(value => {
            return value.id == id;
        })[0];
    }
}