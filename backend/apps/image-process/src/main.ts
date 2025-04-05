import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { join } from 'path'
import { ImageProcessModule } from './image-process.module'
import { IMAGE_PACKAGE_NAME } from '@app/common/types/image'

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        ImageProcessModule,
        {
            transport: Transport.GRPC,
            options: {
                url: 'localhost:3002',
                protoPath: join(__dirname, '../image.proto'),
                package: IMAGE_PACKAGE_NAME
            }
        }
    )
    await app.listen()
}
bootstrap()
