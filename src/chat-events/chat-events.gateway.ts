import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from "@nestjs/websockets";
import { ChatEventsService } from './chat-events.service';
import { Server } from 'socket.io';
import { JOIN_ROOM, PRIVATE_MESSAGES, ROOM_MESSAGES, LEAVE_ROOM, CREATE_ROOM, GET_MESSAGES_ROOM, GET_MESSAGES_CHAT, INFO_ROOM } from './chat-events.constants';
import { UserSocket } from "src/adapter/auth.adapter";

@WebSocketGateway({
    cors: {
        origin: '*'
    }
})
export class ChatEventsGateway {
    constructor(
        private readonly chatEventsService: ChatEventsService
    ) {}

    @SubscribeMessage(PRIVATE_MESSAGES)
    handlePrivateMessages(
        @ConnectedSocket() client: UserSocket,
        @MessageBody('userId') userId: string,
        @MessageBody('text') text: string,
        @MessageBody('audio') audio: Buffer
    ) {
       return this.chatEventsService.handlePrivateMessages(client, userId, text, audio)
    }

    @SubscribeMessage(ROOM_MESSAGES)
    handleMessagesRoom(
        @ConnectedSocket() client: UserSocket,
        @MessageBody('roomId') roomId: number,
        @MessageBody('text') text: string,
        @MessageBody('audio') audio: Buffer
    ) {
       return this.chatEventsService.handleMessagesRoom(client, roomId, text, audio)
    }

    @SubscribeMessage(JOIN_ROOM)
    handleJoinRoom(
        @ConnectedSocket() client: UserSocket,
        @MessageBody('link') link: string,
    ){
       return this.chatEventsService.joinRoom(client, link)
    }

    @SubscribeMessage(CREATE_ROOM)
    handleCreateRoom(
        @ConnectedSocket() client: UserSocket,
        @MessageBody('name') name: string
    ) {
        return this.chatEventsService.createRoom(client, name)
    }

    @SubscribeMessage(LEAVE_ROOM)
    handleLeaveRoom(
        @ConnectedSocket() client: UserSocket,
        @MessageBody('roomId') roomId: number
    ) {
       return this.chatEventsService.leaveRoom(client, roomId)
    }

    @SubscribeMessage(GET_MESSAGES_ROOM)
    getMessagesRoom(
        @ConnectedSocket() client: UserSocket,
        @MessageBody('roomId') roomId: number,
        @MessageBody('limit') limit: number,
        @MessageBody('page') page: number
    ) {
       return this.chatEventsService.getMessagesByRoomId(client, roomId, limit, page)
    }

    @SubscribeMessage(INFO_ROOM)
    getInfoRoom(
        @ConnectedSocket() client: UserSocket,
        @MessageBody('id') id: number,
        @MessageBody('type') type: string
    ) {
       return this.chatEventsService.infoRoom(client, id,)
    }

    @SubscribeMessage(GET_MESSAGES_CHAT)
    getMessagesChat(
        @ConnectedSocket() client: UserSocket,
        @MessageBody('userId') userId: string,
        @MessageBody('limit') limit: number,
        @MessageBody('page') page: number,
    ){
       return this.chatEventsService.getMessagesByUserId(client, userId, limit, page)
    }

    handleConnection(client: UserSocket) {
        this.chatEventsService.handleConnection(client)
    }

    handleDisconnect(client: UserSocket){
        this.chatEventsService.handleDisconnect(client)
    }

    afterInit(server: Server) {
        this.chatEventsService.server = server
    }
}