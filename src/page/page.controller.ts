import { Controller, Get, Param, Render, Res } from "@nestjs/common";
import { UserService } from "../user/user.service";

@Controller('/')
export class PageController {

    constructor(private userService: UserService) {}

    @Get('chat')
    @Render('chat')
    chats() {

    }

    @Get()
    @Render('main')
    main() {}

    @Get(':id')
    async about(@Param('id') id: string, @Res() res) {
        const user = await this.userService.getById(id)
        if(!user) return res.render('notfound')
        
        res.render('about', user)
    }

   

}