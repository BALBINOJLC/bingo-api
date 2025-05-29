/* eslint-disable @typescript-eslint/no-unused-vars */
import { CustomError, ParamsDto, excludePassword } from '@common';
import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma';
import { UserFilterDto, UserUpdateDto } from '../dtos';
import { IRespFindAllUsers, IUser, IUserUpdated } from '../interfaces';
import { queryFetchUsers } from '../queries/users.queriers';
import { AuthService } from '@auth';

@Injectable()
export class UserService {
    constructor(
        private prismaService: PrismaService,
        private authService: AuthService
    ) {}

    async findAll(filter: UserFilterDto, params: ParamsDto): Promise<IRespFindAllUsers> {
        try {
            const query = { ...filter, is_deleted: false };
            const { fields, limit, offset } = params;
            const length = await this.prismaService.user.count({ where: query });

            const data = await this.fetchUsers(query, fields, limit, offset);

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
                message: err.error.message ?? 'USER.ERRORS.FIND_ALL',
                module: this.constructor.name,
                innerError: err as Error,
            });
        }
    }

    async search(params: ParamsDto, regExp: RegExp): Promise<IRespFindAllUsers> {
        try {
            const { offset, limit } = params;
            const users = await this.prismaService.user.findMany({
                where: {
                    OR: [
                        {
                            email: {
                                contains: regExp.source,
                                mode: 'insensitive',
                            },
                        },
                        {
                            display_name: {
                                contains: regExp.source,
                                mode: 'insensitive',
                            },
                        },
                        {
                            user_name: {
                                contains: regExp.source,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
                include: queryFetchUsers,
                skip: offset,
                take: limit,
            });

            const totalUsersCount = await this.prismaService.user.count({
                where: {
                    OR: [
                        {
                            email: {
                                contains: regExp.source,
                                mode: 'insensitive',
                            },
                        },
                        {
                            display_name: {
                                contains: regExp.source,
                                mode: 'insensitive',
                            },
                        },
                        {
                            user_name: {
                                contains: regExp.source,
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
            });

            return {
                data: users.map(excludePassword),
                page: offset,
                per_page: limit,
                total_count: totalUsersCount,
            };
        } catch (err) {
            throw new CustomError({
                statusCode: err.error.status ?? HttpStatus.BAD_REQUEST,
                message: err.error.message ?? 'USER.ERRORS.SEARCH_ALL',
                module: this.constructor.name,
                innerError: err as Error,
            });
        }
    }

    async findOne(filter: UserFilterDto): Promise<IUser> {
        const query: any = {
            ...filter,
            is_deleted: false,
        };
        try {
            const user = await this.prismaService.user.findUnique({
                where: query,
                include: queryFetchUsers,
            });

            if (!user) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.NOT_FOUND',
                    module: this.constructor.name,
                });
            }

            return excludePassword(user);
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.status ?? HttpStatus.BAD_REQUEST,
                message: err.error.message ?? 'USER.ERRORS.FIND_ONE',
                module: this.constructor.name,
                innerError: err as Error,
            });
        }
    }

    async validate(filter: UserFilterDto): Promise<IUser> {
        const query: any = {
            ...filter,
            is_deleted: false,
        };

        try {
            const user = await this.prismaService.user.findUnique({
                where: query,
                include: {
                    Profiles: {
                        select: {
                            id: true,
                            role: true,
                            active: true,
                        },
                    },
                    Avatar: true,
                },
            });

            if (!user) {
                return null;
            }

            return user;
        } catch (err) {
            throw new CustomError({
                message: 'USER.ERRORS.FIND',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    async update(data: UserUpdateDto, id: string, profile: string): Promise<IUserUpdated> {
        try {
            let token = null;
            const dataUpdate = await this.prepareInput(data);
            const user = await this.prismaService.user.update({
                where: {
                    id: id,
                },
                include: {
                    Profiles: {
                        select: {
                            id: true,
                            role: true,
                            active: true,
                        },
                    },
                    Avatar: true,
                },
                data: dataUpdate,
            });

            if (profile) {
                token = await this.authService.validations.signJWT(user);
            }

            return {
                data: excludePassword(user),
                message: 'USER.SUCCESS.UPDATED',
                access_token: token,
            };
        } catch (err) {
            throw new CustomError({
                statusCode: err.error?.status ?? HttpStatus.BAD_REQUEST,
                message: err.error?.message ?? 'USER.ERRORS.UPDATE',
                module: this.constructor.name,
                innerError: err as Error,
            });
        }
    }

    async delete(id: string): Promise<IUserUpdated> {
        try {
            const user = await this.prismaService.user.update({
                where: {
                    id: id,
                },
                data: {
                    is_deleted: true,
                    deleted_at: new Date(),
                },
            });

            return excludePassword(user);
        } catch (err) {
            throw new CustomError({
                message: 'TASK.ERRORS.UPDATE',
                statusCode: HttpStatus.BAD_REQUEST,
                module: this.constructor.name,
                innerError: err,
            });
        }
    }

    private async prepareInput(input: UserUpdateDto): Promise<UserUpdateDto> {
        if (input.first_name || input.last_name) {
            input.display_name = `${input.first_name ?? ''} ${input.last_name ?? ''}`.trim();
        }

        if (input.dni) {
            input.dni = input.dni.replace(/[^\w\s]/gi, '');
        }

        return input;
    }

    private async fetchUsers(query: any, fields: string | undefined, limit: number, offset: number): Promise<IUser[]> {
        return limit === 0
            ? (this.prismaService.user.findMany({
                  where: query,
                  include: queryFetchUsers,
                  skip: offset,
              }) as unknown as Promise<IUser[]>)
            : (this.prismaService.user.findMany({
                  where: query,
                  include: queryFetchUsers,
                  skip: offset,
                  take: limit,
              }) as unknown as Promise<IUser[]>);
    }
}
