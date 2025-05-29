import { Body, Controller, Delete, Get, Param, Patch, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { UserFilterDto, UserUpdateDto } from '../dtos';
import { Response } from 'express';
import { UserService } from '../services';
import { IRequestWithUser, JwtAuthGuard, ParamsDto, RequestHandlerUtil } from '@common';

@ApiTags('Users')
@Controller({
    version: '1',
    path: 'users',
})
export class UserController {
    constructor(private readonly _userService: UserService) {}

    @Get(':limit/:offset/:sort')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Get All Users',
        description: 'Get a list of Users',
    })
    async findAll(
        @Param() params: ParamsDto,
        @Query() query: UserFilterDto,
        @Res() res: Response,
        @Req() req: IRequestWithUser
    ): Promise<Response | void> {
        const { user } = req;

        return RequestHandlerUtil.handleRequest({
            action: () => this._userService.findAll(query, params),
            res: res,
            userName: user.user_name,
            actionDescription: 'Get All Users',
            module: this.constructor.name,
        });
    }

    @Get('/search/:limit/:offset/:sort/:regexp')
    @ApiOperation({
        summary: 'Search Users',
        description: 'Search for users based on regex patterns',
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async search(
        @Param() params: ParamsDto,
        @Param('regexp') regexp: string,
        @Query() query: UserFilterDto,
        @Req() req: IRequestWithUser,
        @Res() res: Response
    ): Promise<Response | void> {
        const { user } = req;
        const regExp = new RegExp(regexp, 'i');
        return RequestHandlerUtil.handleRequest({
            action: () => this._userService.search(params, regExp),
            res: res,
            userName: user.user_name,
            module: this.constructor.name,
        });
    }

    @Get(':fields?')
    @ApiParam({
        name: 'fields',
        required: true,
        type: String,
        description: 'Fields to return',
        example: 'name,lastname,age,address',
    })
    @ApiOperation({
        summary: 'Get Single User',
        description: 'Get a single User by id',
    })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async findOne(@Query() query: UserFilterDto, @Res() res: Response): Promise<Response | void> {
        return RequestHandlerUtil.handleRequest({
            action: () => this._userService.findOne(query),
            res: res,
            module: this.constructor.name,
        });
    }

    @Patch(':id/:profile?')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Update User',
        description: 'Update a User',
    })
    async update(
        @Body() body: UserUpdateDto,
        @Param('id') id: string,
        @Param('profile') profile: string,
        @Res() res: Response,
        @Req() req: IRequestWithUser
    ): Promise<Response | void> {
        const { user } = req;
        return RequestHandlerUtil.handleRequest({
            action: () => this._userService.update(body, id, profile),
            res: res,
            module: this.constructor.name,
            userName: user.user_name,
        });
    }

    @Delete(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Delete User',
        description: 'Delete a User',
    })
    async delete(@Param('id') id: string, @Res() res: Response): Promise<Response | void> {
        return RequestHandlerUtil.handleRequest({
            action: () => this._userService.delete(id),
            res: res,
            module: this.constructor.name,
        });
    }
}
