import { Injectable } from '@nestjs/common';
import { CreateDrinkTypeDto } from './dto/create-drink-type.dto';
import { UpdateDrinkTypeDto } from './dto/update-drink-type.dto';

@Injectable()
export class DrinkTypeService {
  create(createDrinkTypeDto: CreateDrinkTypeDto) {
    return 'This action adds a new drinkType';
  }

  findAll() {
    return `This action returns all drinkType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} drinkType`;
  }

  update(id: number, updateDrinkTypeDto: UpdateDrinkTypeDto) {
    return `This action updates a #${id} drinkType`;
  }

  remove(id: number) {
    return `This action removes a #${id} drinkType`;
  }
}
