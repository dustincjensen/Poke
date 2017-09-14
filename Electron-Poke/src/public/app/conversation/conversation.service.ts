import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class ConversationService {
    newConversation = new EventEmitter<number>();

    public startNewConversation(id: number): void {
        this.newConversation.emit(id);
    }
}