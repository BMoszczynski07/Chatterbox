export class Message {
  constructor(
    public conversation_id: number,
    public user_id: number,
    public message_date: Date,
    public content: string,
    public type: 'message' | 'image' | 'audio',
    public img_src: string | null,
    public responseTo: number | null,
    public id?: number
  ) {}
}
