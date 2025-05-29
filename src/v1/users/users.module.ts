import { Module } from '@nestjs/common';
import { UserService } from './services';
import { PrismaModule } from '@prisma';
import { UserController } from './controllers';
import { AuthModule } from '@auth';

@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [UserController],
    providers: [UserService],
})
export class UserModule {}
