import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { TPolicyHandler } from '../interfaces';

export const CHECK_POLICIES_KEY = 'check_policy';
export const CheckPolicies = (...handlers: TPolicyHandler[]): CustomDecorator<string> => SetMetadata(CHECK_POLICIES_KEY, handlers);
