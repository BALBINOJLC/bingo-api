import { Module } from '@nestjs/common';
import { AzureBlobsService } from './services';
import { AzureBlobsController } from './controllers';

@Module({
    imports: [],
    providers: [AzureBlobsService],
    controllers: [AzureBlobsController],
    exports: [AzureBlobsService],
})
export class AzureBlobsModule {}
