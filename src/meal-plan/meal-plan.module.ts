import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MealPlan } from './entities/meal-plan.entity';
import { MealIngredient } from './entities/meal-ingredient.entity';
import { MealPlanService } from './meal-plan.service';
import { MealPlanController } from './meal-plan.controller';
import { FoodInventory } from 'src/food-inventory/entities/food-inventory.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MealPlan, MealIngredient, FoodInventory])],
    controllers: [MealPlanController],
    providers: [MealPlanService],
    exports: [MealPlanService],
})
export class MealPlanModule { }
