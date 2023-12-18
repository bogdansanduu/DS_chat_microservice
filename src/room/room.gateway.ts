import { Inject } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { RoomService } from './room.service';
import { AddUserToRoomDto } from './dto/add-user-to-room.dto';
import { RemoveUserFromRoomDto } from './dto/remove-user-from-room.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomGateway {
  @WebSocketServer() server: Server;
  constructor(@Inject(RoomService) private readonly roomService: RoomService) {}

  @SubscribeMessage('getAllRooms')
  async findAllRooms() {
    const rooms = await this.roomService.findAll();
    this.server.emit('allRooms', rooms);
    return rooms;
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(
    @MessageBody()
    data: AddUserToRoomDto,
  ) {
    const { roomName, userId, userSocketId } = data;

    console.log(
      `user with socket id ${userSocketId} is joining room ${roomName}`,
    );

    await this.server.in(userSocketId).socketsJoin(roomName);
    const room = await this.roomService.addUserToRoom({
      userId,
      roomName,
      userSocketId,
    });

    this.server.to(roomName).emit('joinedRoom', room);

    return await this.findAllRooms();
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(@MessageBody() data: RemoveUserFromRoomDto) {
    const { roomName, userId, userSocketId } = data;

    if (userSocketId) {
      console.log(
        `user with socket id ${userSocketId} is leaving room ${roomName}`,
      );
      await this.server.in(userSocketId).socketsLeave(roomName);
      await this.roomService.removeUserFromRoom({
        userId,
        roomName,
        userSocketId,
      });

      return await this.findAllRooms();
    }
  }
}
