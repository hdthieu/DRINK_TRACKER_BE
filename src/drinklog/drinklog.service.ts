import { Injectable } from '@nestjs/common';
import { CreateDrinklogDto } from './dto/create-drinklog.dto';
import { UpdateDrinklogDto } from './dto/update-drinklog.dto';

@Injectable()
export class DrinklogService {
  create(createDrinklogDto: CreateDrinklogDto) {
    return 'This action adds a new drinklog';
  }

  findAll() {
    return `This action returns all drinklog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} drinklog`;
  }

  update(id: number, updateDrinklogDto: UpdateDrinklogDto) {
    return `This action updates a #${id} drinklog`;
  }

  remove(id: number) {
    return `This action removes a #${id} drinklog`;
  }
}
