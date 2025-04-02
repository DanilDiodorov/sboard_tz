import { Controller } from '@nestjs/common'
import {
    AuthDto,
    AuthServiceController,
    AuthServiceControllerMethods
} from '@app/common'
import { AuthService } from './auth.service'

@Controller()
@AuthServiceControllerMethods()
export class AuthController implements AuthServiceController {
    constructor(private readonly authService: AuthService) {}

    register(authDto: AuthDto) {
        return this.authService.register(authDto)
    }

    login(authDto: AuthDto) {
        return this.authService.login(authDto)
    }
}
