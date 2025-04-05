import {
    FileMetadata,
    IMAGE_PROCESS_SERVICE_NAME,
    ImageProcessServiceClient,
    UploadFileRequest
} from '@app/common/types/image'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'
import { ClientGrpc } from '@nestjs/microservices'
import { ReplaySubject } from 'rxjs'

const CHUNK_SIZE = 1024 * 1024 // 1MB

@Injectable()
export class ImageProcessService implements OnModuleInit {
    private imageProcessServiceClient: ImageProcessServiceClient

    constructor(
        @Inject(IMAGE_PROCESS_SERVICE_NAME) private client: ClientGrpc
    ) {}

    onModuleInit() {
        this.imageProcessServiceClient =
            this.client.getService<ImageProcessServiceClient>(
                IMAGE_PROCESS_SERVICE_NAME
            )
    }

    uploadFile(userId: string, file: Express.Multer.File) {
        const fileUploadRequest = new ReplaySubject<UploadFileRequest>()

        const metadata: FileMetadata = {
            filename: file.originalname,
            userId: userId
        }

        // Сначала отправим метаданные
        fileUploadRequest.next({ metadata })

        const buffer = file.buffer
        const totalChunks = Math.ceil(buffer.length / CHUNK_SIZE)

        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE
            const end = Math.min(start + CHUNK_SIZE, buffer.length)
            const chunk = buffer.subarray(start, end)

            fileUploadRequest.next({ chunk })
        }

        fileUploadRequest.complete()

        return this.imageProcessServiceClient.uploadFile(fileUploadRequest)
    }
}
