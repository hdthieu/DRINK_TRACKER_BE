import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-otp.dto';
import { VerifyDto } from './dto/verify-otp.dto';

interface RequestRegisterDto extends RequestOtpDto {
    name: string;
}

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto.email);
    }

    @Post('request-register')
    async requestRegister(@Body() dto: RequestRegisterDto) {
        return this.authService.requestRegister(dto.email, dto.name);
    }

    @Post('verify')
    async verifyOtp(@Body() dto: VerifyDto) {
        return this.authService.verifyOtp(dto.email, dto.otp);
    }

    @Post('refresh')
    async refresh(@Body() dto: RefreshTokenDto) {
        return this.authService.refresh(dto.refresh_token);
    }
}
