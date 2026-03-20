import { PartialType } from '@nestjs/mapped-types';
import { CreateDrinkTypeDto } from './create-drink-type.dto';

export class UpdateDrinkTypeDto extends PartialType(CreateDrinkTypeDto) {}
