import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { EUserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: EUserRole[]): CustomDecorator<string> => SetMetadata(ROLES_KEY, roles);
