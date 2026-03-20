import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
    private otps = new Map<string, { code: string; expiry: number }>();

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private mailerService: MailerService,
    ) { }

    async requestOtp(email: string) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

        this.otps.set(email, { code: otp, expiry });

        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Mã xác thực Coffee Diary của bạn 🌸',
                template: './otp',
                context: { otp },
            });
            return { message: 'Mã OTP đã được gửi về Gmail của bạn 🌸' };
        } catch (error) {
            console.error('Mail Error:', error);
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
                message: 'Mã OTP không chính xác hoặc đã hết hạn',
                errorCode: 'INVALID_OR_EXPIRED_OTP',
            });
        }

        this.otps.delete(email);

        let user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            user = this.userRepository.create({ email, name: email.split('@')[0] });
            await this.userRepository.save(user);
        }

        const payload = { sub: user.id, email: email };
        const tokens = {
            access_token: await this.jwtService.signAsync(payload, { expiresIn: '15m' }),
            refresh_token: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
        };

        // Lưu refresh token vào DB để đối soát (Bảo mật Princess)
        user.refreshToken = tokens.refresh_token;
        await this.userRepository.save(user);

        return {
            message: 'Đăng nhập thành công',
            ...tokens,
        };
    }

    async refresh(refreshToken: string) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken);
            const user = await this.userRepository.findOne({ where: { id: payload.sub } });

            // Đối soát then chốt: Token gửi lên phải giống Token trong DB
            if (!user || user.refreshToken !== refreshToken) {
                throw new UnauthorizedException({
                    message: 'Phiên làm việc không hợp lệ hoặc đã bị vô hiệu hóa 🌸',
                    errorCode: 'INVALID_REFRESH_TOKEN',
                });
            }

            const newPayload = { sub: user.id, email: user.email };
            const tokens = {
                access_token: await this.jwtService.signAsync(newPayload, { expiresIn: '15m' }),
                refresh_token: await this.jwtService.signAsync(newPayload, { expiresIn: '7d' }),
            };

            // Cập nhật lại refresh token mới (Rotation Token)
            user.refreshToken = tokens.refresh_token;
            await this.userRepository.save(user);

            return {
                message: 'Làm mới Token thành công 🌸',
                ...tokens,
            };
        } catch (e) {
            throw new UnauthorizedException({
                message: 'Phiên làm việc hết hạn, vui lòng đăng nhập lại 🌸',
                errorCode: 'INVALID_REFRESH_TOKEN',
            });
        }
    }

}
