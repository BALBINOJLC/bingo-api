import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class ParamsDto {
    @IsNotEmpty()
    @Min(0)
    @ApiProperty({
        type: Number,
        required: false,
        description: 'Maximum quantity of items to return',
        example: 10,
    })
    limit?: number;

    @IsNotEmpty()
    @Min(0)
    @ApiProperty({
        type: Number,
        required: false,
        description: 'Offset of items',
        example: 20,
    })
    offset?: number;

    @IsOptional()
    @IsString()
    @ApiProperty({
        type: String,
        required: false,
        description: 'Fields to return',
        example: 'name,lastname,age,address',
    })
    fields?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        type: String,
        required: false,
        description: 'The items will be sorted by this field',
        example: '{"field":"name","order":1}',
    })
    sort?: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        type: String,
        required: false,
        description: 'The regexp to search',
        example: '.*',
    })
    regexp?: string;
}
