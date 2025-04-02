import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersModule } from './users/users.module'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { User } from './users/entities/user.entity'
import { JwtModule } from '@nestjs/jwt'
import { AuthController } from './auth.controller'
import { getJwtConfig } from './config/jwt.config'

@Module({
    imports: [
        ConfigModule.forRoot(),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getJwtConfig
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: 'localhost',
                port: 5454,
                username: configService.get<string>('POSTGRES_USER'),
                password: configService.get<string>('POSTGRES_PASSWORD'),
                database: configService.get<string>('POSTGRES_DB'),
                entities: [User],
                synchronize: true // Only in develepment
            })
        }),
        UsersModule
    ],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
