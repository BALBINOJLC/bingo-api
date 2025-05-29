import { IUser } from '@users';

export interface ILoginResponse {
    access_token: string;
    user: IUser;
}

export interface IRegisterResponse {
    user: IUser;
}

export interface IResponseVerifyToken {
    access_token: string;
    user: IUser;
}

export interface IResponseMessage {
    message: string;
}
