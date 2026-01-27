import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './brand.entity';
import { BrandsService } from './brands.service';

@Module({
    imports: [TypeOrmModule.forFeature([Brand])],
    providers: [BrandsService],
    exports: [BrandsService, TypeOrmModule],
})
export class BrandsModule { }
