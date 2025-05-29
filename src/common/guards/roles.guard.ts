import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EUserRole } from '@prisma/client';
import { IRequestWithUser } from '../interfaces';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const roles = this.reflector.get<EUserRole[]>('roles', context.getHandler());
        if (!roles) {
            return true; // Si no hay roles definidos, permitir acceso
        }

        const request = context.switchToHttp().getRequest<IRequestWithUser>();
        const user = request.user; // Asegúrate de que el objeto `user` está siendo añadido por tu estrategia de autenticación

        if (!user) {
            throw new UnauthorizedException('USER.ERRORS.USER.NOT_FOUND');
        }

        // Verificar si al menos un perfil del usuario tiene uno de los roles permitidos
        const hasRole = user.Profiles.some((profile) => roles.includes(profile.role) && profile.active && !profile.is_deleted);

        if (!hasRole) {
            throw new UnauthorizedException('AUTH.ERRORS.USER.NOT_AUTHORIZED');
        }

        return true;
    }
}
