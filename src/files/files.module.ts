import { FilesService } from './files.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [],
  controllers: [],
  providers: [FilesService],
  exports: [FilesService]
})
export class FilesModule {}
