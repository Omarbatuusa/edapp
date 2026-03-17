import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { SvgSanitizerService } from './svg-sanitizer.service';
import { FileObject } from './file-object.entity';
import { Tenant } from '../tenants/tenant.entity';

@Module({
    imports: [ConfigModule, TypeOrmModule.forFeature([FileObject, Tenant])],
    controllers: [StorageController],
    providers: [StorageService, SvgSanitizerService],
    exports: [StorageService, SvgSanitizerService],
})
export class StorageModule { }
