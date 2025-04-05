import { Processor, WorkerHost } from '@nestjs/bullmq'
import { CONVERT_IMAGE_QUEUE } from './constants'
import { Job } from 'bullmq'
import { IConvertImage } from './convert-image.type'
import * as sharp from 'sharp'
import { MinioService } from '../minio/minio.service'
import { FileService } from './file.service'
import { FileProcessStatus } from './entites/file.entity'

@Processor(CONVERT_IMAGE_QUEUE)
export class ConvertImageConsumer extends WorkerHost {
    constructor(
        private readonly minioService: MinioService,
        private readonly fileService: FileService
    ) {
        super()
    }

    async process(job: Job<IConvertImage>) {
        try {
            const { path, fileId } = job.data
            const fileBuffer = await this.minioService.getFile(path)
            const outputBuffer = await sharp(fileBuffer)
                .webp({ quality: 80 })
                .toBuffer()

            const newPath = crypto.randomUUID() + '.webp'
            await this.minioService.uploadFile(outputBuffer, newPath)
            await this.fileService.updateImage(fileId, {
                status: FileProcessStatus.DONE,
                path: newPath
            })
        } catch (error) {
            console.log(error)
        }
    }
}
