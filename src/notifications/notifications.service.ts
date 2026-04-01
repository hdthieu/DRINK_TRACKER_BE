import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushSubscription as SubscriptionEntity } from './entities/push-subscription.entity';
import * as webpush from 'web-push';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(SubscriptionEntity)
        private readonly subscriptionRepo: Repository<SubscriptionEntity>,
        private configService: ConfigService,
    ) {
        const publicVapidKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
        const privateVapidKey = this.configService.get<string>('VAPID_PRIVATE_KEY');

        if (publicVapidKey && privateVapidKey) {
            webpush.setVapidDetails(
                'mailto:hdthieu2003@gmail.com',
                publicVapidKey,
                privateVapidKey,
            );
        } else {
            this.logger.warn('VAPID keys not found. Push notifications will not work.');
        }
    }

    async subscribe(userId: string, subscription: any, userAgent: string) {
        // Find existing subscription for this user and endpoint to avoid duplicates
        const existing = await this.subscriptionRepo.findOne({
            where: {
                user: { id: userId },
                subscription: { endpoint: subscription.endpoint } as any
            }
        });

        if (existing) return existing;

        const newSub = this.subscriptionRepo.create({
            user: { id: userId },
            subscription,
            userAgent,
        });
        return await this.subscriptionRepo.save(newSub);
    }

    async sendNotification(userId: string, title: string, body: string, icon = '/icon-192x192.png') {
        const subs = await this.subscriptionRepo.find({ where: { user: { id: userId } } });
        const payload = JSON.stringify({ title, body, icon });

        const promises = subs.map((sub) =>
            webpush.sendNotification(sub.subscription, payload).catch((err) => {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    this.logger.log(`Subscription expired, removing...`);
                    return this.subscriptionRepo.remove(sub);
                }
                this.logger.error(`Error sending push:`, err);
            }),
        );

        return Promise.all(promises);
    }

    async sendLowStockAlert(userId: string, itemCount: number) {
        return this.sendNotification(
            userId,
            '🚨 Kho lương thực sắp hết Princess ơi!',
            `Có ${itemCount} món vừa rơi vào vùng "nguy hiểm". Chị xem lại kho nhé! 🛍️`,
        );
    }
}
