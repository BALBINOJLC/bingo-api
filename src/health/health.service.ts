/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthDto } from './health.dto';

@Injectable()
export class HealthService {
    logger: Logger;

    constructor(private configService: ConfigService) {
        this.logger = new Logger('HealthCheck');
    }

    getHealthCheck(): HealthDto {
        this.logger.log('getHealthCheck in version %o', `${HealthService.name}:${this.getHealthCheck.name}`, process.version);

        return {
            nodeVersion: process.version,
            uptime: process.uptime(),
            environment: this.configService.get('NODE_ENV'),
            service: this.configService.get('npm_package_name'),
            appVersionPackage: this.configService.get('npm_package_version'),
            description: this.configService.get('npm_package_description'),
        };
    }

    getOk(): string {
        return 'Ok!';
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    getWhoami(user: any): string {
        this.logger.log({ user }, `${HealthService.name}:${this.getWhoami.name}`);
        return `Hi ${user.userName}`;
    }
}
