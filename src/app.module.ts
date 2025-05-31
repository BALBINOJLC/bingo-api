import { Module } from '@nestjs/common';
import { UserModule } from '@users';
import { AuthModule } from '@auth';
import { BingoModule } from './v1/bingo';

@Module({
    imports: [UserModule, AuthModule, BingoModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
