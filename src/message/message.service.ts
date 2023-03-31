import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from './message.entity';
import { Repository } from 'typeorm';
import { MessageDto } from './message.dto';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class MessageService {
    constructor(
        @InjectRepository(MessageEntity) private readonly messageRepository: Repository<MessageEntity>,
        private readonly filesService: FilesService
    ){}

    async getMessageByChatId(chatId: number, limit: number, page: number) {
        const messages = await this.messageRepository.findAndCount({
            where: {chat: {id: chatId}},
            take: limit,
            skip: limit * page - limit,
            relations: {user: true},
            order: {
                created_at: 'DESC'
            },
            select: {user: {id: true, username: true}}
        })

        return messages
    }

    async getMessageByRoomId(roomId: number, limit: number, page: number) {
        const messages = await this.messageRepository.findAndCount({
            where: {room: {id: roomId}},
            order: {
                created_at: 'DESC'
            },
            take: limit,
            skip: limit * page - limit,
            relations: {user: true},
            select: {user: {id: true, username: true}}
        })
        return messages
    }

    async create(dto: MessageDto) {
        const message = this.messageRepository.create({filename: dto.filename, text: dto.text, chat: {id: dto.type.chatId}, room: {id: dto.type.roomId}, user: {id: dto.userId}})
        return await this.messageRepository.save(message)
    }
}