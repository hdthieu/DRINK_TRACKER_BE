import { PartialType } from '@nestjs/mapped-types';
import { CreateDrinklogDto } from './create-drinklog.dto';

export class UpdateDrinklogDto extends PartialType(CreateDrinklogDto) {}
