import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export const typeOrmOptions = (configService: ConfigService): TypeOrmModuleOptions => {
    return {
        url: configService.get('DB_URL'),
        autoLoadEntities: true,
        type: 'postgres',
        synchronize: true
    }
}