import { Component } from '@angular/core';
import { ChatService } from '../chat.service';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-conversations',
  standalone: true,
  imports: [],
  templateUrl: './user-conversations.component.html',
  styleUrl: './user-conversations.component.scss',
})
export class UserConversationsComponent {
  constructor(
    public chatService: ChatService,
    public userService: UserService
  ) {}
}
