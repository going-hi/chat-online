import { Module } from "@nestjs/common";
import { ChatEventsGateway } from './chat-events.gateway';
import { ChatEventsService } from './chat-events.service';
import { UserModule } from '../user/user.module';
import { ChatModule } from '../chat/chat.module';
import { RoomModule } from '../room/room.module';
import { MessageModule } from '../message/message.module';
import { forwardRef } from "@nestjs/common/utils";
import { FilesModule } from "src/files/files.module";

@Module({
    providers: [ChatEventsGateway, ChatEventsService],
    imports: [
        UserModule,
        ChatModule,
        MessageModule,
        FilesModule,
        forwardRef(() => RoomModule)
    ],
    exports: [ChatEventsService]
})
export class ChatEventsModule {}