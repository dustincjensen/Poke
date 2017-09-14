export interface IConversation {
    id: number;
    phoneNumber: string;
    name: string;
    display: string;
    color: string;
    messages: IMessage[];
}

export interface IMessage {
    isSelf: boolean;
    message: string;
    time: number;
}

export interface IContact {
    id: number;
    phoneNumber: string;
    name: string;
    display: string;
}