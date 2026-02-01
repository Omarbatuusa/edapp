import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyDocument } from './policy-document.entity';
import { PolicyVersion } from './policy-version.entity';
import { UserPolicyAcceptance } from './user-policy-acceptance.entity';
import { PoliciesService } from './policies.service';
import { PoliciesController } from './policies.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            PolicyDocument,
            PolicyVersion,
            UserPolicyAcceptance
        ])
    ],
    providers: [PoliciesService],
    controllers: [PoliciesController],
    exports: [PoliciesService]
})
export class PoliciesModule { }
