import { Controller, Post, Body, HttpCode, Res } from '@nestjs/common'
import { AuthDto } from '@app/common'
import { AuthService } from './auth.service'
import { Response } from 'express'
import { lastValueFrom } from 'rxjs'

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
}
