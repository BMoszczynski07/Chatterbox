import { Message } from '../classes/Message';

export interface Messages {
  first_name: string;
  profile_pic: string;
  unique_id: string;
  from: number | null;
  messages: Message[];
}
