import { PartialType } from '@nestjs/mapped-types';
import { CreateFoodInventoryDto } from './create-food-inventory.dto';

export class UpdateFoodInventoryDto extends PartialType(CreateFoodInventoryDto) { }
