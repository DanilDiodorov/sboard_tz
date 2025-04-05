import {
    Controller,
    Post,
    Body,
    HttpCode,
    Res,
    Get,
    Req,
    UnauthorizedException,
    UseInterceptors
} from '@nestjs/common'
import { AuthDto } from '@app/common/types/auth'
import { AuthService } from './auth.service'
import { Request, Response } from 'express'
import { lastValueFrom } from 'rxjs'
import { CurrentUserId } from './decorators/user.decorator'
import { Auth } from './decorators/auth.decorator'
import { GrpcToHttpInterceptor } from 'nestjs-grpc-exceptions'

@UseInterceptors(GrpcToHttpInterceptor)
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @HttpCode(200)
    @Post('login')
    async login(
        @Body() authDto: AuthDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const { tokens, ...user } = await lastValueFrom(
            this.authService.login(authDto)
        )
        this.authService.addRefreshTokenToResponse(res, tokens.refreshToken)

        delete tokens.refreshToken

        return {
            ...user,
            tokens
        }
    }

    @HttpCode(200)
    @Post('register')
    async register(
        @Body() authDto: AuthDto,
        @Res({ passthrough: true }) res: Response
    ) {
        const { tokens, ...user } = await lastValueFrom(
            this.authService.register(authDto)
        )

        this.authService.addRefreshTokenToResponse(res, tokens.refreshToken)

        delete tokens.refreshToken

        return {
            ...user,
            tokens
        }
    }

    @Auth()
    @HttpCode(200)
    @Get('get-new-tokens')
    async getNewTokens(
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ) {
        const refreshTokenFromCookies =
            req.cookies[this.authService.REFRESH_TOKEN_NAME]

        if (!refreshTokenFromCookies) {
            this.authService.removeRefreshTokenToResponse(res)
            throw new UnauthorizedException()
        }

        const { tokens, ...user } = await lastValueFrom(
            this.authService.getNewTokens({
                refreshToken: refreshTokenFromCookies
            })
        )

        this.authService.addRefreshTokenToResponse(res, tokens.refreshToken)

        delete tokens.refreshToken

        return {
            ...user,
            tokens
        }
    }

    @Auth()
    @HttpCode(200)
    @Get('profile')
    profile(@CurrentUserId() id: string) {
        return this.authService.profile({ id })
    }
}
