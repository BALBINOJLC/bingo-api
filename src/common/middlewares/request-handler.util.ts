/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import { CustomError } from '../helpers';

interface IHandleRequestParams {
    action: () => Promise<any>;
    res: Response;
    module: string;
    statusCode?: number;
    actionDescription?: string;
    userName?: string;
    responseModifier?: (res: Response, result: any) => void;
    redirectUrl?: string;
}

@Injectable()
export class RequestHandlerUtil {
    static async handleRequest({
        action,
        res,
        statusCode = 500,
        actionDescription = 'Unnamed action',
        userName = 'Unknown',
        module = 'RequestHandlerUtil',
        responseModifier,
        redirectUrl,
    }: IHandleRequestParams): Promise<Response<any> | void> {
        this.logActionStart(actionDescription, userName, module);

        try {
            const result = await action();
            this.logActionSuccess(actionDescription, userName, module);

            if (redirectUrl) {
                return res.redirect(redirectUrl);
            }

            return responseModifier ? this.modifyResponse(res, result, responseModifier) : res.json(result);
        } catch (error) {
            return this.handleError(res, error, statusCode, actionDescription, userName, module);
        }
    }

    private static logActionStart(actionDescription: string, userName: string, module: string): void {
        const logger = new Logger(module);
        logger.log(`Starting action: ${actionDescription}, by user: ${userName}`);
    }

    private static logActionSuccess(actionDescription: string, userName: string, module: string): void {
        const logger = new Logger(module);
        logger.log(`Completed action: ${actionDescription} successfully by user: ${userName}`);
    }

    private static modifyResponse(res: Response, result: any, modifier: (res: Response, result: any) => void): Response {
        modifier(res, result);
        return res;
    }

    private static handleError(
        res: Response,
        error: unknown,
        statusCode: number,
        actionDescription: string,
        userName: string,
        module: string
    ): Response {
        const logger = new Logger(module);
        logger.error(`Error during action: ${actionDescription} by user: ${userName}`, error);

        if (error instanceof HttpException) {
            return res.status(error.getStatus()).json({ message: error.getResponse() });
        } else if (error instanceof CustomError) {
            return res.status(error.statusCode).json({ message: error.message, details: error.err?.message });
        } else if (error instanceof Error) {
            return res.status(statusCode).json({ message: error.message });
        } else {
            return res.status(statusCode).json({ message: 'API_ERRORS_UNEXPECTED' });
        }
    }
}
