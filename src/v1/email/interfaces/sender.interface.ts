import { IncomingMessage } from 'http';
import * as SibApiV3Sdk from 'sib-api-v3-typescript';

export interface ISenderSendgrid {
    senderEmail: string;
    senderName: string;
}

export interface IResponseEmail {
    response: IncomingMessage;
    body: SibApiV3Sdk.CreateSmtpEmail;
}
