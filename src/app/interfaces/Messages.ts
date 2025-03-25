import { Message } from '../classes/Message';
import { DateTime } from './DateTime';
import { Margin } from './Margin';

export interface Messages {
  first_name: string;
  profile_pic: string;
  unique_id: string;
  from: number | null;
  messages: (Message | Margin | DateTime)[];
}
