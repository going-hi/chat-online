import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatEntity } from './chat.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatEntity) private readonly chatRepository: Repository<ChatEntity>
    ){}

    async createOrFind(usersId: string[]) {
        const oldChat = await this.chatRepository.findOne({
            where: [
                {users: {id: usersId[0]}},
                {users: {id: usersId[1]}},
            ],
            relations: {
                users: true
            }
        })

        if(!oldChat) {
            const newChat = this.chatRepository.create(
                {users: [{id: usersId[0]}, {id: usersId[1]}]}
            )
            return await this.chatRepository.save(newChat)
        }
        return oldChat
    }

    async getChatByUsersId([OneId, TwoId]: string[]) {
        const chat = await this.chatRepository.findOne({
            where: [
                {users: [{id: OneId}, {id: TwoId}]}
            ]
        })
        return chat
    }
}