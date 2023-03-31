import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Profile } from 'passport-discord';
import { UserEntity } from '../user/user.entity';
import { ConfigService } from '@nestjs/config';
import { ACCESS_SECRET, REFRESH_SECRET } from './auth.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>
    ){}

    async createOrFind(profile: Profile) {
        let user = await this.userRepository.findOneBy({id: profile.id})
        const avatar = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
        if(!user) {
            user = this.userRepository.create({username: profile.username, id: profile.id, avatar})
        }
        const tokens = this.generateTokens(user)
        await this.userRepository.save({...user, refreshToken: tokens.refreshToken, avatar})
        return {
            ...tokens,
            user: {
                id: user.id,
                username: user.username
            }
        }
    }

    async refresh(userId: string, refreshToken: string) {
        const user = await this.userRepository.findOneBy({id: userId, refreshToken})
        if(!user) {
            throw  new UnauthorizedException()
        }
        const tokens = this.generateTokens(user)
        user.refreshToken = tokens.refreshToken
        await this.userRepository.save(user)
        return {
            ...tokens, 
            user: {
                id: user.id,
                username: user.username
            }
        }
    }

    async logout(refreshToken: string) {
        const user = await this.userRepository.findOneBy({refreshToken})
        if(!user) return
        await this.userRepository.save({...user, refreshToken: null})
    }

    private generateTokens(user: UserEntity) {
        const payload = {
            id: user.id,
            username: user.username
        }

        const accessToken = this.jwtService.sign(payload, {secret: this.configService.get(ACCESS_SECRET), expiresIn: '5h'})
        const refreshToken = this.jwtService.sign(payload, {secret: this.configService.get(REFRESH_SECRET), expiresIn: '30d'})

        return {
            accessToken, refreshToken
        }
    }

}
