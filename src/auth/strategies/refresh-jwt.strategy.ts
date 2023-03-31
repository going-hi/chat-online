import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { REFRESH_JWT_STRATEGY, REFRESH_SECRET } from '../auth.constants';
import { UserEntity } from 'src/user/user.entity';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, REFRESH_JWT_STRATEGY) {
    constructor(
        private readonly configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get(REFRESH_SECRET),
            jwtFromRequest: RefreshJwtStrategy.ExtractFromCookie
        })
    }

    async validate({id, username}: Pick<UserEntity, 'id' | 'username'>){
        return {id, username}
    }

    private static ExtractFromCookie(req: Request) {
        const refreshToken = req.cookies['refreshToken']
        if(!refreshToken) return
        return refreshToken
    }
}