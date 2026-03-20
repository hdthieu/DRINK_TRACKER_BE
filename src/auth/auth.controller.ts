import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-otp.dto';


@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('request')
    async requestOtp(@Body() dto: RequestOtpDto) {
        return this.authService.requestOtp(dto.email);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.verifyOtp(dto.email, dto.otp);
    }

    @Post('verify')
    async verifyOtp(@Body() dto: LoginDto) {
        return this.authService.verifyOtp(dto.email, dto.otp);
    }

    @Post('refresh')
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto.refresh_token);
    }
}

