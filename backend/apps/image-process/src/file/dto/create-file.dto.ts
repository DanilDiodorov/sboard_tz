import { IsEnum, IsString, IsUUID } from 'class-validator'
import { FileProcessStatus } from '../entites/file.entity'

export class CreateFileDto {
    @IsString()
    originalName: string

    @IsString()
    @IsUUID()
    userId: string

    @IsString()
    path: string

    @IsEnum({ type: FileProcessStatus })
    status: FileProcessStatus
}
