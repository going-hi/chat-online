import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { UserEntity } from '../../user/user.entity';

export const User = createParamDecorator(
    (data: keyof Pick<UserEntity, 'id' | 'username'>, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest() as Request
        const user = request.user
        return data ? user[data] : user
    }
)