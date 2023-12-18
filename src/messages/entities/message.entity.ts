import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Room } from '../../room/entities/room.entity';
import { UserToMessage } from './user-to-message.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  userName: string;

  @Column()
  text: string;

  @ManyToOne(() => Room, (room) => room.messages)
  room: Room;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToMany(() => UserToMessage, { onDelete: 'CASCADE' })
  @JoinTable()
  seenBy: UserToMessage[];
}
