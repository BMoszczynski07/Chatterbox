import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { User } from '../classes/User';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MainComputerComponent } from '../main-computer/main-computer.component';
import { UserService } from '../user.service';
import { CookieService } from '../cookie.service';
import { SocketService } from '../socket.service';
import { ChatService } from '../chat.service';
import { BackendUrlService } from '../backend-url.service';
import { MainPhoneComponent } from '../main-phone/main-phone.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    CommonModule,
    MainComputerComponent,
    MainPhoneComponent,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  constructor(
    public userService: UserService,
    private cookieService: CookieService,
    private router: Router,
    private chatService: ChatService,
    private socketService: SocketService,
    private backendUrlService: BackendUrlService
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      await this.userService.handleGetUser(
        this.cookieService.getCookieValue('token')
      );
    } catch (err) {
      console.error(err);

      if (this.userService.user) {
        this.userService.handleLogout();
      } else {
        this.router.navigate(['/login']);
      }
    }

    this.socketService.handleConnect();

    this.chatService.handleLoadUserConversations();

    try {
      const activeUsersRequest = await fetch(
        `${this.backendUrlService.backendURL}/user/active-users/${this.userService.user?.id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.cookieService.getCookieValue(
              'token'
            )}`,
          },
        }
      );

      const activeUsersResponse = await activeUsersRequest.json();

      if (!activeUsersRequest.ok) {
        throw new Error(
          'Failed to fetch active users: ' + activeUsersResponse.message
        );
      }

      this.chatService.activeUsers = activeUsersResponse;

      this.socketService.socket.on('receive-message', async (message: any) => {
        console.log('receive-message', message);

        setTimeout(() => {
          this.chatService.scrollToBottom();
        }, 100);

        try {
          const getConversationRequest = await fetch(
            `${this.backendUrlService.backendURL}/messages/get-conversation/${message.messages[0].conversation_id}`,
            {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${this.cookieService.getCookieValue(
                  'token'
                )}`,
              },
            }
          );

          console.log('getConversationRequest...');

          const getConversationResponse = await getConversationRequest.json();

          if (!getConversationRequest.ok) {
            throw new Error(
              'Failed to fetch conversation: ' + getConversationResponse.message
            );
          }

          const index = this.chatService.userConversations.findIndex(
            (conversation: any) =>
              conversation.conversationparticipants_conversation.id ===
              message.messages[0].conversation_id
          );

          if (index === -1) {
            this.chatService.userConversations.unshift(getConversationResponse);

            this.chatService.handleGetActiveUsers();

            return;
          }

          const firstConversation = this.chatService.userConversations[0];

          this.chatService.userConversations[index] = firstConversation!;
          this.chatService.userConversations[0] = getConversationResponse;

          console.log(this.chatService.userConversations);
        } catch (err) {
          console.error(err);
        }

        if (
          this.chatService.loadedConversation
            .conversationparticipants_conversation.id ===
          message.messages[0].conversation_id
        ) {
          console.log('pushing message...');

          if (
            this.chatService.loadedMessages[
              this.chatService.loadedMessages.length - 1
            ].from === message.from
          ) {
            this.chatService.loadedMessages[
              this.chatService.loadedMessages.length - 1
            ].messages.push(message.messages[0]);
          } else {
            this.chatService.loadedMessages.push(message);
          }
        }
      });

      this.socketService.socket.on('inactive-user', (userPayload) => {
        console.log('inactive-user', userPayload);

        this.chatService.activeUsers = this.chatService.activeUsers.filter(
          (activeUser) => activeUser.id !== userPayload.id
        );
      });

      this.socketService.socket.on('active-user', (userPayload) => {
        console.log('active-user', userPayload);

        const user = new User(
          userPayload.id,
          userPayload.unique_id,
          userPayload.first_name,
          userPayload.last_name,
          userPayload.pass,
          new Date(userPayload.create_date),
          userPayload.user_desc,
          userPayload.email,
          userPayload.verified,
          userPayload.socket_id,
          userPayload.profile_pic,
          userPayload.is_active
        );

        const findActiveFriend = this.chatService.activeUsers.find(
          (activeUser) => activeUser.id === userPayload.id
        );

        if (!findActiveFriend) {
          this.chatService.activeUsers.push(user);
        }
      });
    } catch (err) {
      console.error('Error -> ' + err);
    }
  }
}
