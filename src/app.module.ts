import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MessagesModule } from './messages/messages.module';
import { Message } from './messages/entities/message.entity';
import { RoomModule } from './room/room.module';
import { Room } from './room/entities/room.entity';
import { UserToRoom } from './room/entities/user-to-room.entity';
import { UserToMessage } from './messages/entities/user-to-message.entity';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      //host: 'host.docker.internal',
      host: 'localhost',
      port: 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'nestjs_messages',
      entities: [Message, Room, UserToRoom, UserToMessage],
      synchronize: true,
    }),
    MessagesModule,
    RoomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
