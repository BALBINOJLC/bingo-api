/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from 'nestjs-pino';
import { HealthService } from '../../src/health/health.service';

describe('HealthService', () => {
    let healthService: HealthService;
    let configService: ConfigService;

    beforeEach(async () => {
        const healthModule: TestingModule = await Test.createTestingModule({
            imports: [LoggerModule.forRoot({ pinoHttp: { level: 'silent' } })],
            controllers: [],
            providers: [HealthService, ConfigService],
        }).compile();

        healthService = healthModule.get<HealthService>(HealthService);
        configService = healthModule.get<ConfigService>(ConfigService);
    });

    it('should be defined', () => {
        expect(healthService).toBeDefined();
        expect(configService).toBeDefined();
    });

    describe('function getOk', () => {
        it('should return "Ok!"', () => {
            expect(healthService.getOk()).toBe('Ok!');
        });
    });

    describe('function getHealthCheck', () => {
        it('should return health', () => {
            jest.spyOn(configService, 'get').mockImplementation(() => 'test');
            expect(healthService.getHealthCheck().environment).toBe('test');
        });
    });
});
