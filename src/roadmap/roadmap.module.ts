import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoadmapService } from './roadmap.service';
import { RoadmapController } from './roadmap.controller';
import { UserRoadmap } from './entities/roadmap.entity';
import { User } from '../user/entities/user.entity';
import { MealPlan } from '../meal-plan/entities/meal-plan.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserRoadmap, User, MealPlan]),
    ],
    controllers: [RoadmapController],
    providers: [RoadmapService],
    exports: [RoadmapService],
})
export class RoadmapModule { }
