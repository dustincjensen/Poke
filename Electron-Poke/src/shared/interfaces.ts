export interface IConversation {
    id: number;
    phoneNumber: string;
    name: string;
    display: string;
    messages: IMessage[];
}

export interface IMessage {
    isSelf: boolean;
    message: string;
    time: number;
}