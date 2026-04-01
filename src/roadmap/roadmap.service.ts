import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRoadmap } from './entities/roadmap.entity';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import { UpdateRoadmapDto } from './dto/update-roadmap.dto';
import { User } from '../user/entities/user.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';
import { ActivityType } from 'src/common/enums';
import { DrinklogService } from 'src/drinklog/drinklog.service';
import { FoodInventory } from '../food-inventory/entities/food-inventory.entity';
import { MealIngredient } from '../meal-plan/entities/meal-ingredient.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RoadmapService {
    constructor(
        @InjectRepository(UserRoadmap)
        private readonly roadmapRepository: Repository<UserRoadmap>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(MealPlan)
        private readonly mealPlanRepository: Repository<MealPlan>,
        @InjectRepository(FoodInventory)
        private readonly foodInventoryRepository: Repository<FoodInventory>,

        private readonly drinklogService: DrinklogService,
        private readonly notificationsService: NotificationsService,
    ) { }

    async create(userId: string, createRoadmapDto: CreateRoadmapDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User không tồn tại!');

        let mealPlan: MealPlan | null = null;
        if (createRoadmapDto.mealPlanId) {
            mealPlan = await this.mealPlanRepository.findOne({ where: { id: createRoadmapDto.mealPlanId } });
            if (!mealPlan) throw new BadRequestException('ID thực đơn không hợp lệ!');
        }

        const roadmap = this.roadmapRepository.create({
            ...createRoadmapDto,
            user,
            mealPlan: mealPlan || undefined,
        });

        return await this.roadmapRepository.save(roadmap);
    }

    async findByDate(userId: string, date: string) {
        return await this.roadmapRepository.find({
            where: { user: { id: userId }, date },
            order: { time: 'ASC' },
            relations: ['mealPlan', 'mealPlan.ingredients', 'mealPlan.ingredients.inventoryItem']
        });
    }

    async update(userId: string, id: string, updateRoadmapDto: UpdateRoadmapDto) {
        const queryRunner = this.roadmapRepository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const roadmap = await queryRunner.manager.findOne(UserRoadmap, {
                where: { id, user: { id: userId } },
                relations: ['mealPlan', 'mealPlan.ingredients', 'mealPlan.ingredients.inventoryItem']
            });

            if (!roadmap) throw new NotFoundException('Lộ trình không tồn tại!');

            const wasCompleted = roadmap.isCompleted;
            const isNowCompleted = updateRoadmapDto.isCompleted ?? wasCompleted;

            // --- GIAI ĐOẠN 2: Logic Tự động ---
            if (!wasCompleted && isNowCompleted) {
                // Case 1: Bữa ăn (Deduct stock)
                if (roadmap.activityType === ActivityType.MEAL && roadmap.mealPlan) {
                    const ingredients = roadmap.mealPlan.ingredients;
                    if (ingredients && ingredients.length > 0) {
                        for (const ingredient of ingredients) {
                            if (ingredient.inventoryItem) {
                                const item = ingredient.inventoryItem;
                                const needed = ingredient.amountInBaseUnit;
                                item.quantityInBaseUnit = Math.max(0, item.quantityInBaseUnit - needed);
                                await queryRunner.manager.save(FoodInventory, item);

                                // Check if this specific item is now low
                                if (item.quantityInBaseUnit === 0 || (item.lowStockThreshold && item.quantityInBaseUnit <= item.lowStockThreshold)) {
                                    // Trigger push notification (async)
                                    this.notificationsService.sendLowStockAlert(userId, 1).catch(e => console.error("Error sending push:", e));
                                }
                            }
                        }
                    }
                }

                // Case 2: Uống nước (Auto record DrinkLog)
                if (roadmap.activityType === ActivityType.WATER) {
                    const ml = this.parseVolume(roadmap.activityName) || 250;
                    await this.drinklogService.create(userId, {
                        drinkName: 'Nước lọc (Từ lộ trình)',
                        volumeMl: ml,
                        caffeineMg: 0,
                        sugarG: 0,
                        calories: 0,
                        price: 0,
                        isHomeMade: true
                    });
                }
            }

            if (updateRoadmapDto.mealPlanId) {
                const mealPlan = await queryRunner.manager.findOne(MealPlan, { where: { id: updateRoadmapDto.mealPlanId } });
                if (!mealPlan) throw new BadRequestException('ID thực đơn không hợp lệ!');
                roadmap.mealPlan = mealPlan;
            }

            Object.assign(roadmap, updateRoadmapDto);
            const saved = await queryRunner.manager.save(UserRoadmap, roadmap);

            await queryRunner.commitTransaction();
            return saved;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    private parseVolume(text: string): number | null {
        const match = text.match(/(\d+)\s*(ml|l)/i);
        if (match) {
            let val = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            if (unit === 'l') val *= 1000;
            return val;
        }
        return null;
    }

    async remove(userId: string, id: string) {
        const roadmap = await this.roadmapRepository.findOne({ where: { id, user: { id: userId } } });
        if (!roadmap) throw new NotFoundException('Lộ trình không tồn tại!');
        await this.roadmapRepository.remove(roadmap);
        return { message: 'Đã xóa lộ trình thành công' };
    }

    // Seed data Hí's FAT BURNING ROUTINE
    async seedTemplate(userId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('User không tồn tại!');

        const today = new Date().toISOString().split('T')[0];
        const templates = [
            { time: '07:00', activityName: 'Tan làm - Uống 500ml nước lọc', activityType: ActivityType.WATER },
            { time: '08:30', activityName: 'Bữa sáng: 2 trứng + 1 ngô', activityType: ActivityType.MEAL },
            { time: '09:00', activityName: 'Sinh hoạt tự do', activityType: ActivityType.GENERAL },
            { time: '13:00', activityName: 'Tập HIIT & Giãn cơ (Đốt mỡ)', activityType: ActivityType.EXERCISE },
            { time: '13:45', activityName: 'Tắm nước ấm', activityType: ActivityType.GENERAL },
            { time: '14:00', activityName: 'Ngủ thật sâu 💤', activityType: ActivityType.GENERAL },
            { time: '21:00', activityName: 'Dậy - Vệ sinh cá nhân', activityType: ActivityType.GENERAL },
            { time: '21:10', activityName: 'Bữa tối nhẹ: Sữa chua + táo', activityType: ActivityType.MEAL },
            { time: '21:30', activityName: 'Xuất phát đi làm', activityType: ActivityType.GENERAL }
        ];

        const results: UserRoadmap[] = [];
        for (const t of templates) {
            const roadmap = this.roadmapRepository.create({
                ...t,
                date: today,
                user: user
            });
            results.push(await this.roadmapRepository.save(roadmap));
        }

        return {
            success: true,
            message: 'Đã nạp lộ trình mẫu thành công',
            userId: user.id
        };
    }
}
