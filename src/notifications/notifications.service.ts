import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PushSubscription as SubscriptionEntity } from './entities/push-subscription.entity';
import { User } from '../user/entities/user.entity';
import { FoodInventory } from '../food-inventory/entities/food-inventory.entity';
import * as webpush from 'web-push';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Drinklog as DrinkLog } from '../drinklog/entities/drinklog.entity';
import { Between } from 'typeorm';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);

    constructor(
        @InjectRepository(SubscriptionEntity)
        private readonly subscriptionRepo: Repository<SubscriptionEntity>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(FoodInventory)
        private readonly inventoryRepo: Repository<FoodInventory>,
        @InjectRepository(DrinkLog)
        private readonly drinkLogRepo: Repository<DrinkLog>,
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

    async sendNotification(userId: string, title: string, body: string, icon = 'https://cdn-icons-png.flaticon.com/512/3256/3256157.png') {
        const subs = await this.subscriptionRepo.find({ where: { user: { id: userId } } });
        const payload = JSON.stringify({
            title,
            body,
            icon,
            badge: icon,
            timestamp: Date.now()
        });

        const promises = subs.map((sub) =>
            webpush.sendNotification(sub.subscription, payload, {
                TTL: 60 * 60 * 24, // 24 hours
                urgency: 'high'
            }).catch((err) => {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    this.logger.log(`Subscription expired, removing...`);
                    return this.subscriptionRepo.remove(sub);
                }
                this.logger.error(`Error sending push:`, err);
            }),
        );

        return Promise.all(promises);
    }

    async sendLowStockAlert(userId: string, itemName: string) {
        return this.sendNotification(
            userId,
            '🚨 Kho lương thực cần Princess tiếp tế!',
            `Món "${itemName}" vừa rơi vào vùng báo động đỏ rồi ạ. Chị xem lại kho nhé! 🛍️✨`,
        );
    }

    // --- AUTOMATED DAILY AUDIT ---
    // This runs every day at 09:00 AM
    @Cron(CronExpression.EVERY_DAY_AT_6AM)
    async handleMorningAudit() {
        this.logger.log('Starting Morning Inventory Audit for all users...');
        const users = await this.userRepo.find();
        for (const user of users) {
            await this.checkAndSendDailyLowStockAlert(user.id);
        }
    }

    async checkAndSendDailyLowStockAlert(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user || !user.isLowStockAlertEnabled) {
            this.logger.log(`Skipping alert for user ${userId}, feature disabled or user not found.`);
            return;
        }

        // 1. Check if we already sent an alert today
        const today = new Date();
        // Temporary Commented out for Princess to test multiple times today ✨🥂
        /*
        if (user.lastLowStockAlertAt) {
            const lastAlertDate = new Date(user.lastLowStockAlertAt);
            if (
                lastAlertDate.getDate() === today.getDate() &&
                lastAlertDate.getMonth() === today.getMonth() &&
                lastAlertDate.getFullYear() === today.getFullYear()
            ) {
                this.logger.log(`Skipping alert for user ${userId}, already sent today.`);
                return;
            }
        }
        */

        // 2. Scan Inventory for Low Stock items
        const lowStockItems = await this.inventoryRepo.createQueryBuilder('inventory')
            .where('inventory.userId = :userId', { userId })
            .andWhere('(inventory.quantityInBaseUnit <= inventory.lowStockThreshold OR inventory.quantityInBaseUnit = 0)')
            .getMany();

        this.logger.log(`Found ${lowStockItems.length} low stock items for user ${userId}`);

        if (lowStockItems.length === 0) return;

        // 3. Assemble the Elegant Report
        const itemNames = lowStockItems.map(item => item.itemName).join(', ');
        const title = '🛍️ Lời nhắc tiếp tế lương thực';
        const body = `Princess ơi, kho của chị đang thiếu các món: ${itemNames} ạ. Đừng quên mua sắm nhé! ✨🥂💎`;

        try {
            await this.sendNotification(userId, title, body);

            // 4. Update the "Memory"
            user.lastLowStockAlertAt = new Date();
            await this.userRepo.save(user);
            this.logger.log(`Successfully sent daily summary to user ${userId}`);
        } catch (err) {
            this.logger.error(`Failed to send daily summary to user ${userId}`, err);
        }
    }

    // --- AUTOMATED WATER REMINDERS --- ✨🥂
    // This runs every 30 minutes to check if Princess needs to hydrate
    @Cron('0 */30 * * * *')
    async handleWaterReminders() {
        this.logger.log('Starting Automated Hydration Check...');
        const users = await this.userRepo.find({
            where: { isWaterReminderEnabled: true }
        });

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinutes;

        for (const user of users) {
            try {
                // 1. Parse time strings (e.g., '08:00' -> 480 minutes)
                const [startH, startM] = (user.reminderStartTime || '08:00').split(':').map(Number);
                const [endH, endM] = (user.reminderEndTime || '22:00').split(':').map(Number);
                const startTimeInMinutes = startH * 60 + startM;
                const endTimeInMinutes = endH * 60 + endM;

                // 2. Check if we are in the active window
                if (currentTimeInMinutes < startTimeInMinutes || currentTimeInMinutes >= endTimeInMinutes) {
                    continue;
                }

                // 3. Fetch today's logs to calculate progress
                const startOfDay = new Date(now);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(now);
                endOfDay.setHours(23, 59, 59, 999);

                const todayLogs = await this.drinkLogRepo.find({
                    where: {
                        user: { id: user.id },
                        createdAt: Between(startOfDay, endOfDay)
                    }
                });

                const totalDrunk = todayLogs.reduce((sum, log) => sum + log.volumeMl, 0);
                const goal = user.dailyWaterGoal > 0 ? user.dailyWaterGoal : (user.weight * 35);

                // 4. Calculate "Ideal Progress" linearly across the window
                const totalActiveMinutes = endTimeInMinutes - startTimeInMinutes;
                const minutesPassed = currentTimeInMinutes - startTimeInMinutes;
                const expectedIntake = (goal / totalActiveMinutes) * minutesPassed;

                // 5. Send Reminder if behind schedule (and not already drank in 'interval' minutes)
                const lastLog = todayLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
                const minutesSinceLastDrink = lastLog ? (now.getTime() - lastLog.createdAt.getTime()) / 60000 : 999;

                if (totalDrunk < expectedIntake && minutesSinceLastDrink >= (user.reminderInterval || 120)) {
                    const missing = Math.round(expectedIntake - totalDrunk);
                    if (missing > 50) { // Only remind if significantly behind (e.g., > 50ml)
                        await this.sendNotification(
                            user.id,
                            '💎 Thủy hợp lộng lẫy, Princess!',
                            `Princess ơi, Híu thấy chị đang thiếu khoảng ${missing}ml nước so với lộ trình rạng rỡ hôm nay ạ. Chị hãy uống một chút nước nhé! ✨🥂🥂`,
                        );
                        this.logger.log(`Sent water reminder to user ${user.id}`);
                    }
                } else if (totalDrunk >= goal) {
                    // Check if we already congratulated today to avoid spamming
                    const lastAlert = user.lastLowStockAlertAt ? new Date(user.lastLowStockAlertAt) : null;
                    const isAlreadyCongratulated = lastAlert && lastAlert.toDateString() === now.toDateString();

                    if (!isAlreadyCongratulated) {
                        await this.sendNotification(
                            user.id,
                            '👑 Chúc mừng Princess rạng rỡ!',
                            'Tuyệt vời! Chị đã hoàn thành 100% mục tiêu sức khỏe hôm nay rồi ạ! Cùng tận hưởng cảm giác nhẹ nhàng này nhé! 🥂🎉💎',
                        );
                        // Repurpose lastLowStockAlertAt for tracking the daily victory as well
                        user.lastLowStockAlertAt = now;
                        await this.userRepo.save(user);
                        this.logger.log(`Sent victory notification to user ${user.id}`);
                    }
                }
            } catch (err) {
                this.logger.error(`Error in water reminder for user ${user.id}:`, err);
            }
        }
    }

    async getSettings(userId: string) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        return { isLowStockAlertEnabled: user?.isLowStockAlertEnabled || false };
    }

    async updateSettings(userId: string, enabled: boolean) {
        await this.userRepo.update(userId, { isLowStockAlertEnabled: enabled });
        return { success: true, isLowStockAlertEnabled: enabled };
    }
}
