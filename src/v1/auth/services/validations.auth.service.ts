import { HttpStatus, Injectable } from '@nestjs/common';
import { IJwtPayload } from '../interfaces';
import { JwtService } from '@nestjs/jwt';
import { CustomError } from '@helpers';
import * as argon2 from 'argon2';
import { PrismaService } from '@prisma';
import { IUser } from '@users';

@Injectable()
export class ValidationsAuthService {
    constructor(
        private readonly jwtService: JwtService,
        private prismaS: PrismaService
    ) {}
    async signJWT(payload: IJwtPayload): Promise<string> {
        return this.jwtService.sign(payload);
    }

    async validateUser(email: string, password: string): Promise<IUser> {
        try {
            const user: any = await this.prismaS.user.findUnique({
                where: { email },
            });
            if (!user) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            } else if (!user.email_verify) {
                throw new CustomError({
                    statusCode: HttpStatus.FORBIDDEN,
                    message: 'AUTH.ERRORS.SIGNIN.EMAIL_NOT_VERIFIED',
                    module: this.constructor.name,
                });
            } else if (!user.is_active) {
                throw new CustomError({
                    statusCode: HttpStatus.FORBIDDEN,
                    message: 'AUTH.ERRORS.SIGNIN.ACCOUNT_NOT_ACTIVATED',
                    module: this.constructor.name,
                });
            }
            await this.validatePassword({
                hashPassword: user.password,
                password,
            });

            return user;
        } catch (error) {
            throw new CustomError({
                statusCode: error?.error?.statusCode ?? HttpStatus.BAD_REQUEST,
                message: error.message ?? 'AUTH.ERRORS.VALIDATING_USER',
                module: this.constructor.name,
                innerError: error?.error ?? error,
            });
        }
    }

    async validatePassword({ password, hashPassword }: { password: string; hashPassword: string }): Promise<boolean> {
        const isPasswordValid = await argon2.verify(hashPassword, password);

        if (!isPasswordValid) {
            throw new CustomError({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'AUTH.ERRORS.SIGNIN.INVALID_PASSWORD_OR_EMAIL',
                module: this.constructor.name,
            });
        }
        return isPasswordValid;
    }
}
