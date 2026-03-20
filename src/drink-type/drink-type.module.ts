import { Module } from '@nestjs/common';
import { DrinkTypeService } from './drink-type.service';
import { DrinkTypeController } from './drink-type.controller';

@Module({
  controllers: [DrinkTypeController],
  providers: [DrinkTypeService],
})
export class DrinkTypeModule {}
