/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Ability, InferSubjects, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { EAction } from './action.enum';

// type Subjects = InferSubjects<typeof User | typeof Tag | typeof Item> | 'all';

type TSubjects = InferSubjects<any> | 'all';

export type TAppAbility = Ability<[EAction, TSubjects]>;

interface IUserCast {
    [key: string]: any;
}

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: IUserCast): Ability<any> {
        const { can, cannot, build, rules } = new AbilityBuilder<Ability<[EAction, TSubjects]>>(Ability as AbilityClass<TAppAbility>);

        if (user.role === 'ADMIN') {
            can(EAction.MANAGE, 'all');
        } else {
            can(EAction.READ, 'all');
            // can(EAction.CREATE, Item);
            //   can(EAction.CREATE, Business);

            //   can(EAction.UPDATE, Item, { userId: user.id });

            //   can(EAction.UPDATE, Business, { userId: user.id });
            //   can(EAction.DELETE, Business, { userId: user.id });

            //   can(EAction.UPDATE, User);

            //   cannot(EAction.READ, User);
            //   cannot(EAction.READ, Business);
            //
        }

        return new Ability(rules);
    }
}
