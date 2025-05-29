import { BlobServiceClient, ContainerClient, BlockBlobClient } from '@azure/storage-blob';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FileDto } from '../dtos';
import { envs } from 'src/config';
import { IFiles } from '../interface/files.interface';

@Injectable()
export class AzureBlobsService {
    private blobServiceClient: BlobServiceClient;
    private connectionString: string;
    private containerName: string;

    constructor() {
        this.connectionString = envs.azure.blobs.connectionString;
        this.containerName = envs.azure.blobs.containerName;
        this.blobServiceClient = BlobServiceClient.fromConnectionString(this.connectionString);
    }

    async listContainers(): Promise<string[]> {
        try {
            const containers: string[] = [];
            for await (const container of this.blobServiceClient.listContainers()) {
                containers.push(container.name);
            }
            return containers;
        } catch (err) {
            throw new HttpException('AZURE.BLOBS.ERRORS.LIST_CONTAINERS', HttpStatus.BAD_REQUEST);
        }
    }

    async listBlobsInContainer(containerName: string): Promise<string[]> {
        try {
            const blobs: string[] = [];
            const containerClient: ContainerClient = this.blobServiceClient.getContainerClient(containerName);
            for await (const blob of containerClient.listBlobsFlat()) {
                blobs.push(blob.name);
            }
            return blobs;
        } catch (err) {
            throw new HttpException('AZURE.BLOBS.ERRORS.LIST_BLOBS', HttpStatus.BAD_REQUEST);
        }
    }

    async upload(file: FileDto): Promise<{ file: IFiles }> {
        const hash = new Date().getTime();
        const fileName = `${hash}-${file.originalname}`;
        const params = {
            Container: this.containerName,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ContentLength: file.size,
        };

        try {
            const containerClient: ContainerClient = this.blobServiceClient.getContainerClient(params.Container);
            const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(params.Key);
            await blockBlobClient.upload(file.buffer, file.size);

            return this.createUploadResponse(blockBlobClient.url, fileName, file.mimetype, file.size, params.Container);
        } catch (err) {
            throw new HttpException('AZURE.BLOBS.ERRORS.UPLOAD_BLOB', HttpStatus.BAD_REQUEST);
        }
    }

    async deleteBlob(blobName: string): Promise<{ message: string }> {
        const params = {
            Container: this.containerName,
            Key: blobName,
        };

        try {
            const containerClient: ContainerClient = this.blobServiceClient.getContainerClient(params.Container);
            const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(params.Key);
            await blockBlobClient.delete();

            return { message: 'Blob deleted successfully' };
        } catch (err) {
            throw new HttpException('AZURE.BLOBS.ERRORS.DELETE_BLOB', HttpStatus.BAD_REQUEST);
        }
    }

    private createUploadResponse(
        url: string,
        fileName: string,
        mimeType: string,
        fileSize: number,
        containerName: string
    ): { file: IFiles } {
        return {
            file: {
                url,
                key: fileName,
                size: fileSize,
                mimetype: mimeType,
                extension: mimeType.split('/')[1],
                type: mimeType.split('/')[0],
                name: fileName,
                bucket: containerName,
                isPublic: true,
            },
        };
    }
}
