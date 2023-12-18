import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Room } from './entities/room.entity';
import { RoomService } from './room.service';
import { UserToRoom } from './entities/user-to-room.entity';
import { RoomGateway } from './room.gateway';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Room, UserToRoom]),
    forwardRef(() => MessagesModule),
  ],
  providers: [RoomService, RoomGateway],
  exports: [RoomService],
})
export class RoomModule {}
