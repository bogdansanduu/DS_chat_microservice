import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { RoomService } from '../room/room.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  constructor(
    @Inject(MessagesService) private readonly messagesService: MessagesService,
    @Inject(RoomService) private readonly roomService: RoomService,
  ) {}

  @SubscribeMessage('messageGlobal')
  async create(@MessageBody() createMessageDto: CreateMessageDto) {
    const message = await this.messagesService.create(createMessageDto);

    this.server.emit('messageGlobal', message);
  }

  @SubscribeMessage('messageRoom')
  async createRoomMessage(@MessageBody() createMessageDto: CreateMessageDto) {
    const message = await this.messagesService.create(createMessageDto);
    const room = await this.roomService.findOneById(createMessageDto.roomId);

    this.server.to(room.name).emit('messageRoom', message);
  }

  @SubscribeMessage('findAllMessages')
  async findAll() {
    const messages = await this.messagesService.findAllPublic();
    this.server.emit('allMessages', messages);
  }

  @SubscribeMessage('findAllMessagesByRoomId')
  async findAllByRoomId(@MessageBody() roomId: number) {
    const messages = await this.messagesService.findAllByRoomId(roomId);
    const room = await this.roomService.findOneById(roomId);

    this.server.to(room.name).emit('allMessagesRoom', messages);
  }

  @SubscribeMessage('findAllMessagesByRoomName')
  async findAllByRoomName(@MessageBody() { roomName }: { roomName: string }) {
    const room = await this.roomService.findOneByName(roomName);

    if (!room) {
      return [];
    }

    const messages = await this.messagesService.findAllByRoomId(room.id);

    this.server.to(roomName).emit('allMessagesRoom', messages);
  }

  async handleConnection(socket: Socket) {
    console.log(`user with socket id ${socket.id} connected`);
  }

  async handleDisconnect(socket: Socket) {
    console.log(`user with socket id ${socket.id} disconnected`);
    await this.roomService.removeUserFromAllRooms(socket.id);
  }

  @SubscribeMessage('typing')
  async typing(
    @MessageBody()
    {
      roomId,
      userName,
      typing,
      socketId,
    }: {
      roomId: number;
      userName: string;
      typing: boolean;
      socketId: string;
    },
  ) {
    const room = await this.roomService.findOneById(roomId);

    this.server
      .to(room.name)
      .except(socketId)
      .emit('typing', { userName, typing });
  }

  @SubscribeMessage('messagesSeen')
  async messageSeen(
    @MessageBody()
    {
      messages,
      roomName,
    }: {
      messages: {
        messageId: number;
        userId: number;
      }[];
      roomName: string;
    },
  ) {
    await Promise.all(
      messages.map(async (messageData) => {
        const { messageId, userId } = messageData;
        return await this.messagesService.markMessageAsSeen(messageId, userId);
      }),
    );

    const room = await this.roomService.findOneByName(roomName);
    const messagesRoom = await this.messagesService.findAllByRoomId(room.id);

    this.server.to(roomName).emit('allMessagesRoom', messagesRoom);
  }
}
