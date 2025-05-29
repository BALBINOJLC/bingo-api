import { TAppAbility } from '@casl';

export interface IPolicyHandler {
    handle(ability: TAppAbility): boolean;
}

type TPolicyHandlerCallback = (ability: TAppAbility, can?, user?) => boolean;

export declare type TPolicyHandler = IPolicyHandler | TPolicyHandlerCallback;
