import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { SvgSanitizerService } from './svg-sanitizer.service';
import { ImageProcessingService } from './image-processing.service';
import { FileObject } from './file-object.entity';

@Module({
    imports: [ConfigModule, TypeOrmModule.forFeature([FileObject])],
    controllers: [StorageController],
    providers: [StorageService, SvgSanitizerService, ImageProcessingService],
    exports: [StorageService, SvgSanitizerService, ImageProcessingService],
})
export class StorageModule { }
