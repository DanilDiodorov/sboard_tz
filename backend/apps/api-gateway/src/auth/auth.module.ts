import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { AUTH_SERVICE } from './constants'
import { AUTH_PACKAGE_NAME } from '@app/common'
import { join } from 'path'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { ConfigModule } from '@nestjs/config'

@Module({
    imports: [
        ClientsModule.register([
            {
                name: AUTH_SERVICE,
                transport: Transport.GRPC,
                options: {
                    package: AUTH_PACKAGE_NAME,
                    protoPath: join(__dirname, '../auth.proto')
                }
            }
        ]),
        ConfigModule
    ],
    controllers: [AuthController],
    providers: [AuthService]
})
export class AuthModule {}
