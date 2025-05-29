import { RegisterUserDto } from '@auth';
import { ParamsDto } from '@common';
import { PartialType } from '@nestjs/swagger';
import { EUserRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class ProfileDto {
    @IsEnum(EUserRole)
    role: EUserRole;

    @IsBoolean()
    active: boolean;
}

export class CreateProfileDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ValidateNested({ each: true })
    @Type(() => ProfileDto)
    profileData: ProfileDto;
}

export class UserUpdateDto extends PartialType(RegisterUserDto) {
    @IsString()
    @IsOptional()
    display_name?: string;

    @IsString()
    @IsOptional()
    dni?: string;

    @IsString()
    @IsOptional()
    phone_area?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsOptional()
    @IsBoolean()
    two_auth?: boolean;
}

export class RemoveProfileDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    profileId: string;
}

export class UserFilterDto {
    @IsOptional()
    @IsString()
    readonly id?: string;

    @IsOptional()
    @IsString()
    readonly email?: string;

    @IsOptional()
    @IsString()
    readonly user_name?: string;
}

export class QueryGestsUserDto {
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => UserFilterDto)
    query?: UserFilterDto;

    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ParamsDto)
    params: ParamsDto;
}
