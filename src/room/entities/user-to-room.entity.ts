import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from './room.entity';

@Entity()
export class UserToRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  userSocketId: string;

  @Column()
  roomId: number;

  @ManyToOne(() => Room, (room) => room.userToRooms)
  room: Room;
}
