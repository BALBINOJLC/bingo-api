import { ResponseList } from '@common';
import { EUserRole, User } from '@prisma/client';

export interface IUserUpdated {
    data: IUser;
    message: string;
    access_token?: string;
}

export interface IUserInvited {
    data: IUser;
    message: string;
}

export interface IUser extends User {
    password: string;
    Profiles: IUserProfile[];
}

export interface IRespFindAllUsers extends ResponseList {
    data: IUser[];
}

export interface IResponseDeleted {
    message: string;
}

export interface IUserProfile {
    id: string;
    role: EUserRole;
    active: boolean;
    is_deleted?: boolean;
}
