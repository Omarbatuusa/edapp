import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Brand, BrandStatus } from './brand.entity';

@Injectable()
export class BrandsService {
    constructor(
        @InjectRepository(Brand)
        private readonly brandRepo: Repository<Brand>,
    ) { }

    async findAll(): Promise<Brand[]> {
        return this.brandRepo.find();
    }

    async findByCode(code: string): Promise<Brand | null> {
        return this.brandRepo.findOne({ where: { brand_code: code } });
    }

    async create(data: Partial<Brand>): Promise<Brand> {
        const brand = this.brandRepo.create(data);
        return this.brandRepo.save(brand);
    }
}
