import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Message } from './message.entity';

@Entity()
export class UserToMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => Message, (message) => message.seenBy, {
    onDelete: 'CASCADE',
  })
  message: Message;
}
