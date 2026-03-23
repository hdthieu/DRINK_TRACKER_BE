import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
    private otps = new Map<string, { code: string; expiry: number; name?: string }>();

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private mailerService: MailerService,
    ) { }


    async login(email: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException({
                message: 'Rất tiếc, Email này chưa được đăng ký! Princess hãy ghi danh trước nhé 🌸',
                errorCode: 'EMAIL_NOT_FOUND',
            });
        }
        return this.generateTokensResponse(user);
    }

    async requestRegister(email: string, name: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
            throw new BadRequestException({
                message: 'Chào mừng trở về! Email này đã có tài khoản rồi 🏹',
                errorCode: 'EMAIL_ALREADY_EXISTS',
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + 5 * 60 * 1000;
        this.otps.set(email, { code: otp, expiry, name });

        return this.sendOtpEmail(email, otp);
    }

    private async sendOtpEmail(email: string, otp: string) {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Mã xác thực Drink Tracker của bạn',
                template: './otp',
                context: { otp },
            });
            return { message: 'Mã OTP đã được gửi về Gmail của bạn 🌸' };
        } catch (error) {
            return {
                message: 'Chế độ DEV: Mail lỗi (' + (error.message || 'Unknown') + ')',
                devOtp: otp
            };
        }
    }

    async verifyOtp(email: string, code: string) {
        const saved = this.otps.get(email);

        if (!saved || saved.code !== code || Date.now() > saved.expiry) {
            throw new UnauthorizedException({
                message: 'Mã OTP không chính xác hoặc đã hết hạn 🛡️',
                errorCode: 'INVALID_OR_EXPIRED_OTP',
            });
        }

        let user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            user = this.userRepository.create({
                email,
                name: saved.name || email.split('@')[0],
            });
            await this.userRepository.save(user);
        }

        this.otps.delete(email);
        return this.generateTokensResponse(user);
    }

    private async generateTokensResponse(user: User) {
        const payload = { sub: user.id, email: user.email };
        const tokens = {
            access_token: await this.jwtService.signAsync(payload, { expiresIn: '15m' }),
            refresh_token: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
        };

        user.refreshToken = tokens.refresh_token;
        await this.userRepository.save(user);

        return {
            message: 'Đăng nhập thành công 🌸',
            data: {
                ...tokens,
                user: { id: user.id, email: user.email, name: user.name }
            }
        };
    }

    async refresh(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const user = await this.userRepository.findOne({ where: { id: payload.sub } });

            if (!user || user.refreshToken !== refreshToken) {
                throw new UnauthorizedException({
                    message: 'Phiên làm việc không hợp lệ 🛡️',
                    errorCode: 'INVALID_REFRESH_TOKEN',
                });
            }

            return this.generateTokensResponse(user);
        } catch (e) {
            throw new UnauthorizedException({
                message: 'Phiên làm việc hết hạn 🏹',
                errorCode: 'INVALID_REFRESH_TOKEN',
            });
        }
    }
}
