/* eslint-disable @typescript-eslint/no-unused-vars */
import { CustomError, ParamsDto, excludePassword } from '@common';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { BaseCreateDto, BaseFilterDto, BaseUpdateDto } from '../dtos';
import { IRespFindAllBases, IBase, IBaseUpdated } from '../interfaces';
import { envs } from 'src/config';

@Injectable()
export class BaseService {
    environment = envs.node.env;
    constructor(private prisma: PrismaService) {}

    async create(input: BaseCreateDto): Promise<IBase> {
        try {
            const base = await this.prisma.base.create({
                data: {
                    ...input,
                },
            });
            return base;
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.status ?? HttpStatus.BAD_REQUEST,
                message: err.error?.message ?? 'BASE.ERRORS.CREATE',
                module: this.constructor.name,
                innerError: err as Error,
            });
        }
    }

    async findAll(filter: BaseFilterDto, params: ParamsDto): Promise<IRespFindAllBases> {
        try {
            const query = { ...filter, is_deleted: false };
            const { fields, limit, offset } = params;
            const length = await this.prisma.base.count({ where: query });

            const data = await this.fetchBases(query, fields, limit, offset);

            const perPage = length === 0 || limit === 0 ? length : limit;
            const realLimit = limit === 0 ? length : limit;

            return {
                data: data.map(excludePassword),
                page: perPage,
                per_page: realLimit,
                total_count: length,
            };
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.status ?? HttpStatus.BAD_REQUEST,
                message: err.error?.message ?? 'Base.ERRORS.FIND_ALL',
                module: this.constructor.name,
                innerError: err as Error,
            });
        }
    }

    async search(params: ParamsDto, regExp: RegExp): Promise<IRespFindAllBases> {
        try {
            const { offset, limit } = params;
            const Bases = await this.prisma.base.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: regExp.source,
                                mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                                contains: regExp.source,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
                // include: queryFetchBases,
                skip: offset,
                take: limit,
            });

            const totalBasesCount = await this.prisma.base.count({
                where: {
                    OR: [
                        {
                            name: {
                                contains: regExp.source,
                                mode: 'insensitive',
                            },
                        },
                        {
                            description: {
                                contains: regExp.source,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            });

            return {
                data: Bases.map(excludePassword),
                page: offset,
                per_page: limit,
                total_count: totalBasesCount,
            };
        } catch (err) {
            throw new CustomError({
                statusCode: err.error.status ?? HttpStatus.BAD_REQUEST,
                message: err.error?.message ?? 'Base.ERRORS.SEARCH_ALL',
                module: this.constructor.name,
                innerError: err as Error,
            });
        }
    }

    async findOne(filter: BaseFilterDto): Promise<IBase> {
        const query: any = {
            ...filter,
            is_deleted: false,
        };
        try {
            const Base = await this.prisma.base.findFirst({
                where: query,
                // include: queryFetchBases,
            });

            if (!Base) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'Base.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }

            return excludePassword(Base);
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.status ?? HttpStatus.BAD_REQUEST,
                message: err.error?.message ?? 'Base.ERRORS.FIND_ONE',
                module: this.constructor.name,
                innerError: err as Error,
            });
        }
    }

    async update(data: BaseUpdateDto, id: string, profile: string): Promise<IBaseUpdated> {
        try {
            const Base = await this.prisma.base.update({
                where: {
                    id: id,
                },
                data: data,
            });

            return {
                data: excludePassword(Base),
                message: 'Base.SUCCESS.UPDATED',
            };
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.status ?? HttpStatus.BAD_REQUEST,
                message: err.error?.message ?? 'Base.ERRORS.UPDATE',
                module: this.constructor.name,
                innerError: err as Error,
            });
        }
    }

    async delete(id: string): Promise<IBaseUpdated> {
        try {
            const Base = await this.prisma.base.update({
                where: {
                    id: id,
                },
                data: {
                    is_deleted: true,
                    deleted_at: new Date(),
                },
            });

            return excludePassword(Base);
        } catch (err) {
            throw new CustomError({
                message: 'TASK.ERRORS.UPDATE',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    private async fetchBases(query: any, fields: string | undefined, limit: number, offset: number): Promise<IBase[]> {
        return limit === 0
            ? (this.prisma.base.findMany({
                  where: query,
                  //   include: queryFetchBases,
                  skip: offset,
                  orderBy: {
                      created_at: 'desc',
                  },
              }) as unknown as Promise<IBase[]>)
            : (this.prisma.base.findMany({
                  where: query,
                  //   include: queryFetchBases,
                  skip: offset,
                  take: limit,
                  orderBy: {
                      created_at: 'desc',
                  },
              }) as unknown as Promise<IBase[]>);
    }
}
