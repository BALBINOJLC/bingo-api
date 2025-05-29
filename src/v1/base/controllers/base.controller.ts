import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseCreateDto, BaseFilterDto, BaseUpdateDto } from '../dtos';
import { Response } from 'express';
import { BaseService } from '../services';
import { IRequestWithUser, JwtAuthGuard, ParamsDto, RequestHandlerUtil } from '@common';

@ApiTags('Bases')
@Controller({
    version: '1',
    path: 'bases',
})
export class BaseController {
    constructor(private readonly service: BaseService) {}

    @Post('create')
    @UseGuards(JwtAuthGuard)
    async create(@Body() body: BaseCreateDto, @Res() res: Response, @Req() req: IRequestWithUser): Promise<Response | void> {
        return RequestHandlerUtil.handleRequest({
            action: () => this.service.create(body),
            res,
            module: this.constructor.name,
            actionDescription: 'Create Base',
            userName: req.user.user_name,
        });
    }

    @Get('gets/:limit/:offset/:sort?')
    @UseGuards(JwtAuthGuard)
    async findAll(
        @Param() params: ParamsDto,
        @Query() query: BaseFilterDto,
        @Res() res: Response,
        @Req() req: IRequestWithUser
    ): Promise<Response | void> {
        const { user } = req;

        return RequestHandlerUtil.handleRequest({
            action: () => this.service.findAll(query, params),
            res: res,
            userName: user.user_name,
            actionDescription: 'Get All Bases',
            module: this.constructor.name,
        });
    }

    @Get('search/:limit/:offset/:regexp')
    @UseGuards(JwtAuthGuard)
    async search(
        @Param() params: ParamsDto,
        @Param('regexp') regexp: string,
        @Query() query: BaseFilterDto,
        @Req() req: IRequestWithUser,
        @Res() res: Response
    ): Promise<Response | void> {
        const { user } = req;
        const regExp = new RegExp(regexp, 'i');
        return RequestHandlerUtil.handleRequest({
            action: () => this.service.search(params, regExp),
            res: res,
            userName: user.user_name,
            module: this.constructor.name,
            actionDescription: 'Search Base',
        });
    }

    @Get(':fields?')
    @UseGuards(JwtAuthGuard)
    async findOne(@Query() query: BaseFilterDto, @Res() res: Response, @Req() req: IRequestWithUser): Promise<Response | void> {
        return RequestHandlerUtil.handleRequest({
            action: () => this.service.findOne(query),
            res: res,
            module: this.constructor.name,
            actionDescription: 'Get Base',
            userName: req.user.user_name,
        });
    }

    @Patch(':id/:profile?')
    @UseGuards(JwtAuthGuard)
    async update(
        @Body() body: BaseUpdateDto,
        @Param('id') id: string,
        @Param('profile') profile: string,
        @Res() res: Response,
        @Req() req: IRequestWithUser
    ): Promise<Response | void> {
        const { user } = req;
        return RequestHandlerUtil.handleRequest({
            action: () => this.service.update(body, id, profile),
            res: res,
            module: this.constructor.name,
            userName: user.user_name,
            actionDescription: 'Update Base',
        });
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: string, @Res() res: Response, @Req() req: IRequestWithUser): Promise<Response | void> {
        return RequestHandlerUtil.handleRequest({
            action: () => this.service.delete(id),
            res: res,
            module: this.constructor.name,
            actionDescription: 'Delete Base',
            userName: req.user.user_name,
        });
    }
}
