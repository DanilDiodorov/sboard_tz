import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ImageProcessService } from './image-process.service'
import { FileInterceptor } from '@nestjs/platform-express'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUserId } from '../auth/decorators/user.decorator'

@Controller('image-process')
export class ImageProcessController {
    constructor(private readonly imageProcessService: ImageProcessService) {}

    @Auth()
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(
        @CurrentUserId() userId: string,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.imageProcessService.uploadFile(userId, file)
    }
}
