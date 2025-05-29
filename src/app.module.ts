import { Module } from '@nestjs/common';
import { UserModule } from '@users';
import { AuthModule } from '@auth';

@Module({
    imports: [UserModule, AuthModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
