import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { ImageProcessModule } from './image-process/image-process.module'

@Module({
    imports: [ConfigModule.forRoot(), AuthModule, ImageProcessModule],
    controllers: []
})
export class AppModule {}
