import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentTranslation } from './content-translation.entity';
import { TranslationService } from './translation.service';
import { TranslationController } from './translation.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ContentTranslation])],
    controllers: [TranslationController],
    providers: [TranslationService],
    exports: [TranslationService],
})
export class TranslationModule { }
