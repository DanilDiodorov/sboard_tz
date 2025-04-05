import { Observable, Subject } from 'rxjs'
import {
    FileMetadata,
    ImageProcessServiceController,
    ImageProcessServiceControllerMethods,
    UploadFileRequest,
    UploadFileResponse
} from '@app/common/types/image'
import { GrpcStreamMethod } from '@nestjs/microservices'
import { FileService } from './file/file.service'

@ImageProcessServiceControllerMethods()
export class ImageProcessController implements ImageProcessServiceController {
    constructor(private readonly fileService: FileService) {}

    @GrpcStreamMethod()
    uploadFile(
        request: Observable<UploadFileRequest>
    ): Observable<UploadFileResponse> {
        const subject = new Subject<UploadFileResponse>()
        const chunks: Buffer[] = []
        let metadata: FileMetadata | null = null

        const onNext = (data: UploadFileRequest) => {
            if (data.metadata) {
                metadata = data.metadata
            }

            if (data.chunk) {
                chunks.push(Buffer.from(data.chunk))
            }
        }

        const onComplete = async () => {
            try {
                if (!metadata) {
                    throw new Error('Metadata not provided')
                }

                const fileBuffer = Buffer.concat(chunks)
                const image = await this.fileService.saveImage({
                    buffer: fileBuffer,
                    originalName: metadata.filename,
                    userId: metadata.userId
                })

                subject.next(image)
                subject.complete()
            } catch (err) {
                console.error('Error during file upload:', err)
                subject.error(err)
            }
        }

        request.subscribe({
            next: onNext,
            complete: onComplete,
            error: (err) => {
                console.error('Stream error:', err)
                subject.error(err)
            }
        })

        return subject.asObservable()
    }
}
