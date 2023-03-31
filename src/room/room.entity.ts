import { BaseEntity } from '../utils/base.entity';
import { Column, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Entity, Generated, OneToMany } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { MessageEntity } from '../message/message.entity';

@Entity('room')
export class RoomEntity extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    @Generated('uuid')
    link: string

    @ManyToOne(() => UserEntity, (user) => user.ownerRooms)
    owner: UserEntity

    @ManyToMany(() => UserEntity, (user) => user.rooms)
    @JoinTable()
    users: UserEntity[]

    @OneToMany(() => MessageEntity, (msg) => msg.room, {cascade: true})
    messages: MessageEntity[]
}