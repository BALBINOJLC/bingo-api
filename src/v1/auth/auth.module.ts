import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './controllers';
import { LocalStrategy } from './local.strategy';
import { EmailsModule } from '@email';
import { PrismaModule } from '@prisma';
import { envs } from 'src/config';

@Module({
    imports: [
        PrismaModule,
        JwtModule.register({
            global: true,
            secret: envs.jwt.jxt_key,
            signOptions: { expiresIn: '2h' },
        }),
        EmailsModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
