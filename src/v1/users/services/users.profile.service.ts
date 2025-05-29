import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateProfileDto, ProfileDto, RemoveProfileDto } from '../dtos';
import { EUserRole, User, UserProfile } from '@prisma/client';
import { PrismaService } from '@prisma';
import { CustomError } from '@common';

@Injectable()
export class UserProfileService {
    constructor(private prismaService: PrismaService) {}
    async addProfileToUser(payload: CreateProfileDto): Promise<User> {
        try {
            // Validate User existe
            await this.validateNotOwnerProfile(payload.profileData.role);
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: payload.userId,
                },
            });

            if (!user) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.USER.NOT_FOUND',
                    module: this.constructor.name,
                });
            }
            // Check duplicate profile
            const duplicateProfile = await this.checkDuplicateProfile(payload.userId, payload.profileData.role);

            if (duplicateProfile) {
                throw new CustomError({
                    statusCode: HttpStatus.CONFLICT,
                    message: 'USER.ERRORS.PROFILE.DEFAULT_PROFILE_EXISTS',
                    module: this.constructor.name,
                });
            }

            // ValidateConditions for the profile
            await this.validateUserProfile(payload);

            // convert all Profiles to inactive
            await this.prismaService.userProfile.updateMany({
                where: {
                    user_id: payload.userId,
                },
                data: {
                    active: false,
                },
            });

            // Add Profile
            await this.prismaService.userProfile.create({
                data: {
                    user_id: payload.userId,
                    role: payload.profileData.role,
                    active: true,
                },
            });

            // return user updated
            return await this.prismaService.user.findUnique({
                where: {
                    id: payload.userId,
                },
                include: {
                    Profiles: {
                        select: {
                            id: true,
                            role: true,
                            active: true,
                        },
                    },
                },
            });
        } catch (err) {
            throw new CustomError({
                statusCode: err.error.statusCode ?? HttpStatus.BAD_REQUEST,
                message: err.error.message ?? 'USER.ERRORS.PROFILE.ADD_PROFILE',
                module: this.constructor.name,
                innerError: err as Error,
            });
        }
    }

    async changeProfileUser(newProfileId: string, userId: string): Promise<User> {
        try {
            //Run and deactivate all Profiles
            await this.setAllProfilesInactive(userId);

            // Activate the new profile
            await this.prismaService.userProfile.update({
                where: {
                    id: newProfileId,
                },
                data: {
                    active: true,
                },
            });
            // Return the user updated
            return await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                },
                include: {
                    Profiles: {
                        select: {
                            id: true,
                            role: true,
                            active: true,
                        },
                    },
                },
            });
        } catch (error) {
            throw new CustomError({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'USER.ERRORS.PROFILE.CHANGE_PROFILE',
                module: this.constructor.name,
                innerError: error as Error,
            });
        }
    }

    async updateProfileUser(profileId: string, data: ProfileDto): Promise<UserProfile> {
        await this.validateNotOwnerProfile(data.role);
        if (data.active) {
            const user = await this.getUserByProfileId(profileId);
            await this.setAllProfilesInactive(user.id);
        }
        return await this.prismaService.userProfile.update({
            where: {
                id: profileId,
            },
            data: {
                role: data.role,
            },
        });
    }

    async getUserByProfileId(profileId: string): Promise<User> {
        try {
            const user = await this.prismaService.user.findFirst({
                where: {
                    Profiles: {
                        some: {
                            id: profileId,
                        },
                    },
                },
                include: {
                    Profiles: {
                        select: {
                            id: true,
                            role: true,
                            active: true,
                        },
                    },
                },
            });
            if (!user) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.USER.NOT_FOUND',
                    module: this.constructor.name,
                });
            }
            return user;
        } catch (error) {
            throw new CustomError({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'USER.ERRORS.PROFILE.GET_USER_BY_PROFILE',
                module: this.constructor.name,
                innerError: error as Error,
            });
        }
    }

    async removeProfileFromUser(dataProfile: RemoveProfileDto): Promise<{ message: string }> {
        try {
            const profileExists = await this.checkProfileExists(dataProfile.profileId);

            if (!profileExists) {
                throw new CustomError({
                    statusCode: HttpStatus.NOT_FOUND,
                    message: 'USER.ERRORS.PROFILE.NOT_FOUND',
                    module: this.constructor.name,
                });
            }

            await this.prismaService.userProfile.delete({
                where: {
                    id: dataProfile.profileId,
                },
            });

            return {
                message: 'USER.PROFILE_DELETED',
            };
        } catch (err) {
            throw new CustomError({
                statusCode: err.error.statusCode ?? HttpStatus.BAD_REQUEST,
                message: err.error.message ?? 'USER.ERRORS.PROFILE.REMOVE_PROFILE',
                module: this.constructor.name,
                innerError: err as Error,
            });
        }
    }

    /************************* Private Functions  ******************************/
    private async checkDuplicateProfile(userId: string, role: EUserRole): Promise<UserProfile> {
        const profile = await this.prismaService.userProfile.findFirst({
            where: {
                user_id: userId,
                role,
            },
        });
        return profile;
    }

    private async checkProfileExists(profileId: string): Promise<boolean> {
        const profile = await this.prismaService.userProfile.findUnique({
            where: { id: profileId },
        });
        return profile !== null;
    }

    private async validateUserProfile(payload: CreateProfileDto): Promise<void> {
        try {
            const existingProfiles = await this.prismaService.userProfile.findMany({
                where: {
                    user_id: payload.userId,
                },
            });
            const existingRoles = existingProfiles.map((profile) => profile.role);
            if (this.isProfileConflict(existingRoles, payload.profileData.role)) {
                throw new Error('USER.ERRORS.VALIDATING_PROFILE');
            }
        } catch (err) {
            throw new CustomError({
                statusCode: err.error.statusCode ?? HttpStatus.BAD_REQUEST,
                message: err.error.message ?? 'USER.ERRORS.PROFILE.VALIDATING',
                module: this.constructor.name,
                innerError: err as Error,
            });
        }
    }
    private isProfileConflict(existingRoles: EUserRole[], newRole: EUserRole): boolean {
        if (newRole === EUserRole.OWNER) {
            // If the new role is OWNER, it cannot be added if there are other roles
            return true;
        }

        if (existingRoles.includes(EUserRole.OWNER) || existingRoles.includes(EUserRole.ADMIN) || existingRoles.includes(EUserRole.USER)) {
            return true;
        }

        // For all other cases, there is no role conflict
        return false;
    }
    private async validateNotOwnerProfile(role: EUserRole): Promise<void> {
        if (role === EUserRole.OWNER) {
            throw new CustomError({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'USER.ERRORS.PROFILE.OWNER_PROFILE',
                module: this.constructor.name,
            });
        }
    }

    private async setAllProfilesInactive(userId: string): Promise<void> {
        try {
            await this.prismaService.userProfile.updateMany({
                where: {
                    user_id: userId,
                },
                data: {
                    active: false,
                },
            });
        } catch (error) {
            throw new CustomError({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'USER.ERRORS.PROFILE.SET_ALL_PROFILES_INACTIVE',
                module: this.constructor.name,
                innerError: error as Error,
            });
        }
    }
}
