import { Logger } from '@nestjs/common';
import { IErrordata } from '../../dtos';

export class CustomError extends Error {
    statusCode: number;
    module: string;
    err: Error | null;
    private logger: Logger;

    constructor({ message, statusCode, module, innerError }: IErrordata) {
        super(message);
        this.statusCode = statusCode;
        this.module = module;
        this.err = innerError || null;

        // Mantener el stack trace del error original si existe
        if (innerError?.stack) {
            this.stack = innerError.stack;
        }
        console.log(innerError);

        this.logger = new Logger(module);
        this.logError(message, innerError);
    }

    private logError(message: string, innerError?: Error): void {
        // Uso del método logError para encapsular la lógica de registro de errores
        this.logger.error(message, innerError?.stack);
    }
}
