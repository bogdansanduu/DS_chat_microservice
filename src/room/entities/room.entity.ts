import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { UserToRoom } from './user-to-room.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hostId: number;

  @Column({ unique: true })
  name: string;

  @OneToMany(() => UserToRoom, (userToRoom) => userToRoom.room)
  userToRooms: UserToRoom[];

  @OneToMany(() => Message, (message) => message.room)
  messages: Message[];
}
