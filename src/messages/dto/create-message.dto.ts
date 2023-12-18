export class CreateMessageDto {
  userId: number;
  userName: string;
  text: string;
  roomId?: number;
}
