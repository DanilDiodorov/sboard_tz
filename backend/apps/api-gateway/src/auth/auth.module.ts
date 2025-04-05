import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { AUTH_SERVICE } from './constants'
import { AUTH_PACKAGE_NAME } from '@app/common/types/auth'
import { join } from 'path'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtStrategy } from './jwt.strategy'
import { JwtModule } from '@nestjs/jwt'
import { getJwtConfig } from '../config/jwt.config'
import { APP_FILTER } from '@nestjs/core'
import { GrpcServerExceptionFilter } from 'nestjs-grpc-exceptions'

@Module({
    imports: [
        ClientsModule.register([
            {
                name: AUTH_SERVICE,
                transport: Transport.GRPC,
                options: {
                    url: 'localhost:3001',
                    package: AUTH_PACKAGE_NAME,
                    protoPath: join(__dirname, '../auth.proto')
                }
            }
        ]),
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getJwtConfig
        })
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        {
            provide: APP_FILTER,
            useClass: GrpcServerExceptionFilter
        }
    ]
})
export class AuthModule {}
