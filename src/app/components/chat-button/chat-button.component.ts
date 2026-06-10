import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-button.component.html',
  styleUrl: './chat-button.component.css'
})
export class ChatButtonComponent {
  @Input() shouldShow: boolean = true;

  constructor(private router: Router) {}

  navigateToMessagesForum() {
      this.router.navigate(['/messages-forum'])
  }
}
