import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Room } from './entities/room.entity';
import { CreateRoomDto } from './dto/create-room.dto';
import { UserToRoom } from './entities/user-to-room.entity';
import { AddUserToRoomDto } from './dto/add-user-to-room.dto';
import { RemoveUserFromRoomDto } from './dto/remove-user-from-room.dto';
import { MessagesService } from '../messages/messages.service';

@Injectable()
export class RoomService {
  constructor(
    @Inject(forwardRef(() => MessagesService))
    private messagesService: MessagesService,
    @InjectRepository(Room)
    private roomRepo: Repository<Room>,
    @InjectRepository(UserToRoom)
    private userToRoomRepo: Repository<UserToRoom>,
  ) {}

  async findAll() {
    return await this.roomRepo.find({
      relations: {
        userToRooms: true,
      },
    });
  }

  async findOneById(id: number) {
    return await this.roomRepo.findOne({
      where: {
        id,
      },
      relations: {
        userToRooms: true,
      },
    });
  }

  async findOneByName(name: string) {
    return await this.roomRepo.findOne({
      where: {
        name: name,
      },
    });
  }

  async createRoom(createRoomDto: CreateRoomDto) {
    const { hostId, name, userSocketId } = createRoomDto;

    const newRoom = this.roomRepo.create({ name, hostId });

    const savedRoom = await this.roomRepo.save(newRoom);

    const userToRoom = this.userToRoomRepo.create({
      userId: hostId,
      roomId: savedRoom.id,
      userSocketId,
    });

    await this.userToRoomRepo.save(userToRoom);

    return savedRoom;
  }

  async addUserToRoom(addUserToRoomDto: AddUserToRoomDto) {
    const { userId, roomName, userSocketId } = addUserToRoomDto;

    let room = await this.roomRepo.findOne({ where: { name: roomName } });

    //if room doesn't exist, create it
    if (!room) {
      room = await this.createRoom({
        hostId: userId,
        name: roomName,
        userSocketId,
      });
    }

    //if userToRoom already exists, return room
    const userToRoomExists = await this.userToRoomRepo.findOne({
      where: { userId, roomId: room.id },
    });

    if (userToRoomExists) {
      return room;
    }

    const userToRoom = this.userToRoomRepo.create({
      userId,
      roomId: room.id,
      userSocketId,
    });

    await this.userToRoomRepo.save(userToRoom);

    return room;
  }

  async removeUserFromRoom(removeUserFromRoomDto: RemoveUserFromRoomDto) {
    const { userId, roomName } = removeUserFromRoomDto;

    const room = await this.roomRepo.findOne({
      where: {
        name: roomName,
      },
    });

    if (!room) {
      throw new NotFoundException(`Room with name ${roomName} not found`);
    }

    const userToRoom = await this.userToRoomRepo.findOne({
      where: {
        userId: userId,
        roomId: room.id,
      },
    });

    if (!userToRoom) {
      throw new NotFoundException(
        `User with ID ${userId} not found in room ${roomName}`,
      );
    }

    await this.userToRoomRepo.remove(userToRoom);

    const usersInRoomCount = await this.userToRoomRepo.count({
      where: {
        roomId: room.id,
      },
    });

    if (usersInRoomCount === 0) {
      await this.messagesService.deleteAllMessagesFromRoom(room.id);
      await this.roomRepo.remove(room);
    }
  }

  async removeUserFromAllRooms(userSocketId: string) {
    const userToRooms = await this.userToRoomRepo.find({
      where: {
        userSocketId: userSocketId,
      },
    });

    await this.userToRoomRepo.remove(userToRooms);
  }
}
