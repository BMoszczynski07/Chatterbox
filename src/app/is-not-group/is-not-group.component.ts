import { Component } from '@angular/core';
import { ChatService } from '../chat.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-is-not-group',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './is-not-group.component.html',
  styleUrl: './is-not-group.component.scss',
})
export class IsNotGroupComponent {
  constructor(public chatService: ChatService) {}
}
