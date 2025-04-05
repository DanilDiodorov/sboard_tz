import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { AuthDto } from '@app/common/types/auth'
import { GrpcAlreadyExistsException } from 'nestjs-grpc-exceptions'

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async create(createUserDto: AuthDto) {
        const findUser = await this.findByEmail(createUserDto.email)

        if (findUser) {
            throw new GrpcAlreadyExistsException('Пользователь уже существует')
        }

        const user = this.userRepository.create(createUserDto)

        return this.userRepository.save(user)
    }

    async findByEmail(email: string) {
        return this.userRepository.findOne({
            where: {
                email: email
            }
        })
    }

    findOne(id: string) {
        return this.userRepository.findOne({
            where: {
                id
            }
        })
    }
}
