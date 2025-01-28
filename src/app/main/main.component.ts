import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { Router, RouterModule } from '@angular/router';
import { CookieService } from '../cookie.service';
import { SocketService } from '../socket.service';
import { User } from '../classes/User';
import { BackendUrlService } from '../backend-url.service';
import { Message } from '../classes/Message';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  constructor(
    public userService: UserService,
    private cookieService: CookieService,
    private router: Router,
    private socketService: SocketService,
    private readonly backendUrlService: BackendUrlService
  ) {}

  public activeUsers: User[] = [];

  public userConversations: any = [];

  public userModal: boolean = false;

  public loadedConversation: any = null;

  public loadedUsers: any = null;

  public loadedMessages: Message[] = [];

  public contactsRequest: any = [];

  messageContent: string = '';

  async handleContactClick(contactIndex: number) {
    try {
      const findConversationRequest = await fetch(
        `${this.backendUrlService.backendURL}/users/find-contact/${this.loadedUsers[contactIndex].id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.cookieService.getCookieValue(
              'token'
            )}`,
          },
        }
      );

      const findConversationResponse = await findConversationRequest.json();

      if (!findConversationRequest.ok) {
        throw new Error('error!' + findConversationResponse.message);
      }

      if (findConversationResponse !== null) {
        if (findConversationResponse == this.loadedConversation) {
          this.loadedConversation = null;
          return;
        }

        this.loadedConversation = findConversationResponse;

        this.handleLoadMessages(
          this.loadedConversation.conversationparticipants_conversation.id
        );

        return;
      }
    } catch (err) {
      console.error(err);
    }

    try {
      const createNewContactRequest = await fetch(
        `${this.backendUrlService.backendURL}/users/create-contact/${this.loadedUsers[contactIndex].id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.cookieService.getCookieValue(
              'token'
            )}`,
          },
        }
      );

      const createNewContactResponse = await createNewContactRequest.json();

      if (!createNewContactRequest.ok) {
        throw new Error('error!' + createNewContactResponse.message);
      }

      this.loadedConversation = createNewContactResponse;
    } catch (err) {
      console.error(err);
    }

    this.handleGetActiveUsers();
  }

  async handleGetActiveUsers() {
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
        throw new Error('error!' + activeUsersResponse.message);
      }

      this.activeUsers = activeUsersResponse;
    } catch (err) {
      console.error(err);
    }
  }

  async handleSearchUsers(e: any): Promise<void> {
    if (e.target.value === '') {
      this.loadedUsers = null;

      this.handleLoadUserConversations();

      return;
    }

    try {
      this.contactsRequest = await fetch(
        `${this.backendUrlService.backendURL}/users/get-contacts`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ search_param: e.target.value }),
        }
      );

      console.log('searching contacts...');

      const contactsResponse = await this.contactsRequest.json();

      if (!this.contactsRequest.ok) {
        throw new Error('error! ' + contactsResponse.message);
      }

      this.userConversations = null;
      this.loadedUsers = contactsResponse;

      console.log(contactsResponse);
    } catch (err) {
      console.error(err);
    }
  }

  areUsersEqual(users1: User[] | null, users2: User[]): boolean {
    if (!users1 || users1.length !== users2.length) {
      return false;
    }
    return users1.every((user, index) => user.id === users2[index].id);
  }

  async sendMessage(event: Event): Promise<void> {
    event.preventDefault();

    if (!this.messageContent) return;

    const uniqueId =
      this.loadedConversation.conversationparticipants_conversation
        .ConversationParticipants[0].conversationparticipants_user.unique_id;

    console.log(this.loadedConversation);

    const message = new Message(
      this.loadedConversation.conversationparticipants_conversation.id!,
      this.userService.user?.id || 0,
      new Date(),
      this.messageContent,
      'message',
      '',
      null
    );

    this.socketService.socket.emit('send-message', { uniqueId, message });
    this.loadedMessages.push(message);
    this.messageContent = '';

    setTimeout(() => {
      this.scrollToBottom();
    }, 100);

    if (this.loadedUsers) return;

    try {
      const getConversationRequest = await fetch(
        `${this.backendUrlService.backendURL}/messages/get-conversation/${message.conversation_id}`,
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

      const index = this.userConversations.findIndex(
        (conversation: any) =>
          conversation.conversationparticipants_conversation.id ===
          message.conversation_id
      );

      const firstConversation = this.userConversations[0];

      this.userConversations[index] = firstConversation;
      this.userConversations[0] = getConversationResponse;

      console.log(this.userConversations);
    } catch (err) {
      console.error(err);
    }
  }

  handleGroupClick() {}

  scrollToBottom(): void {
    const container = document.querySelector(
      '.main__computer-conversation__messages'
    );
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  async handleLoadConversation(id: number) {
    const findConversation = this.userConversations.find(
      (conv: any) => conv.conversationparticipants_conversation.id === id
    );

    if (findConversation == this.loadedConversation) {
      this.loadedConversation = null;
      return;
    }

    this.loadedConversation = findConversation;

    console.log(this.loadedConversation);

    console.log(id);

    this.handleLoadMessages(id);
  }

  async handleLoadMessages(id: number) {
    try {
      const response = await fetch(
        `${this.backendUrlService.backendURL}/messages/get-messages/${id}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.cookieService.getCookieValue(
              'token'
            )}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      this.loadedMessages = data;

      setTimeout(() => {
        this.scrollToBottom();
      }, 100);

      console.log(this.loadedMessages);
    } catch (err) {
      console.error(err);
    }
  }

  handleRedirectToUserSettings() {
    this.router.navigate([`/user/${this.userService.user?.unique_id}`]);
  }

  async handleLogout() {
    this.socketService.socket.emit('inactive-user', this.userService.user);
    await this.userService.handleLogout();
  }

  async handleLoadUserConversations() {
    try {
      const userConversationsRequest = await fetch(
        `${this.backendUrlService.backendURL}/messages/get-conversations`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.cookieService.getCookieValue(
              'token'
            )}`,
          },
        }
      );

      const userConversationsResponse = await userConversationsRequest.json();

      if (!userConversationsRequest.ok) {
        throw new Error(
          'Failed to fetch user conversations: ' +
            userConversationsResponse.message
        );
      }

      this.userConversations = userConversationsResponse;

      console.log(this.userConversations);
    } catch (err) {
      console.error(err);
    }
  }

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

    this.handleLoadUserConversations();

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

      this.activeUsers = activeUsersResponse;

      this.socketService.socket.on('receive-message', async (message: any) => {
        console.log('receive-message', message);

        setTimeout(() => {
          this.scrollToBottom();
        }, 100);

        try {
          const getConversationRequest = await fetch(
            `${this.backendUrlService.backendURL}/messages/get-conversation/${message.conversation_id}`,
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

          const index = this.userConversations.findIndex(
            (conversation: any) =>
              conversation.conversationparticipants_conversation.id ===
              message.conversation_id
          );

          if (index === -1) {
            this.userConversations.unshift(getConversationResponse);

            this.handleGetActiveUsers();

            return;
          }

          const firstConversation = this.userConversations[0];

          this.userConversations[index] = firstConversation;
          this.userConversations[0] = getConversationResponse;

          console.log(this.userConversations);
        } catch (err) {
          console.error(err);
        }

        if (
          this.loadedConversation?.conversationparticipants_conversation
            .conversation_id === message.id
        ) {
          this.loadedMessages.push(message);
        }
      });

      this.socketService.socket.on('inactive-user', (userPayload) => {
        console.log('inactive-user', userPayload);

        this.activeUsers = this.activeUsers.filter(
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

        const findActiveFriend = this.activeUsers.find(
          (activeUser) => activeUser.id === userPayload.id
        );

        if (!findActiveFriend) {
          this.activeUsers.push(user);
        }
      });
    } catch (err) {
      console.error('Error -> ' + err);
    }
  }
}
