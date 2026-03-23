import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException({
                message: 'Bạn cần đăng nhập để thực hiện thao tác này 🌸',
                errorCode: 'UNAUTHORIZED',
            });
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET || 'SECRET_KEY', // Đảm bảo khớp với AuthModule
            });
            // Gán thông tin người dùng vào request để Controller sử dụng
            request['user'] = payload;
        } catch {
            throw new UnauthorizedException({
                message: 'Phiên đăng nhập hết hạn hoặc không hợp lệ 🏹',
                errorCode: 'INVALID_TOKEN',
            });
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
