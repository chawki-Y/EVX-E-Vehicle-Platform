import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ChatContact {
  id: number;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  online: boolean;
  messages: ChatMessage[];
}

interface ChatMessage {
  id: number;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  searchTerm = '';
  messageText = '';
  selectedContactId = 1;
  isConversationOpen = false;

  contacts: ChatContact[] = [
    {
      id: 1,
      name: 'Amina Saleh',
      role: 'Sales Assistant',
      lastMessage: 'I can share the latest EV pricing and availability.',
      time: '09:42',
      unread: 2,
      avatar: 'AS',
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'Hi, I was looking at the Model Y listings.', time: '09:10' },
        { id: 2, sender: 'me', text: 'Absolutely, I can help with that.', time: '09:12' },
        { id: 3, sender: 'them', text: 'Perfect. Can you also send financing options?', time: '09:16' },
        { id: 4, sender: 'me', text: 'Yes, I’ll pull the latest options for you now.', time: '09:18' }
      ]
    },
    {
      id: 2,
      name: 'Omar Haddad',
      role: 'Support',
      lastMessage: 'Your comparison request is ready.',
      time: '08:15',
      unread: 0,
      avatar: 'OH',
      online: false,
      messages: [
        { id: 1, sender: 'them', text: 'I checked the vehicles you compared yesterday.', time: '08:01' },
        { id: 2, sender: 'me', text: 'Great, thanks for the quick follow-up.', time: '08:03' },
        { id: 3, sender: 'them', text: 'Your comparison request is ready.', time: '08:15' }
      ]
    },
    {
      id: 3,
      name: 'Lina Farah',
      role: 'Dealer Desk',
      lastMessage: 'Send me the accessory details and I’ll confirm stock.',
      time: 'Yesterday',
      unread: 1,
      avatar: 'LF',
      online: true,
      messages: [
        { id: 1, sender: 'them', text: 'Do you need the charging cable bundle too?', time: 'Yesterday' },
        { id: 2, sender: 'me', text: 'Yes, please include it with the order.', time: 'Yesterday' },
        { id: 3, sender: 'them', text: 'Send me the accessory details and I’ll confirm stock.', time: 'Yesterday' }
      ]
    }
  ];

  get filteredContacts(): ChatContact[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.contacts;
    return this.contacts.filter(contact =>
      contact.name.toLowerCase().includes(term) ||
      contact.role.toLowerCase().includes(term) ||
      contact.lastMessage.toLowerCase().includes(term)
    );
  }

  get selectedContact(): ChatContact {
    return this.contacts.find(contact => contact.id === this.selectedContactId) ?? this.contacts[0];
  }

  selectContact(contactId: number): void {
    this.selectedContactId = contactId;
    this.isConversationOpen = true;
  }

  closeConversation(): void {
    this.isConversationOpen = false;
  }

  sendMessage(): void {
    const text = this.messageText.trim();
    if (!text) return;

    this.selectedContact.messages.push({
      id: Date.now(),
      sender: 'me',
      text,
      time: 'Now'
    });

    this.selectedContact.lastMessage = text;
    this.selectedContact.time = 'Now';
    this.messageText = '';
  }
}
