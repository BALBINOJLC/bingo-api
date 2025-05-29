import { IUserProfile } from '@users';

export interface IJwtPayload {
    id: string;
    email: string;
    display_name: string;
    user_name: string;
    Profiles: IUserProfile[];
}
