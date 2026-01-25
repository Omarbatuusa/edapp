import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './tenant.entity';

@Injectable()
export class TenantsService implements OnModuleInit {
    constructor(
        @InjectRepository(Tenant)
        private tenantsRepository: Repository<Tenant>,
    ) { }

    async onModuleInit() {
        // Seed test tenant if not exists
        const count = await this.tenantsRepository.count();
        if (count === 0) {
            console.log('Seeding initial tenant...');
            await this.tenantsRepository.save({
                name: 'Lakewood International Academy',
                slug: 'lia',
                hosts: ['lia.edapp.co.za', 'localhost'], // localhost for testing
                schoolCode: 'LIA',
                config: {
                    brandColor: '#F4B400',
                    logoUrl: 'https://via.placeholder.com/150',
                },
            });
        }
    }

    async findByHost(host: string): Promise<Tenant | null> {
        // Naive array contains check (Postgres doesn't perform well with simple-array for large datasets, but fine for multi-tenant config)
        // Actually, we load all and filter or use LIKE?
        // simple-array stores as comma separated string.
        // Better to just store hosts in a separate table, but for now strict requirement "simple"
        // Let's iterate or use query builder. 
        // Using simple-array means string matching.

        // For exact match in "hosts" array stored as string: 
        // It is "host1,host2". 
        // We can fetch by slug if we know it, but here we only have host.

        // Let's just find one where hosts LIKE %host%
        const tenants = await this.tenantsRepository.find();
        return tenants.find(t => t.hosts.includes(host)) || null;
    }

    async findBySlug(slug: string): Promise<Tenant | null> {
        return this.tenantsRepository.findOneBy({ slug });
    }
}
