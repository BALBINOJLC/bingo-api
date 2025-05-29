import { Controller, Delete, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AzureBlobsService } from '../services';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileDto } from '../dtos';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { IRequestWithUser, JwtAuthGuard, RequestHandlerUtil } from '@common';

@ApiTags('Azure Blobs')
@Controller({
    path: 'files',
    version: '1',
})
export class AzureBlobsController {
    constructor(private _azureBlobsService: AzureBlobsService) {}

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async upload(@UploadedFile() file: FileDto, @Res() res: Response, @Req() req: IRequestWithUser): Promise<Response | void> {
        return RequestHandlerUtil.handleRequest({
            action: () => this._azureBlobsService.upload(file),
            res,
            module: this.constructor.name,
            actionDescription: 'Upload Blob',
            userName: req.user.user_name,
        });
    }

    @Get('azure-blob-containers')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async getAll(@Res() res: Response, @Req() req: IRequestWithUser): Promise<Response | void> {
        return RequestHandlerUtil.handleRequest({
            action: () => this._azureBlobsService.listContainers(),
            res,
            module: this.constructor.name,
            actionDescription: 'Get All Containers',
            userName: req.user.user_name,
        });
    }

    @Delete('delete/:key')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async delete(@Res() res: Response, @Param('key') key: string, @Req() req: IRequestWithUser): Promise<Response | void> {
        return RequestHandlerUtil.handleRequest({
            action: () => this._azureBlobsService.deleteBlob(key),
            res,
            module: this.constructor.name,
            actionDescription: 'Delete Blob',
            userName: req.user.user_name,
        });
    }
}
