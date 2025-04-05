import { Module } from '@nestjs/common'
import { ImageProcessService } from './image-process.service'
import { ImageProcessController } from './image-process.controller'
import { ClientsModule, Transport } from '@nestjs/microservices'
import {
    IMAGE_PACKAGE_NAME,
    IMAGE_PROCESS_SERVICE_NAME
} from '@app/common/types/image'
import { join } from 'path'

@Module({
    imports: [
        ClientsModule.register([
            {
                name: IMAGE_PROCESS_SERVICE_NAME,
                transport: Transport.GRPC,
                options: {
                    url: 'localhost:3002',
                    package: IMAGE_PACKAGE_NAME,
                    protoPath: join(__dirname, '../image.proto')
                }
            }
        ])
    ],
    controllers: [ImageProcessController],
    providers: [ImageProcessService]
})
export class ImageProcessModule {}
