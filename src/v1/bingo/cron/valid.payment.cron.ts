import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { BingoService } from '../services/bingo.service';

/**
 * Cron job responsible for automatically generating invoices
 * and checking for overdue payments on a daily basis
 */
@Injectable()
export class InvoiceGeneratorCron {
    private readonly _logger = new Logger(InvoiceGeneratorCron.name);
    constructor(private readonly _bingoService: BingoService) {}

    /**
     * Executes invoice generation daily at midnight
     * This will generate new invoices for subscriptions with billing date today
     */
    @Cron(CronExpression.EVERY_5_MINUTES) //Temas de prueba
    async handleDailyInvoiceGeneration(): Promise<void> {
        this._logger.log('Starting daily invoice generation process...');

        try {
            await this._bingoService.validateTicketsPayments();
        } catch (error) {
            this._logger.error('Error in invoice generation process:', error);
        }
    }

    /**
     * Executes overdue check every day at noon
     * This provides a second check during the day for overdue payments
     */
    /* @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) */
    @Cron(CronExpression.EVERY_10_SECONDS) //Temas de prueba
    async handleOverdueCheck(): Promise<void> {
        this._logger.log('Starting midday overdue payment check...');

        try {
        } catch (error) {
            this._logger.error('Error in overdue payment check:', error);
        }
    }

    @Cron(CronExpression.EVERY_5_SECONDS) //Temas de prueba
    async handleCreateGameBingo(): Promise<void> {
        this._logger.log('Starting midday overdue payment check...');

        try {
            await this._bingoService.gameInProgress();
        } catch (error) {
            this._logger.error('Error in overdue payment check:', error);
        }
    }
}
