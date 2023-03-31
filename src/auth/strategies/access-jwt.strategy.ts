import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt'
import { ACCESS_JWT_STRATEGY, ACCESS_SECRET } from '../auth.constants';
import { UserEntity } from '../../user/user.entity';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy, ACCESS_JWT_STRATEGY) {
    constructor(
        private readonly configService: ConfigService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get(ACCESS_SECRET)
        })
    }

    async validate({id, username}: Pick<UserEntity, 'id' | 'username'>) {
        return {id, username}
    }
}