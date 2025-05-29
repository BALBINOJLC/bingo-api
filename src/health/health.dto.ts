import { ApiProperty } from '@nestjs/swagger';

export class HealthDto {
    @ApiProperty()
    nodeVersion: string;

    @ApiProperty()
    uptime: number;

    @ApiProperty()
    environment: string;

    @ApiProperty()
    service: string;

    @ApiProperty()
    appVersionPackage: string;

    @ApiProperty()
    description: string;
}
