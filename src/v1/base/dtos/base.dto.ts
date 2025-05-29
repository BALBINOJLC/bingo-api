import { ParamsDto } from '@common';
import { Type } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class BaseCreateDto {
    @IsString()
    @IsOptional()
    name: string;

    @IsString()
    @IsOptional()
    description: string;
}

export class BaseUpdateDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    description?: string;
}

export class BaseFilterDto {
    @IsOptional()
    @IsString()
    readonly id?: string;

    name: string;
}

export class QueryGestsBaseDto {
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => BaseFilterDto)
    query?: BaseFilterDto;

    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ParamsDto)
    params: ParamsDto;
}
