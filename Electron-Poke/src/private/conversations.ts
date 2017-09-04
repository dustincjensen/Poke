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