import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { File, FileProcessStatus } from './entites/file.entity'
import { MinioService } from '../minio/minio.service'
import sharp from 'sharp'
import { CreateFileDto } from './dto/create-file.dto'
import { UpdateFileDto } from './dto/update-file.dto'
import { GrpcNotFoundException } from 'nestjs-grpc-exceptions'
import { Queue } from 'bullmq'
import { CONVERT_IMAGE_QUEUE } from './constants'
import { InjectQueue } from '@nestjs/bullmq'
import { IConvertImage } from './convert-image.type'

@Injectable()
export class FileService {
    constructor(
        @InjectRepository(File)
        private readonly fileRepository: Repository<File>,
        private readonly minioService: MinioService,
        @InjectQueue(CONVERT_IMAGE_QUEUE)
        private readonly fileProcessQueue: Queue
    ) {}

    async saveImage(data: {
        buffer: Buffer<ArrayBufferLike>
        originalName: string
        userId: string
    }) {
        const path = crypto.randomUUID() + data.originalName

        await this.minioService.uploadFile(data.buffer, path)

        const file = await this.createImage({
            ...data,
            status: FileProcessStatus.IN_PROGRESS,
            path
        })

        this.convertImage({
            path,
            originalName: data.originalName,
            fileId: file.id
        })

        return file
    }

    async findOne(id: string) {
        const file = await this.fileRepository.findOne({
            where: {
                id
            }
        })
        if (!file) {
            throw new GrpcNotFoundException('Файл не найден')
        }
        return file
    }

    async createImage(data: CreateFileDto) {
        const file = this.fileRepository.create(data)
        return this.fileRepository.save(file)
    }

    async updateImage(id: string, data: UpdateFileDto) {
        await this.fileRepository.update(id, data)
        return this.findOne(id)
    }

    async convertImage(data: IConvertImage) {
        await this.fileProcessQueue.add('convert-image', data).then()
    }
}
