import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { REFRESH_JWT_STRATEGY } from '../auth.constants';

export const RefreshJwtGuard = () => UseGuards(AuthGuard(REFRESH_JWT_STRATEGY))