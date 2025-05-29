import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { HealthDto } from './health.dto';

@ApiTags('Health')
@Controller({
    version: '1',
    path: 'health',
})
export class HealthController {
    constructor(private healthService: HealthService) {}

    @ApiOperation({
        summary: 'Ok',
        description: 'Help endpoint to know if the service is operational',
    })
    @Get()
    getOk(): string {
        return this.healthService.getOk();
    }

    @ApiOperation({
        summary: 'Health',
        description: 'Endpoint displaying information about the microservice',
    })
    @Get('/description')
    getHealthCheck(): HealthDto {
        return this.healthService.getHealthCheck();
    }
}
