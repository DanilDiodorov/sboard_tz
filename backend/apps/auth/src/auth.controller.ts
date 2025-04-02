import { Controller } from '@nestjs/common'
import {
    AuthDto,
    AuthServiceController,
    AuthServiceControllerMethods,
    GetNewTokensRequest,
    ProfileReguest
} from '@app/common'
import { AuthService } from './auth.service'
import { UsersService } from './users/users.service'

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) {}

    register(dto: AuthDto) {
        return this.authService.register(dto)
    }

    login(dto: AuthDto) {
        return this.authService.login(dto)
    }

    profile(dto: ProfileReguest) {
        return this.usersService.findOne(dto.id)
    }

    getNewTokens(dto: GetNewTokensRequest) {
        return this.authService.getNewTokens(dto.refreshToken)
    }
}
