import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CaslAbilityFactory, TAppAbility } from '@casl';
import { CHECK_POLICIES_KEY, TPolicyHandler } from '@common';

@Injectable()
export class PoliciesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private caslAbilityFactory: CaslAbilityFactory
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const policyHandlers = this.reflector.get<TPolicyHandler[]>(CHECK_POLICIES_KEY, context.getHandler()) || [];

        const { user } = context.switchToHttp().getRequest();
        const ability = this.caslAbilityFactory.createForUser(user);

        return policyHandlers.every((handler) => this.execPolicyHandler(handler, ability));
    }

    private execPolicyHandler(handler: TPolicyHandler, ability: TAppAbility): boolean {
        if (typeof handler === 'function') {
            return handler(ability);
        }
        return handler.handle(ability);
    }
}
