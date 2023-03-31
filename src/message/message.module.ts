import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from 'src/files/files.module';
import { MessageEntity } from './message.entity';
import { MessageService } from './message.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([MessageEntity]),
        FilesModule
    ],
    providers: [MessageService],
    exports: [MessageService]
})
export class MessageModule {}