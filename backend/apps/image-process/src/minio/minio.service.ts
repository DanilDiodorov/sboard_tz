import { Injectable } from '@nestjs/common'
import * as Minio from 'minio'
import { minioConfig } from '../config/minio.config'

@Injectable()
export class MinioService {
    private minioClient: Minio.Client
    private readonly bucketName: string = 'uploads'

    constructor() {
        this.minioClient = new Minio.Client({
            endPoint: minioConfig.endPoint,
            port: minioConfig.port,
            useSSL: minioConfig.useSSL,
            accessKey: minioConfig.accessKey,
            secretKey: minioConfig.secretKey
        })

        this.initializeBucket()
    }

    private async initializeBucket() {
        const bucketExists = await this.minioClient.bucketExists(
            this.bucketName
        )
        if (!bucketExists) {
            await this.minioClient.makeBucket(this.bucketName, 'us-east-1')
            const policy = {
                Version: '2025-04-05',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: '*',
                        Action: ['s3:GetObject'],
                        Resource: [`arn:aws:s3:::${this.bucketName}/*`]
                    }
                ]
            }
            await this.minioClient.setBucketPolicy(
                this.bucketName,
                JSON.stringify(policy)
            )
        }
    }

    async uploadFile(buffer: Buffer<ArrayBufferLike>, path: string) {
        return this.minioClient.putObject(this.bucketName, path, buffer)
    }

    async getFileUrl(fileName: string): Promise<string> {
        return await this.minioClient.presignedUrl(
            'GET',
            this.bucketName,
            fileName
        )
    }

    async getFile(filePath: string): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const chunks: Uint8Array[] = []
            const stream = await this.minioClient.getObject(
                this.bucketName,
                filePath
            )

            stream.on('data', (chunk) => {
                chunks.push(chunk)
            })

            stream.on('end', () => {
                resolve(Buffer.concat(chunks))
            })
        })
    }
}
