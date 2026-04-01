import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
    constructor(private readonly service: NotificationsService) { }

    @Post('subscribe')
    subscribe(@Request() req, @Body() subscription: any) {
        const userAgent = req.headers['user-agent'];
        return this.service.subscribe(req.user.sub, subscription, userAgent);
    }

    @Post('test')
    test(@Request() req) {
        return this.service.sendNotification(
            req.user.sub,
            '🦄 Princess ơi!',
            'Thông báo này hiện ra là mọi thứ đã sẵn sàng cho hành trình mới rồi ạ! ✨'
        );
    }
}
