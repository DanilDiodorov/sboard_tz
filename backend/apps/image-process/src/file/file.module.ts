import { Module } from '@nestjs/common'
import { FileService } from './file.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { File } from './entites/file.entity'
import { MinioModule } from '../minio/minio.module'
import { BullModule } from '@nestjs/bullmq'
import { CONVERT_IMAGE_QUEUE } from './constants'
import { ConvertImageConsumer } from './convert-image.consumer'

@Module({
    imports: [
        TypeOrmModule.forFeature([File]),
        MinioModule,
        BullModule.registerQueue({
            name: CONVERT_IMAGE_QUEUE
        })
    ],
    providers: [FileService, ConvertImageConsumer],
    exports: [FileService]
})
export class FileModule {}
