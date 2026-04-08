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
import { UserRoadmap } from '../roadmap/entities/roadmap.entity';
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
        @InjectRepository(UserRoadmap)
        private readonly roadmapRepo: Repository<UserRoadmap>,
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
        // Find existing subscription for this user. 
        // We fetch all and find in memory to be 100% sure about the endpoint match 🕵️‍♀️
        const allSubs = await this.subscriptionRepo.find({
            where: { user: { id: userId } }
        });

        const existing = allSubs.find(s => s.subscription?.endpoint === subscription.endpoint);
        if (existing) return existing;

        const newSub = this.subscriptionRepo.create({
            user: { id: userId },
            subscription,
            userAgent,
        });
        return await this.subscriptionRepo.save(newSub);
    }

    async sendNotification(userId: string, title: string, body: string, icon = 'https://cdn-icons-png.flaticon.com/512/3256/3256157.png') {
        const allSubs = await this.subscriptionRepo.find({
            where: { user: { id: userId } },
            order: { createdAt: 'DESC' }
        });

        // Deduplicate by endpoint to avoid spamming the same device
        const uniqueEndpoints = new Set();
        const subs = allSubs.filter(sub => {
            const endpoint = sub.subscription?.endpoint;
            if (!endpoint || uniqueEndpoints.has(endpoint)) return false;
            uniqueEndpoints.add(endpoint);
            return true;
        });

        this.logger.log(`Filtered to ${subs.length} unique push subscriptions for user ${userId} (from ${allSubs.length} total)`);
        const payload = JSON.stringify({
            title,
            body,
            icon,
            badge: icon,
            timestamp: Date.now()
        });

        const promises = subs.map((sub) =>
            webpush.sendNotification(sub.subscription, payload, {
                TTL: 60 * 60 * 24,
                urgency: 'high'
            }).catch((err) => {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    this.logger.log(`Subscription expired, removing...`);
                    return this.subscriptionRepo.remove(sub);
                }
                this.logger.error(`Error sending push:`, err);
            }),
        );

        await Promise.all(promises);
        return subs.length;
    }

    async sendLowStockAlert(userId: string, itemName: string) {
        return this.sendNotification(
            userId,
            '🚨 Kho lương thực cần Princess tiếp tế!',
            `Món "${itemName}" vừa rơi vào vùng báo động đỏ rồi ạ. Chị xem lại kho nhé! 🛍️✨`,
        );
    }

    // --- AUTOMATED DAILY AUDIT ---
    // This runs every day at 06:00 AM
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

        // --- High Vigilance Mode: Always check and alert if items are low 🤴✨ ---
        // We've removed the daily limit so Princess gets instant feedback during meals
        // AND a fresh reminder every morning at 6 AM if still not replenished.

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
    // This runs every minute to be perfectly obedient to Princess's settings 🚀
    @Cron('* * * * *')
    async handleWaterReminders() {
        this.logger.log('Starting Automated Hydration Check (Obedient Minute Mode)...');
        const users = await this.userRepo.find({
            where: { isWaterReminderEnabled: true }
        });

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinutes;

        for (const user of users) {
            try {
                // 1. Check Daily Goal first - if she's already a star, don't ping her! 👑🥂
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

                if (totalDrunk >= goal) {
                    // Celebrate if not already celebrated today 🥂
                    const lastReminder = user.lastWaterReminderAt ? new Date(user.lastWaterReminderAt) : null;
                    const wasAlreadyCelebrated = lastReminder && lastReminder.toDateString() === now.toDateString() && user.lastWaterReminderAt.getHours() >= 21; // Simple flag

                    if (!wasAlreadyCelebrated && totalDrunk > 0) {
                        await this.sendNotification(
                            user.id,
                            '👑 Chúc mừng Princess rạng rỡ!',
                            'Tuyệt vời! Chị đã hoàn thành 100% mục tiêu sức khỏe hôm nay rồi ạ! Híu rất tự hào về chị! 🥂🎉💎',
                        );
                        user.lastWaterReminderAt = now; // Mark as done for today
                        await this.userRepo.save(user);
                    }
                    continue; // Stop reminding for today!
                }

                // 2. Check Active Window ☀️🌙
                const [startH, startM] = (user.reminderStartTime || '08:00').split(':').map(Number);
                const [endH, endM] = (user.reminderEndTime || '22:00').split(':').map(Number);
                const startTimeInMinutes = startH * 60 + startM;
                const endTimeInMinutes = endH * 60 + endM;

                if (currentTimeInMinutes < startTimeInMinutes || currentTimeInMinutes >= endTimeInMinutes) {
                    continue;
                }

                // 3. Strict Interval Logic: How long since last Refreshment or last Reminder? ⏳ ✨
                const lastLog = todayLogs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
                const lastLogTime = lastLog ? lastLog.createdAt.getTime() : 0;

                // Only count the reminder if it was sent TODAY ☀️
                const lastReminderDate = user.lastWaterReminderAt ? new Date(user.lastWaterReminderAt) : null;
                const lastReminderTime = (lastReminderDate && lastReminderDate.toDateString() === now.toDateString())
                    ? lastReminderDate.getTime()
                    : 0;

                // Use whichever was more recent to reset the timer 🤵✨
                const lastEventTime = Math.max(lastLogTime, lastReminderTime);
                const minutesSinceLastEvent = lastEventTime > 0 ? (now.getTime() - lastEventTime) / 60000 : 9999;

                const interval = user.reminderInterval || 120;

                // SPECIAL: If it's the start of the day and no drinks/reminders yet, greet immediately! 🌅
                const isFirstGreetingOfToday = totalDrunk === 0 && lastReminderTime === 0;

                if (isFirstGreetingOfToday || minutesSinceLastEvent >= interval) {
                    this.logger.log(`Princess ${user.name} is due! Mode: ${isFirstGreetingOfToday ? 'First Greeting' : 'Periodic'}`);

                    const message = isFirstGreetingOfToday
                        ? `Chào ngày mới lộng lẫy, Princess! Chị hãy khởi đầu ngày mới bằng một ly nước thanh mát để luôn rạng rỡ nhé! ✨🥂💎`
                        : `Princess ơi, đã đến giờ nạp thêm sự rạng rỡ rồi ạ! Chị hãy uống một ly nước để luôn xinh đẹp nhé! ✨�🥂`;

                    const sentCount = await this.sendNotification(user.id, '💎 Lời nhắc từ Quản gia Híu', message);

                    if (sentCount > 0) {
                        user.lastWaterReminderAt = now;
                        await this.userRepo.save(user);
                        this.logger.log(`Sent hydration notification to user ${user.id} (${sentCount} devices)`);
                    } else {
                        this.logger.warn(`Tried to send hydration reminder to user ${user.id} but no active subscriptions found!`);
                    }
                }
            } catch (err) {
                this.logger.error(`Error in obedient water reminder for user ${user.id}:`, err);
            }
        }
    }

    // --- AUTOMATED ROADMAP REMINDERS ---
    @Cron('* * * * *')
    async handleRoadmapReminders() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);

        const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
        const currentDate = now.toISOString().split('T')[0];

        // Find roadmaps for today at this exact time that are NOT completed
        const roadmaps = await this.roadmapRepo.find({
            where: {
                date: currentDate,
                time: currentTime,
                isCompleted: false,
            },
            relations: ['user']
        });

        if (roadmaps.length === 0) return;

        this.logger.log(`Found ${roadmaps.length} roadmap activities to notify for at ${currentTime}`);

        for (const item of roadmaps) {
            if (!item.user) continue;

            const title = `🔔 Ting ting!`;
            const body = `Chị ơi, đến giờ thực hiện: "${item.activityName}" rồi ạ! Princess hãy bắt đầu ngay để luôn xinh đẹp nhé! ✨💎`;

            await this.sendNotification(item.user.id, title, body);
            this.logger.log(`Sent roadmap notification to user ${item.user.id} for task ${item.activityName}`);
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
