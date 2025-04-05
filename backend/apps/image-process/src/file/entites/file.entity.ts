import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn
} from 'typeorm'

export enum FileProcessStatus {
    IN_PROGRESS = 'IN_PROGRESS',
    FAILED = 'FAILED',
    DONE = 'DONE'
}

@Entity({ name: 'files' })
export class File {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({ name: 'original_name' })
    originalName: string

    @Column({ unique: true })
    path: string

    @Column({ name: 'user_id' })
    userId: string

    @Column({
        type: 'enum',
        enum: FileProcessStatus,
        default: FileProcessStatus.IN_PROGRESS
    })
    status: FileProcessStatus

    @CreateDateColumn({ name: 'created_at' })
    createdAt: string
}
