import { FilesModule } from './files/files.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmOptions } from './configs/typeorm.options';
import { ChatModule } from './chat/chat.module';
import { ChatEventsModule } from './chat-events/chat-events.module';
import { MessageModule } from './message/message.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PageModule } from './page/page.module';

@Module({
  imports: [
    FilesModule,
    RoomModule,
    UserModule,
    AuthModule,
    ChatModule,
    ChatEventsModule,
    MessageModule,
    PageModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: typeOrmOptions,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '/static'),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
