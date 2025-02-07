import { Component } from '@angular/core';
import { ChatService } from '../chat.service';
import { UserService } from '../user.service';
import { UserConversationsComponent } from '../user-conversations/user-conversations.component';
import { IsGroupComponent } from '../is-group/is-group.component';
import { IsNotGroupComponent } from '../is-not-group/is-not-group.component';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-main-computer',
  standalone: true,
  imports: [
    RouterModule,
    UserConversationsComponent,
    IsGroupComponent,
    IsNotGroupComponent,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './main-computer.component.html',
  styleUrl: './main-computer.component.scss',
})
export class MainComputerComponent {
  constructor(
    public chatService: ChatService,
    public userService: UserService
  ) {}
}
