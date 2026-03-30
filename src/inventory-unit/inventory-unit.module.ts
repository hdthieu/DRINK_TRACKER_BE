import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryUnit } from './entities/inventory-unit.entity';
import { InventoryUnitService } from './inventory-unit.service';
import { InventoryUnitController } from './inventory-unit.controller';

@Module({
    imports: [TypeOrmModule.forFeature([InventoryUnit])],
    providers: [InventoryUnitService],
    controllers: [InventoryUnitController],
    exports: [InventoryUnitService]
})
export class InventoryUnitModule { }
