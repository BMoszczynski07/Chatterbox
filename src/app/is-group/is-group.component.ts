import { Component } from '@angular/core';
import { ChatService } from '../chat.service';
import { UserService } from '../user.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-is-group',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './is-group.component.html',
  styleUrl: './is-group.component.scss',
})
export class IsGroupComponent {
  constructor(
    public chatService: ChatService,
    public userService: UserService
  ) {}
}
