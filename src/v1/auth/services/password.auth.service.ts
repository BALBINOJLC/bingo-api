import { HttpStatus, Injectable, Request } from '@nestjs/common';

import { EmailService } from '@email';
import { CustomError } from '@helpers';

import { PrismaService } from '@prisma';
import * as argon2 from 'argon2';
import { IResponseMessage } from '../interfaces';
import { IRequestWithUser } from '@common';
import { IUser } from '@users';
import { ValidationsAuthService } from './validations.auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PasswordAuhService {
    validations = new ValidationsAuthService(this.jwtService, this.prismaS);
    constructor(
        private prismaS: PrismaService,
        private _emailService: EmailService,
        private readonly jwtService: JwtService
    ) {}

    async setPasswordAdmin(email: string, password: string): Promise<{ message: string }> {
        try {
            const user = await this.prismaS.user.findUnique({
                where: {
                    email,
                },
            });
            if (user) {
                const newPassword = await argon2.hash(password.toString());
                user.password = newPassword;
                await this.prismaS.user.update({
                    where: {
                        email,
                    },
                    data: {
                        password: newPassword,
                    },
                });
                try {
                    const resp = {
                        message: 'AUTH.FORGOT_PASSWORD_SUCCESS',
                        data: user,
                    };
                    return resp;
                } catch (err) {
                    throw new CustomError({
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'AUTH.ERRORS.FORGOT_PASSWORD',
                        module: this.constructor.name,
                        innerError: err,
                    });
                }
            } else {
                throw new CustomError({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }
        } catch (error) {
            throw new CustomError({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                module: this.constructor.name,
                innerError: error.error,
            });
        }
    }

    async resetPassword(token: string, password: string): Promise<{ message: string }> {
        try {
            const { email } = this.jwtService.verify(token);
            const user: any = await this.prismaS.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }

            await this.validateSamePassword({
                password,
                hashPassword: user.password,
            });
            const newPassword = await argon2.hash(password);
            user.password = newPassword;
            await this.prismaS.user.update({
                where: { email },
                data: {
                    password: newPassword,
                },
            });
            const resp = {
                message: 'AUTH.PASSWORD_RESET_SUCCESS',
            };
            return resp;
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.statusCode ?? HttpStatus.BAD_REQUEST,
                message: err.message ?? 'AUTH.ERRORS.RESET_PASSWORD',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async changePassword(@Request() req: IRequestWithUser, currentPassword: string, newPassword: string): Promise<{ message: string }> {
        try {
            const email = req.user.email;

            const validateUser = await this.validations.validateUser(email, currentPassword);
            await this.validateSamePassword({
                password: newPassword,
                hashPassword: validateUser.password,
            });
            // Update password
            const newPasswordHash = await argon2.hash(newPassword);
            await this.prismaS.user.update({
                where: { email },
                data: {
                    password: newPasswordHash,
                },
            });

            return { message: 'AUTH.PASSWORD_CHANGED' };
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.statusCode ?? HttpStatus.BAD_REQUEST,
                message: err.message ?? 'AUTH.ERRORS.CHANGE_PASSWORD',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async forgotPassword(email: string): Promise<IResponseMessage> {
        try {
            const user = (await this.prismaS.user.findUnique({
                where: { email },
            })) as IUser;
            if (!user) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }

            const token = await this.validations.signJWT(user);
            await this._emailService.forgotPassword(token, user);

            const resp = {
                message: 'AUTH.FORGOT_PASSWORD_SUCCESS',
            };
            return resp;
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.statusCode ?? HttpStatus.BAD_REQUEST,
                message: err.message ?? 'AUTH.ERRORS.FORGOT_PASSWORD',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async setNewPasswordAdmin(email: string, password: string): Promise<{ message: string }> {
        try {
            const user: any = await this.prismaS.user.findUnique({
                where: { email },
            });
            if (user) {
                const newPassword = await argon2.hash(password.toString());
                user.password = newPassword;
                await user.save();
                try {
                    const resp = {
                        message: 'AUTH.FORGOT_PASSWORD_SUCCESS',
                        data: user,
                    };
                    return resp;
                } catch (err) {
                    throw new CustomError({
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'AUTH.ERRORS.FORGOT_PASSWORD',
                        module: this.constructor.name,
                        innerError: err,
                    });
                }
            } else {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.statusCode ?? HttpStatus.BAD_REQUEST,
                message: err.message ?? 'AUTH.ERRORS.SET_NEW_PASSWORD',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    private async validateSamePassword({ password, hashPassword }: { password: string; hashPassword: string }): Promise<boolean> {
        const passwordValidation = await argon2.verify(hashPassword, password);
        if (passwordValidation) {
            throw new CustomError({
                statusCode: HttpStatus.CONFLICT,
                message: 'AUTH.ERRORS.SIGNIN.PASSWORD_SAME_OLD',
                module: this.constructor.name,
            });
        } else {
            return passwordValidation;
        }
    }
}
