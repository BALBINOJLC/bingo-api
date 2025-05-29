import { Body, Post, UseGuards, Request, Res, Query, Controller, Req, HttpStatus, Get } from '@nestjs/common';
import { AuthService } from '../services';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { envs } from 'src/config/envs';
import { Response } from 'express';
import { JwtAuthGuard, IRequestWithUser, RequestHandlerUtil, CustomError } from '@common';
import { PasswordForgotDto, RegisterUserDto, ResetPasswordDto } from '../dtos';

@ApiTags('AUTH')
@Controller({
    version: '1',
    path: 'auth',
})
export class AuthController {
    private CLIENT_URI: string;

    constructor(private _authService: AuthService) {
        this.CLIENT_URI = envs.node.client_uri;
    }

    @Post('signup')
    async signup(@Body() body: RegisterUserDto, @Res() res: Response): Promise<Response | void> {
        return RequestHandlerUtil.handleRequest({
            action: () => this._authService.registerUser(body),
            res,
            module: this.constructor.name,
        });
    }

    @Post('signin')
    async signin(@Request() req: IRequestWithUser, @Res() res: Response): Promise<Response | void> {
        return RequestHandlerUtil.handleRequest({
            action: () => this._authService.loginUser(req),
            res,
            module: this.constructor.name,
        });
    }

    @Post('reset-password')
    async passwordresetToken(
        @Body() body: ResetPasswordDto,
        @Query('token') token: string,

        @Res() res: Response
    ): Promise<Response | void> {
        const { password } = body;
        return RequestHandlerUtil.handleRequest({
            action: () => this._authService.password.resetPassword(token, password),
            res,
            module: this.constructor.name,
        });
    }

    @Post('change-password')
    @ApiBasicAuth()
    @UseGuards(JwtAuthGuard)
    async changePassword(
        @Request() req: IRequestWithUser,
        @Res() res: Response,
        @Body() body: { currentPassword: string; newPassword: string }
    ): Promise<Response | void> {
        return RequestHandlerUtil.handleRequest({
            action: () => this._authService.password.changePassword(req, body.currentPassword, body.newPassword),
            res,
            module: this.constructor.name,
            actionDescription: 'Change Password',
        });
    }

    @Post('password/set')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    async setNewPasswordAdmin(
        @Body() body: { email: string; password: string },
        @Res() res: Response,
        @Req() req: IRequestWithUser
    ): Promise<Response | void> {
        const { email, password } = body;
        try {
            const { user } = req;
            if (user.Profiles.findIndex((profile) => profile.role === 'OWNER') === -1) {
                throw new CustomError({
                    statusCode: HttpStatus.UNAUTHORIZED,
                    message: 'AUTH.UNAUTHORIZED',
                    module: this.constructor.name,
                });
            }
            const resp = await this._authService.password.setNewPasswordAdmin(email, password);
            return res.json(resp);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return res.status((error as any).code.status).json(error);
            } else {
                return res.status(500).json(error);
            }
        }
    }

    @Post('link/password')
    async passwordReset(@Body() body: PasswordForgotDto, @Res() res: Response): Promise<Response | void> {
        const { email } = body;
        return RequestHandlerUtil.handleRequest({
            action: () => this._authService.password.forgotPassword(email),
            res,
            module: this.constructor.name,
            actionDescription: 'Send Password Reset Link',
        });
    }

    @Get('activateaccount/:token')
    async activateAccount(@Req() req: IRequestWithUser, @Res() res: Response): Promise<any> {
        const { token } = req.params;
        return RequestHandlerUtil.handleRequest({
            action: () => this._authService.activateAccount(token),
            res,
            module: this.constructor.name,
            actionDescription: 'Activate Account',
            redirectUrl: `${this.CLIENT_URI}/auth/sign-in`,
        });
    }
}
