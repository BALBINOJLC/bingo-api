import { File } from '@prisma/client';
import { IUser } from '@users';
// import { IUser } from '@users';
import { Request } from 'express';

export interface IPhotoUrl extends Partial<File> {
    name: string;
    color: string;
    charter: string;
}

export interface IDataBaseUser {
    user_name: string;
    Avatar: any;
}

export interface IResponseList {
    page: number;
    per_page: number;
    total_count: number;
}

export interface IRequestWithUser extends Request {
    user: IUser;
    token: string;
}
