import { Controller, Get, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DiscordGuard } from './decorators/discord.decorator';
import { RefreshJwtGuard } from './decorators/refresh-jwt.decorator';
import { User } from './decorators/user.decorator';
import { Cookies } from './decorators/cookie.decorator';
import { Response } from 'express';

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService
    ){}

    @DiscordGuard()
    @Get('discord/login')
    discordLogin() {}

    @DiscordGuard()
    @Get('discord/callback')
    discordCallback(@User() user, @Res({passthrough: true}) res: Response) {
        res.cookie('refreshToken', user.refreshToken)
        res.redirect('/chat')
    }

    @RefreshJwtGuard()
    @Get('refresh')
    async refresh(
        @User('id') id: string,
        @Cookies('refreshToken') refreshToken: string,
        @Res({passthrough: true}) res: Response
        ) {
        const tokens = await this.authService.refresh(id, refreshToken)
        res.cookie('refreshToken', tokens.refreshToken, {httpOnly: true })
        return tokens
    }

    @Get('logout')
    async logout(
        @Cookies('refreshToken') refreshToken: string,
        @Res({passthrough: true}) res: Response
        ) {
        await this.authService.logout(refreshToken)
        res.clearCookie('refreshToken')
        return
    }
}
