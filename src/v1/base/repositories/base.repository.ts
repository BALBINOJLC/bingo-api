import { IRespFindAllBases, IBase, IBaseUpdated, IResponseDeleted } from '../interfaces';
import { BaseFilterDto, BaseUpdateDto } from '../dtos';
import { ParamsDto } from '@common';

export abstract class IBaseRepository {
    abstract findAll(filter: BaseFilterDto, params: ParamsDto, Base: IBase): Promise<IRespFindAllBases>;
    abstract findOne(filter: BaseFilterDto, fields?: string): Promise<IBase>;
    abstract update(data: BaseUpdateDto, id: string): Promise<IBaseUpdated>;
    abstract delete(id: string): Promise<IResponseDeleted>;
}
