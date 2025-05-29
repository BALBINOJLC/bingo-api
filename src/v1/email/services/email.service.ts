import { HttpStatus, Injectable } from '@nestjs/common';
import { envs } from 'src/config/envs';
import { IResponseEmail, ISenderSendgrid, ISendgridTemplates } from '../interfaces';
import { IUser } from '@users';
import * as SibApiV3Sdk from 'sib-api-v3-typescript';
import { CustomError } from '@common';

@Injectable()
export class EmailService {
    templates: ISendgridTemplates;

    public CLIENT_URI: string;

    public URI_BACK: string;

    public sender: ISenderSendgrid;

    private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

    adminEmails: string[];

    constructor() {
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        this.apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, envs.brevo.api_key);

        this.templates = {
            BV_TP_VERIFY_ACCOUNT: Number(envs.brevo.templates.auth.verify_account),
            BV_TP_RESET_PASSWORD: Number(envs.brevo.templates.auth.reset_password),
        };
        this.CLIENT_URI = envs.node.client_uri;
        this.URI_BACK = envs.node.api_uri;
        this.sender = {
            senderEmail: 'hola@gux.tech',
            senderName: 'GUXTech',
        };

        this.adminEmails = ['msanz@sicrux.tech'];
    }

    async addNewsLetter(email: string): Promise<unknown> {
        const sendEmailToZappier = new SibApiV3Sdk.SendSmtpEmail();
        sendEmailToZappier.subject = 'Nuevo Usuario No Invitado';
        sendEmailToZappier.htmlContent = `email: ${email}`;
        sendEmailToZappier.sender = { name: this.sender.senderName, email: this.sender.senderEmail };
        sendEmailToZappier.to = [{ email: 'ktnnv7c2@robot.zapier.com' }];

        try {
            const sendEmail = (await this.apiInstance.sendTransacEmail(sendEmailToZappier)) as IResponseEmail;
            return sendEmail;
        } catch (err) {
            throw new CustomError({
                message: 'EMAIL.ERRORS.SEND.NEWS_LETTER',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async sendVerificationEmail(token: string, user: IUser): Promise<IResponseEmail> {
        const link = `${this.URI_BACK}/auth/activateaccount/${token}`;

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.to = [{ email: user.email }];
        sendSmtpEmail.templateId = this.templates.BV_TP_VERIFY_ACCOUNT;
        sendSmtpEmail.params = {
            userName: user.user_name,
            link,
        };

        try {
            const sendEmail = (await this.apiInstance.sendTransacEmail(sendSmtpEmail)) as IResponseEmail;

            return sendEmail;
        } catch (err) {
            throw new CustomError({
                message: 'EMAIL.ERRORS.SEND.VERIFY_ACCOUNT',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async forgotPassword(token: string, user: IUser): Promise<unknown> {
        const link = `${this.CLIENT_URI}/auth/reset-password/${token}`;

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.to = [{ email: user.email }];
        sendSmtpEmail.templateId = this.templates.BV_TP_RESET_PASSWORD;
        sendSmtpEmail.sender = { name: this.sender.senderName, email: this.sender.senderEmail };
        sendSmtpEmail.params = {
            userName: user.user_name,
            link,
        };

        try {
            const sendEmail = (await this.apiInstance.sendTransacEmail(sendSmtpEmail)) as IResponseEmail;

            return sendEmail;
        } catch (err) {
            throw new CustomError({
                message: 'EMAIL.ERRORS.SEND.RESET_PASSWORD',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async newMessage(message: string, name: string, email: string): Promise<unknown> {
        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = 'Nuevo Mensaje desde la Web';
        sendSmtpEmail.htmlContent = `<p>Nombre: ${name}</p><p>Email: ${email}</p><p>Mensaje: ${message}</p>`;
        sendSmtpEmail.sender = { name: this.sender.senderName, email: this.sender.senderEmail };
        sendSmtpEmail.to = [{ email: this.adminEmails[0] }];

        try {
            const sendEmail = (await this.apiInstance.sendTransacEmail(sendSmtpEmail)) as IResponseEmail;

            return sendEmail;
        } catch (err) {
            throw new CustomError({
                message: 'EMAIL.ERRORS.SEND.NEW_MESSAGE',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: err,
            });
        }
    }
}
