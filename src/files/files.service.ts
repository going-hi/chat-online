import { Injectable } from '@nestjs/common';
import {resolve} from 'path';
import {randomUUID} from 'crypto'
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {

    async saveFiles(file: Buffer, type: string) {
        const pathStatic = resolve(__dirname, '..', '../static/audio')
        if(!existsSync(pathStatic)) {
            await mkdir(pathStatic, { recursive: true });
        }
        const fileName = `${randomUUID()}.${type}`
        await writeFile(`${pathStatic}/${fileName}`, file)
        return fileName    
    }
}
