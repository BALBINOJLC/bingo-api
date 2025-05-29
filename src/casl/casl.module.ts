import { Module } from '@nestjs/common';
import { CaslAbilityFactory } from './caslAbility.factory';

@Module({
    providers: [CaslAbilityFactory],
    exports: [CaslAbilityFactory],
})
export class CaslModule {}
