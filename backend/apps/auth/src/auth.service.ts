import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { hash, verify } from 'argon2'
import { UsersService } from './users/users.service'
import { AuthDto, AuthResponse } from '@app/common'
import {
    GrpcInvalidArgumentException,
    GrpcNotFoundException
} from 'nestjs-grpc-exceptions'

@Injectable()
export class AuthService {
    EXPIRE_DAY_REFRESH_TOKEN = 1
    REFRESH_TOKEN_NAME = 'refreshToken'

    constructor(
        private jwt: JwtService,
        private userService: UsersService
    ) {}

    async login(dto: AuthDto): Promise<AuthResponse> {
        const { password, ...user } = await this.validateUser(dto)
        const tokens = this.issueTokens(user.id)
        return {
            ...user,
            tokens
        }
    }

    async register(dto: AuthDto) {
        dto.password = await hash(dto.password)
        const { password, ...user } = await this.userService.create(dto)
        const tokens = this.issueTokens(user.id)
        return {
            ...user,
            tokens
        }
    }

    private issueTokens(userId: string) {
        const data = { id: userId }

        const accessToken = this.jwt.sign(data, { expiresIn: '1h' })

        const refreshToken = this.jwt.sign(data, {
            expiresIn: '7d'
        })

        return { accessToken, refreshToken }
    }

    private async validateUser(dto: AuthDto) {
        const user = await this.userService.findByEmail(dto.email)

        if (!user) throw new GrpcNotFoundException('Пользователь не найден')

        const isValid = await verify(user.password, dto.password)

        if (!isValid) throw new GrpcNotFoundException('Пользователь не найден')

        return user
    }

    async getNewTokens(refreshToken: string): Promise<AuthResponse> {
        try {
            const result = await this.jwt.verifyAsync(refreshToken)
            const { password, ...user } = await this.userService.findOne(
                result.id
            )

            const tokens = this.issueTokens(user.id)

            return {
                ...user,
                tokens
            }
        } catch (error) {
            throw new GrpcInvalidArgumentException('Ошибка авторизации')
        }
    }
}
