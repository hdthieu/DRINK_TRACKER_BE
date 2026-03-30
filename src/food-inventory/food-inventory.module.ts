import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodInventory } from './entities/food-inventory.entity';
import { FoodInventoryService } from './food-inventory.service';
import { FoodInventoryController } from './food-inventory.controller';

@Module({
    imports: [TypeOrmModule.forFeature([FoodInventory])],
    controllers: [FoodInventoryController],
    providers: [FoodInventoryService],
    exports: [FoodInventoryService],
})
export class FoodInventoryModule { }
