import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoadmapService } from './roadmap.service';
import { RoadmapController } from './roadmap.controller';
import { UserRoadmap } from './entities/roadmap.entity';
import { User } from '../user/entities/user.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';
import { FoodInventory } from '../food-inventory/entities/food-inventory.entity';
import { MealIngredient } from '../meal-plan/entities/meal-ingredient.entity';
import { DrinklogModule } from 'src/drinklog/drinklog.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRoadmap, User, MealPlan, FoodInventory, MealIngredient]),
        DrinklogModule
    ],
    controllers: [RoadmapController],
    providers: [RoadmapService],
    exports: [RoadmapService],
})
export class RoadmapModule { }
