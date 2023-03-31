import { BaseEntity } from '../utils/base.entity';
import { Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { MessageEntity } from '../message/message.entity';

@Entity('chat')
export class ChatEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @ManyToMany(() => UserEntity, (user) => user.privateChat)
    @JoinTable()
    users: UserEntity[]

    @OneToMany(() => MessageEntity, (msg) => msg.chat)
    messages: MessageEntity[]
}