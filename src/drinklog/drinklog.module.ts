import { Module } from '@nestjs/common';
import { DrinklogService } from './drinklog.service';
import { DrinklogController } from './drinklog.controller';

@Module({
  controllers: [DrinklogController],
  providers: [DrinklogService],
})
export class DrinklogModule {}
