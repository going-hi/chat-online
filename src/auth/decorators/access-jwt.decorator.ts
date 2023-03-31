import { UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ACCESS_JWT_STRATEGY } from '../auth.constants';

export const AccessJwtGuard = () => UseGuards(AuthGuard(ACCESS_JWT_STRATEGY))