import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { AUTH_SERVICE } from './constants'
import { ClientGrpc } from '@nestjs/microservices'
import {
    AUTH_SERVICE_NAME,
    AuthDto,
    AuthServiceClient,
    GetNewTokensRequest,
    ProfileReguest
} from '@app/common'
import { ConfigService } from '@nestjs/config'
import { Response } from 'express'

@Injectable()
export class AuthService implements OnModuleInit {
    EXPIRE_DAY_REFRESH_TOKEN = 1
    REFRESH_TOKEN_NAME = 'refreshToken'
    private authService: AuthServiceClient

    constructor(
        @Inject(AUTH_SERVICE) private client: ClientGrpc,
        private readonly configService: ConfigService
    ) {}

    onModuleInit() {
        this.authService =
            this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME)
    }

    login(dto: AuthDto) {
        return this.authService.login(dto)
    }

    register(dto: AuthDto) {
        return this.authService.register(dto)
    }

    profile(dto: ProfileReguest) {
        return this.authService.profile(dto)
    }

    getNewTokens(dto: GetNewTokensRequest) {
        return this.authService.getNewTokens(dto)
    }

    addRefreshTokenToResponse(res: Response, refreshToken: string) {
        const expiresIn = new Date()

        expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN)

        res.cookie(this.REFRESH_TOKEN_NAME, refreshToken, {
            httpOnly: this.configService.get('HTTP_ONLY') === 'true',
            domain: this.configService.get('DOMAIN'),
            expires: expiresIn,
            secure: this.configService.get('SECURE') === 'true',
            //lax in prodaction
            sameSite: this.configService.get('SAME_SITE')
        })
    }

    removeRefreshTokenToResponse(res: Response) {
        res.cookie(this.REFRESH_TOKEN_NAME, '', {
            httpOnly: this.configService.get('HTTP_ONLY') === 'true',
            domain: this.configService.get('DOMAIN'),
            expires: new Date(0),
            secure: this.configService.get('SECURE') === 'true',
            //lax in prodaction
            sameSite: this.configService.get('SAME_SITE')
        })
    }
}
