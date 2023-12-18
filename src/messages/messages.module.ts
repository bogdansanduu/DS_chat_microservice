import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { Message } from './entities/message.entity';
import { RoomModule } from '../room/room.module';
import { UserToMessage } from './entities/user-to-message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, UserToMessage]),
    forwardRef(() => RoomModule),
  ],
  providers: [MessagesGateway, MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
