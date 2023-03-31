import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomEntity } from './room.entity';
import { RoomService } from './room.service';
import { UserModule } from '../user/user.module';

import { ChatEventsModule } from 'src/chat-events/chat-events.module';
import { forwardRef } from '@nestjs/common/utils';


@Module({
    imports: [
        TypeOrmModule.forFeature([RoomEntity]),
        UserModule,
        forwardRef(() => ChatEventsModule)
    ],
    providers: [RoomService],
    exports: [RoomService]
})
export class RoomModule {}
