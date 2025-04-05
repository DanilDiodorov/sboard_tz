import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { File } from './file/entites/file.entity'
import { FileModule } from './file/file.module'
import { ImageProcessController } from './image-process.controller'
import { BullModule } from '@nestjs/bullmq'

@Module({
    imports: [
        BullModule.forRoot({
            connection: {
                host: 'localhost',
                port: 6379
            }
        }),
        ConfigModule.forRoot({ isGlobal: true }),
        FileModule,
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
                entities: [File],
                synchronize: true // Only in develepment
            })
        })
    ],
    controllers: [ImageProcessController]
})
export class ImageProcessModule {}
