import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from 'class-validator';

class PasswordDto {
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    currentPassword: string;

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword()
    newPassword: string;
}

export class LoginUserDto extends PasswordDto {
    @IsString()
    @IsEmail()
    email: string;
}

export class PasswordForgotDto {
    @IsEmail()
    email: string;
}

export class ResetPasswordDto extends PasswordDto {}

import { EUserRole } from '@prisma/client';

export class RegisterUserDto extends PasswordDto {
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsBoolean()
    is_active?: boolean;

    @IsOptional()
    @IsBoolean()
    email_verify?: boolean;

    @IsString()
    dni: string;

    @IsEnum(EUserRole)
    @IsOptional()
    role: EUserRole;
}

export class RegisterMasiveDto {
    @IsString()
    @IsNotEmpty()
    first_name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsString()
    @IsEmail(
        {},
        {
            message: 'AUTH.SIGN_IN.ERROR.EMAIL_INVALID',
        }
    )
    @IsNotEmpty()
    email: string;

    @IsEnum(EUserRole)
    @IsOptional()
    role: EUserRole;
}
