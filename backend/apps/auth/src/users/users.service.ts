import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { AuthDto } from '@app/common'
import { RpcException } from '@nestjs/microservices'

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ) {}

    async create(createUserDto: AuthDto) {
        const findUser = await this.findByEmail(createUserDto.email)

        if (findUser) {
            throw new RpcException('Пользователь с таким E-mail уже существует')
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
