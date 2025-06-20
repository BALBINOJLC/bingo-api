import { Module } from '@nestjs/common';
import { BingoService } from './services/bingo.service';
import { PrismaModule } from '@prisma';
import { BingoController } from './controllers/bingo.controller';
import { AuthModule } from '@auth';
import { InvoiceGeneratorCron } from './cron/valid.payment.cron';
import { BingoGateway } from './controllers/bingogateway';


@Module({
    imports: [PrismaModule, AuthModule],
    controllers: [BingoController],
    providers: [BingoService, InvoiceGeneratorCron, BingoGateway],
})
export class BingoModule {} 