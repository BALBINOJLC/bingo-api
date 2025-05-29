/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatus, Injectable, Request } from '@nestjs/common';
import * as argon2 from 'argon2';
import { RegisterUserDto } from '../dtos';
import { JwtService } from '@nestjs/jwt';
import { envs } from 'src/config';
import { PrismaService } from '@prisma';
import { ILoginResponse, IRegisterResponse, IResponseVerifyToken } from '../interfaces';
import { IUser } from '@users';
import { CustomError, IRequestWithUser, excludePassword, userNameAndCharter } from '@common';
import { EmailService } from '@email';
import { ValidationsAuthService } from './validations.auth.service';
import { PasswordAuhService } from './password.auth.service';
import { EUserRole } from '@prisma/client';
import { queryFetchUser } from 'src/v1/users/queries';

@Injectable()
export class AuthService {
    validations = new ValidationsAuthService(this.jwtService, this.prismaS);
    password = new PasswordAuhService(this.prismaS, this._emailService, this.jwtService);

    constructor(
        private readonly jwtService: JwtService,
        private prismaS: PrismaService,
        private _emailService: EmailService
    ) {}

    async verifyToken(token: string): Promise<IResponseVerifyToken> {
        try {
            const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
                secret: envs.jwt.jxt_key,
            });

            return {
                user: user,
                access_token: await this.validations.signJWT(user),
            };
        } catch (error) {
            throw new CustomError({
                statusCode: HttpStatus.UNAUTHORIZED,
                message: 'AUTH.ERRORS.VERIFY_TOKEN',
                module: this.constructor.name,
            });
        }
    }

    async registerUser(registerUserDto: RegisterUserDto): Promise<IRegisterResponse> {
        const { email, first_name, password, last_name } = registerUserDto;
        const dni = registerUserDto.dni.replace(/[^\w\s]/gi, '');
        try {
            const user = await this.prismaS.user.findFirst({
                where: {
                    OR: [{ dni: dni }, { email: email }],
                },
            });
          

            if (user) {
                throw new CustomError({
                    statusCode: HttpStatus.CONFLICT,
                    message: 'AUTH.ERRORS.ALREADY_EXISTS',
                    module: this.constructor.name,
                });
            }

            const hashedPassword = await argon2.hash(password);

            const newUser: any = (await this.prismaS.$transaction(async (prisma) => {
                const newFile = await prisma.file.create({
                    data: userNameAndCharter(email).Avatar,
                });
                const createdUser = await prisma.user.create({
                    data: {
                        email: email.toLowerCase().trim(),
                        password: hashedPassword,
                        display_name: `${first_name} ${last_name}`,
                        user_name: userNameAndCharter(email).user_name,
                        first_name,
                        last_name,
                        dni: registerUserDto.dni.replace(/[^\w\s]/gi, ''),
                        Profiles: {
                            create: {
                                role: registerUserDto.role ?? EUserRole.CLIENT,
                                active: true,
                            },
                        },
                        Avatar: {
                            create: {
                                file_id: newFile.id,
                            },
                        },
                    },
                });

                return createdUser;
            })) as IUser;

            const token = await this.validations.signJWT(newUser);
            await this._emailService.sendVerificationEmail(token, newUser);

            const { password: _, ...userResponse } = newUser;
            return { user: userResponse };
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.status ?? HttpStatus.BAD_REQUEST,
                message: err.message ?? 'USER.ERRORS.REGISTER',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async loginUser(@Request() req: IRequestWithUser): Promise<ILoginResponse> {
        const authorization = await this.getAuthorization(req);
        const email = authorization[0];
        const password = authorization[1];

        try {
            const user: any = await this.prismaS.user.findUnique({
                where: { email },
                include: queryFetchUser
            });

            if (!user) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }

            if (!user.email_verify) {
                throw new CustomError({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'AUTH.ERRORS.SIGN_IN.EMAIL_NOT_VERIFIED',
                    module: this.constructor.name,
                });
            }

            await this.validations.validatePassword({
                hashPassword: user.password,
                password,
            });
            const rest = excludePassword(user);

            return {
                user: rest,
                access_token: await this.validations.signJWT(rest),
            };
        } catch (error) {
            throw new CustomError({
                statusCode: HttpStatus.BAD_REQUEST,
                message: error.message,
                module: this.constructor.name,
                innerError: error.error,
            });
        }
    }

    async activateAccount(token: string) {
        try {
            const { email } = this.jwtService.verify(token);
            const user = (await this.prismaS.user.findUnique({
                where: { email },
            })) as IUser;
            if (user) {
                await this.prismaS.user.update({
                    where: { email },
                    data: {
                        email_verify: true,
                        is_active: true,
                    },
                });
                // refresh token
                const token = await this.validations.signJWT(user);

                const resp = {
                    message: 'AUTH.ACCOUNT_ACTIVATED',
                    email: user.email,
                    token: token,
                };

                return resp;
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
                message: err.message ?? 'AUTH.ERRORS.ACTIVATE_ACCOUNT',
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    private async getAuthorization(@Request() req: IRequestWithUser): Promise<string[]> {
        const base64 = (req.headers.authorization || '').split(' ')[1] || '';
        const buff = Buffer.from(base64, 'base64');
        const string = buff.toString('ascii').split(':');
        return string;
    }
}
