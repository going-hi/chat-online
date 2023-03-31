import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './chat.entity';
import { ChatService } from './chat.service';

@Module({
    providers: [ChatService],
    imports: [
        TypeOrmModule.forFeature([ChatEntity])
    ],
    exports: [ChatService]
})
export class ChatModule {}