import { forwardRef, HttpException, HttpStatus, Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomEntity } from './room.entity';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { isUUID } from '../utils/isUidd';
import { ChatEventsService } from 'src/chat-events/chat-events.service';
import { UserSocket } from 'src/adapter/auth.adapter';

@Injectable()
export class RoomService {
    constructor(
        @InjectRepository(RoomEntity) private readonly roomRepository: Repository<RoomEntity>,
        private readonly userService: UserService,
        @Inject(forwardRef(() => ChatEventsService))
        private readonly chatEventsService: ChatEventsService
    ){}

    async joinRoomByLink(id: string, link: string) {
        if(!isUUID(link)) return 
        
        const room = await this.roomRepository.findOne({
            where: {link},
            relations: {users: true, owner: true},
            select: {
                users: {id: true, socket_id: true, username: true},
                owner: {id: true, socket_id: true, username: true}
            },
        })
        if(!room) return 

        const user = await this.userService.getById(id)

        const userRoom = room.users.find((userR) => userR.id === id)
        if(!userRoom) {
            room.users.push(user)
            return await this.roomRepository.save(room)
        }
    }

    async leaveRoom(userId: string, roomId: number) {
        const room = await this.roomRepository.findOne({
            where: {id: roomId},
            relations: {users: true, owner: true},
            select: {
                users: {id: true, socket_id: true, username: true},
                owner: {id: true, socket_id: true, username: true}
            },
        })
        if(!room) return
        room.users = room.users.filter(user => user.id !== userId)
        return await this.roomRepository.save(room)
    }

    async createRoom(userId: string, name: string) {
        const user = await this.userService.getById(userId)
        const room = this.roomRepository.create({owner: user, name})
        if(!user) return
        room.users = [user]
        return await this.roomRepository.save(room)
    }

    async checkUserInRoom(userId: string, roomId: number) {
        const room = await this.roomRepository.findOne({
            where: {id: roomId, users: {id: userId}}
        })
        return room
    }

    async getByRoomAndUserId(roomId: number, userId: string) {
        const room = await this.roomRepository.findOne({
            where:{
                id: roomId
            },
            relations: {
                users: true,
                owner: true
            },
            select: {
                users: {
                    id: true
                },
                owner: {
                    id: true,
                    username: true
                }
            }
        })

        return {id: room.id, name: room.name, link: room.link, created_at: room.created_at, usersCount: room.users.length, owner: room.owner}
    }


}