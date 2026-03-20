import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DrinkTypeService } from './drink-type.service';
import { CreateDrinkTypeDto } from './dto/create-drink-type.dto';
import { UpdateDrinkTypeDto } from './dto/update-drink-type.dto';

@Controller('drink-type')
export class DrinkTypeController {
  constructor(private readonly drinkTypeService: DrinkTypeService) {}

  @Post()
  create(@Body() createDrinkTypeDto: CreateDrinkTypeDto) {
    return this.drinkTypeService.create(createDrinkTypeDto);
  }

  @Get()
  findAll() {
    return this.drinkTypeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drinkTypeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDrinkTypeDto: UpdateDrinkTypeDto) {
    return this.drinkTypeService.update(+id, updateDrinkTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drinkTypeService.remove(+id);
  }
}
