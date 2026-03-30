import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { MealIngredient } from './entities/meal-ingredient.entity';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { FoodInventory } from 'src/food-inventory/entities/food-inventory.entity';

@Injectable()
export class MealPlanService {
    constructor(
        @InjectRepository(MealPlan)
        private readonly repository: Repository<MealPlan>,
        @InjectRepository(MealIngredient)
        private readonly ingredientRepository: Repository<MealIngredient>,
        @InjectRepository(FoodInventory)
        private readonly inventoryRepository: Repository<FoodInventory>,

        private dataSource: DataSource,
    ) { }

    async create(userId: string, dto: CreateMealPlanDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const plan = this.repository.create({
                dayOfWeek: dto.dayOfWeek,
                mealType: dto.mealType,
                mealName: dto.mealName,
                description: dto.description,
                user: { id: userId }
            });
            const savedPlan = await queryRunner.manager.save(plan);

            for (const ingDto of dto.ingredients) {
                const invItem = await queryRunner.manager.findOne(FoodInventory, { where: { id: ingDto.inventoryItemId } });
                if (!invItem) throw new NotFoundException(`Food ID ${ingDto.inventoryItemId} không tồn tại!`);

                const ing = this.ingredientRepository.create({
                    mealPlan: savedPlan,
                    inventoryItem: invItem,
                    amountInBaseUnit: ingDto.amountInBaseUnit,
                    unitSymbol: ingDto.unitSymbol
                });
                await queryRunner.manager.save(ing);
            }

            await queryRunner.commitTransaction();
            return this.findOne(savedPlan.id, userId);
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(userId: string) {
        return await this.repository.find({
            where: { user: { id: userId } },
            relations: ['ingredients', 'ingredients.inventoryItem'],
            order: { dayOfWeek: 'ASC', mealType: 'ASC' }
        });
    }

    async findOne(id: string, userId: string) {
        const plan = await this.repository.findOne({
            where: { id, user: { id: userId } },
            relations: ['ingredients', 'ingredients.inventoryItem']
        });
        if (!plan) throw new NotFoundException('Thực đơn không tồn tại!');
        return plan;
    }

    async remove(id: string, userId: string) {
        const plan = await this.findOne(id, userId);
        await this.ingredientRepository.delete({ mealPlan: { id: plan.id } });
        await this.repository.remove(plan);
        return { message: 'Đã xóa thực đơn thành công' };
    }
}
