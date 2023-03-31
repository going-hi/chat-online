import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '../utils/base.entity';
import { RoomEntity } from '../room/room.entity';
import { ChatEntity } from '../chat/chat.entity';
import { MessageEntity } from '../message/message.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
    @PrimaryColumn()
    id: string

    @Column()
    username: string

    @Column({nullable: true})
    socket_id: string
    

    @Column({nullable: true})
    avatar: string

    @Column({nullable: true})
    refreshToken: string

    @OneToMany(() => RoomEntity, (room) => room.owner)
    ownerRooms: RoomEntity[]

    @ManyToMany(() => RoomEntity, (room) => room.users)
    rooms: RoomEntity[]

    @ManyToMany(() => ChatEntity, (chat) => chat.users)
    privateChat: ChatEntity[]

    @OneToMany(() => MessageEntity, (msg) => msg.user)
    messages: MessageEntity[]
}