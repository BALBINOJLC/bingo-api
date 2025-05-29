import { Module } from '@nestjs/common';
import { BaseService } from './services';
import { PrismaModule } from '@prisma';
import { BaseController } from './controllers';
import { AuthModule } from '@auth';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [BaseController],
    providers: [BaseService],
})
export class BaseModule {}
