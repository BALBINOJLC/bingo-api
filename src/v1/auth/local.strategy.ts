import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './services';
import { IUser } from '@users';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super();
    }

    async validate(user_name: string, password: string): Promise<IUser> {
        const user = await this.authService.validations.validateUser(user_name, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
