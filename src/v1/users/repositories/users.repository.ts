import { IRespFindAllUsers, IUser, IUserUpdated, IResponseDeleted } from '../interfaces';
import { UserFilterDto, UserUpdateDto } from '../dtos';
import { ParamsDto } from '@common';

export abstract class IUserRepository {
    abstract findAll(filter: UserFilterDto, params: ParamsDto, user: IUser): Promise<IRespFindAllUsers>;
    abstract findOne(filter: UserFilterDto, fields?: string): Promise<IUser>;
    abstract update(data: UserUpdateDto, id: string): Promise<IUserUpdated>;
    abstract delete(id: string): Promise<IResponseDeleted>;
}
