import { Module } from '@nestjs/common';
import { UserModule } from '@users';
import { AuthModule } from '@auth';
import { BingoModule } from './v1/bingo';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [UserModule, AuthModule, BingoModule, ScheduleModule.forRoot()],
    controllers: [],
    providers: [],
})
export class AppModule {}
