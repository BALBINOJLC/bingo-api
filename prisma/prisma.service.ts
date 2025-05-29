// prisma.service.ts
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { envs } from 'src/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger('PrismaService');

    async onModuleInit(): Promise<void> {
        await this.$connect();
        console.log('db_url:', envs.node.port);

        this.logger.log('DB connected');
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
    }
}
