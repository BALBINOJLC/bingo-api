import { Module } from '@nestjs/common';
import { BingoService } from './services/bingo.service';
import { PrismaModule } from '@prisma';
import { BingoController } from './controllers/bingo.controller';
import { AuthModule } from '@auth';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [PrismaModule, AuthModule, ScheduleModule.forRoot()],
    controllers: [BingoController],
    providers: [BingoService],
})
export class BingoModule {} 