import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { stringify } from 'querystring';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ){}

    async setSocketId(id: string, socketId: string | null) {
        const user = await this.userRepository.findOne({
            where: {id},
            relations: ['rooms', 'privateChat', 'privateChat.users'],
            order: {
                rooms: {
                    created_at: 'DESC'
                },
                privateChat: {
                    created_at: 'DESC'
                }
            },
            select: {
                rooms: {id: true, name: true, created_at: true},
                privateChat: {id: true, users: {id: true, username: true}, created_at: true}
            },
        })
        user.socket_id = socketId
        const saveUser = await this.userRepository.save(user)
        const userChats = saveUser.privateChat.map(privateChat => {
            return {id: privateChat.id, user: privateChat.users.find(userChat => userChat.id !== saveUser.id), type: 'private-message'}
        })
        return {...saveUser, chats: userChats}
    }

    async getById(id: string) {
        const user = await this.userRepository.findOne({
            where: {id},
            select: ['username', 'id', 'socket_id', 'avatar'] 
        })
        return user
    }

    
}