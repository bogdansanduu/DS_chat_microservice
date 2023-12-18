import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './entities/message.entity';
import { RoomService } from '../room/room.service';
import { UserToMessage } from './entities/user-to-message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @Inject(RoomService) private readonly roomService: RoomService,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(UserToMessage)
    private userToMessageRepo: Repository<UserToMessage>,
  ) {}

  async create(createMessageDto: CreateMessageDto) {
    const { userId, userName, text, roomId } = createMessageDto;

    const room = roomId ? await this.roomService.findOneById(roomId) : null;

    const newMessage = this.messageRepo.create({
      userId,
      userName,
      text,
      room,
      seenBy: [],
    });

    return this.messageRepo.save(newMessage);
  }

  async findAllPublic() {
    return await this.messageRepo.find({
      where: {
        room: IsNull(),
      },
    });
  }

  async findAllByRoomId(roomId: number) {
    return await this.messageRepo.find({
      where: {
        room: {
          id: roomId,
        },
      },
      relations: {
        seenBy: true,
      },
    });
  }

  async deleteAllMessagesFromRoom(roomId: number) {
    return await this.messageRepo.delete({
      room: {
        id: roomId,
      },
    });
  }
  async markMessageAsSeen(messageId: number, userId: number) {
    const message = await this.messageRepo.findOne({
      where: {
        id: messageId,
      },
      relations: ['seenBy'],
    });

    if (!message || message.userId === userId) {
      return;
    }

    const userSeenMessage = message.seenBy.find(
      (userToMessage) => userToMessage.userId === userId,
    );

    if (userSeenMessage) {
      return;
    }

    const userToMessage = this.userToMessageRepo.create({
      userId: userId,
      message: message,
    });

    await this.userToMessageRepo.save(userToMessage);

    message.seenBy.push(userToMessage);

    return await this.messageRepo.save(message);
  }
}
