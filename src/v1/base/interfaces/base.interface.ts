import { ResponseList } from '@common';
import { Base } from '@prisma/client';

export interface IBaseUpdated {
    data: IBase;
    message: string;
    access_token?: string;
}

export interface IBase extends Base {
    name: string;
    description: string;
}

export interface IRespFindAllBases extends ResponseList {
    data: IBase[];
}

export interface IResponseDeleted {
    message: string;
}
