import { IoAdapter } from "@nestjs/platform-socket.io";
import { Socket } from 'socket.io';
import { NextFunction } from "express";
import { UserEntity } from '../user/user.entity';
import { WsException } from "@nestjs/websockets";
import { verify } from "jsonwebtoken";

type JwtUserPayload = Pick<UserEntity, 'id' | 'username'>

export interface UserSocket extends Socket {
    user: JwtUserPayload
}

export class AuthAdapter extends IoAdapter {
    createIOServer(port: number, options?) {
        const server = super.createIOServer(port, options)
        server.use((socket: UserSocket, next: NextFunction) => {
            try {
                const token = socket.handshake.auth.token
                if(!token) return next(new WsException('Unauthorized'))
                const user = verify(token, process.env.ACCESS_SECRET) as JwtUserPayload
                if(!user) return next(new WsException('Unauthorized'))
                socket.user = user
                next()
            }catch(e) {
                next(e)
            }
            
        })
        return server
    }
}