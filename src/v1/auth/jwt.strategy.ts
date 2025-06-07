import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { IUser } from '../users';
import { envs } from 'src/config/envs';
import { PrismaService } from '@prisma';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prismaService: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: envs.jwt.jxt_key,
        });
    }

    async validate(payload: IUser): Promise<IUser> {
        if (payload.email) {
            const user = await this.prismaService.user.findUnique({
                where: { email: payload.email },
            });

            if (!user) {
                throw new UnauthorizedException();
            }

            SetMetadata('user', user);
        }

        return payload;
    }
}
