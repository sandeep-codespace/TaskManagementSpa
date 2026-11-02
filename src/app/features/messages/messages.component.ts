import { CommonModule } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';
import {
  AccountRole,
  Conversation,
  MarketplaceData,
} from '../../shared/models/marketplace.models';

@Component({
  imports: [CommonModule],
  selector: 'app-messages-feature',
  templateUrl: './messages.component.html',
})
export class MessagesComponent {
  readonly role = input.required<AccountRole>();
  readonly data = input.required<MarketplaceData>();
  readonly send = output<{ conversationId: string; text: string }>();

  protected readonly selectedConversationId = signal('chat-01');
  protected readonly draft = signal('');
  protected readonly conversations = computed(() => {
    const userId = this.currentUserId();
    return this.data().conversations.filter(
      (conversation) =>
        conversation.clientId === userId || conversation.freelancerId === userId,
    );
  });
  protected readonly selectedConversation = computed(
    () =>
      this.conversations().find(
        (conversation) => conversation.id === this.selectedConversationId(),
      ) ??
      this.conversations()[0] ??
      null,
  );

  protected inputValue(event: Event): string {
    const target = event.target;
    return target instanceof HTMLInputElement ? target.value : '';
  }

  protected conversationName(conversation: Conversation): string {
    return this.userForId(this.otherUserId(conversation))?.name ?? 'Project conversation';
  }

  protected conversationInitials(conversation: Conversation): string {
    return this.userForId(this.otherUserId(conversation))?.initials ?? 'F';
  }

  protected isMine(fromMe: boolean): boolean {
    return this.role() === 'freelancer' ? fromMe : !fromMe;
  }

  protected submit(event: Event): void {
    event.preventDefault();
    const conversation = this.selectedConversation();
    const text = this.draft().trim();
    if (!conversation || !text) {
      return;
    }

    this.send.emit({ conversationId: conversation.id, text });
    this.draft.set('');
  }

  private currentUserId(): string {
    return this.data().users.find((user) => user.role === this.role())?.id ?? '';
  }

  private otherUserId(conversation: Conversation): string {
    return this.role() === 'freelancer' ? conversation.clientId : conversation.freelancerId;
  }

  private userForId(userId: string) {
    return this.data().users.find((user) => user.id === userId);
  }
}
