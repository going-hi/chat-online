import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../utils/base.entity';
import { UserEntity } from '../user/user.entity';
import { RoomEntity } from '../room/room.entity';
import { ChatEntity } from '../chat/chat.entity';

@Entity('message')
export class MessageEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: true})
    text: string

    @Column({nullable: true})
    filename: string

    @ManyToOne(() => UserEntity, (user) => user.messages)
    user: UserEntity

    @ManyToOne(() => RoomEntity, (room) => room.messages, {nullable: true, onDelete: 'CASCADE'})
    room: RoomEntity

    @ManyToOne(() => ChatEntity, (chat) => chat.messages, {nullable: true})
    chat: ChatEntity
}