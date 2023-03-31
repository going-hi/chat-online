import { Injectable } from '@nestjs/common';
import { PassportStrategy} from '@nestjs/passport';
import {Profile, Strategy} from 'passport-discord'
import { ConfigService } from '@nestjs/config';
import { DISCORD_STRATEGY } from '../auth.constants';
import { AuthService } from '../auth.service';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, DISCORD_STRATEGY) {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService
    ) {
        super({
            clientID: configService.get('DISCORD_CLIENT_ID'),
            clientSecret: configService.get('DISCORD_CLIENT_SECRET'),
            scope: DiscordStrategy.Scopes()
        })
    }

    async validate(_accessToken, _refreshToken, profile: Profile, cb) {
        const userData = await this.authService.createOrFind(profile)
        return userData
    }

    static Scopes() {
        return ['identify', 'email']
    }
}