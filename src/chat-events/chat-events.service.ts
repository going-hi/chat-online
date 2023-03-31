import { forwardRef, Injectable, Inject } from '@nestjs/common';
import { Server } from 'socket.io';
import { UserSocket } from 'src/adapter/auth.adapter';
import { UserService } from '../user/user.service';
import { RECEIVE_MESSAGES, USERS_ROOM, GET_OLD_MESSAGES, INFO_ROOM, MY_MESSAGE } from './chat-events.constants';
import { ChatService } from '../chat/chat.service';
import { RoomService } from '../room/room.service';
import { UserEntity } from '../user/user.entity';
import { MessageService } from '../message/message.service';
import { MessageEntity } from 'src/message/message.entity';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class ChatEventsService {
    public server: Server
    private infoBot = 'Chat bot'
    constructor(
        private readonly userService: UserService,
        private readonly chatService: ChatService,
        @Inject(forwardRef(() => RoomService))
        private readonly roomService: RoomService,
        private readonly messageService: MessageService,
        private readonly filesService: FilesService
    ) {}

    async handlePrivateMessages(socket: UserSocket, toId: string, text: string, audio?: Buffer) {
        const user = await this.userService.getById(toId)
        const chat = await this.chatService.createOrFind([socket.user.id, toId])
        let message
        if(audio) {
            const filename = await this.filesService.saveFiles(audio, 'mpeg')
            message = await this.messageService.create({type: {chatId: chat.id}, filename, userId: socket.user.id})
        }else {
            message = await this.messageService.create({type: {chatId: chat.id}, text, userId: socket.user.id})
        }
        if(user.socket_id) {
            socket.to(user.socket_id).emit(
                RECEIVE_MESSAGES,
                {user: socket.user , message}
            )
        }
        return message
    }

    async handleMessagesRoom(socket: UserSocket, roomId: number, text: string, audio?: Buffer) {
        const check = await this.roomService.checkUserInRoom(socket.user.id, roomId)
        if(!check) return {error: 'Ошибка доступа'}
        let message
        if(audio) {
            const filename = await this.filesService.saveFiles(audio, 'mpeg')
            message = await this.messageService.create({type: {roomId}, filename, userId: socket.user.id})
        }else {
            message = await this.messageService.create({type: {roomId}, text, userId: socket.user.id})
        }
        
        socket.in(`${roomId}`).emit(RECEIVE_MESSAGES, {user: socket.user, message})
        return message
    }

    async getMessagesByRoomId(socket: UserSocket, roomId: number, limit = 10, page = 1) {
        const check = await this.roomService.checkUserInRoom(socket.user.id, roomId)
        if(!check) return
        const messages = await this.messageService.getMessageByRoomId(roomId, limit, page)
        return messages
    }

    async getMessagesByUserId(socket: UserSocket, toUserId: string, limit = 10, page = 1) {
        const chat = await this.chatService.getChatByUsersId([socket.user.id, toUserId])
        const messages = await this.messageService.getMessageByChatId(chat.id, limit, page)
        return messages
    }

    async joinRoom(socket: UserSocket, link: string) {
        const room = await this.roomService.joinRoomByLink(socket.user.id, link)
        if(!room) return {error: 'Такой комнаты нет'}
        const user = room.users.find(user => user.id === socket.user.id)
        this.emitUsersRoom(room.id, room.users)
        const message = await this.messageService.create({type: {roomId: room.id}, text: `Пользователь ${user.username} вступил в комнату`, userId: '1'})
        socket.join(`${room.id}`)
        setTimeout(() => {
            this.emitInfoMessageToChatRoom(room.id, {...message, user: {...message.user, username: this.infoBot}, userCount: room.users.length})
        }, 0)
        return room
    }

    async leaveRoom(socket: UserSocket, roomId: number) {
        const room = await this.roomService.leaveRoom(socket.user.id, roomId)
        socket.leave(`${room.id}`)
        this.emitUsersRoom(room.id, room.users)
        const message = await this.messageService.create({type: {roomId: room.id}, text: `Пользователь ${socket.user.username} покинул комнату`, userId: '1'})
        setTimeout(() => {
            this.emitInfoMessageToChatRoom(room.id, {...message, user: {...message.user, username: this.infoBot}, userCount: room.users.length})
        }, 0)
        return {ok: true}
    }

    async createRoom(socket: UserSocket, name: string) {
        const room = await this.roomService.createRoom(socket.user.id, name)
        socket.join(`${room.id}`)
        this.emitUsersRoom(room.id, room.users)
        return room
    }

    //* helpers function
    private emitUsersRoom(roomId: number, users: UserEntity[]) {
        this.server.in(`${roomId}`).emit(USERS_ROOM, {users, roomId})
    }

    private emitInfoMessageToChatRoom<T extends MessageEntity>(roomId: number, message: T) {
        this.server.to(`${roomId}`).emit(RECEIVE_MESSAGES,  {message})
    }


    async handleConnection(socket: UserSocket){
        const user = await this.userService.setSocketId(socket.user.id, socket.id)
        user.rooms.forEach(room => socket.join(`${room.id}`))
        socket.emit('connected', {rooms: user.rooms, chats: user.chats})
        console.log(`Connected ${user.username}(${user.id})(${user.socket_id})`)
    }

    async handleDisconnect(socket: UserSocket){
        await this.userService.setSocketId(socket.user.id, null)
        console.log(`Disconnect ${socket.user.username}(${socket.user.id})(${socket.id})`)
    }

    async infoRoom(socket: UserSocket, roomId: number) {
        const check = await this.roomService.checkUserInRoom(socket.user.id, roomId)
        if(!check) return {error: 'Ошибка доступа'}
        const room = await this.roomService.getByRoomAndUserId(roomId, socket.user.id)
        if(!room) {
            return {}
        }
        return room
    }
    
}

