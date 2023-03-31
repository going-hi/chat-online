import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DISCORD_STRATEGY } from '../auth.constants';

export const DiscordGuard = () => UseGuards(AuthGuard(DISCORD_STRATEGY))