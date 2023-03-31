import { Module } from "@nestjs/common";
import { UserModule } from "src/user/user.module";
import { PageController } from "./page.controller";

@Module({
    controllers: [PageController],
    imports: [UserModule]
})
export class PageModule {}