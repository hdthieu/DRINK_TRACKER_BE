import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DrinklogService } from './drinklog.service';
import { CreateDrinklogDto } from './dto/create-drinklog.dto';
import { UpdateDrinklogDto } from './dto/update-drinklog.dto';

@Controller('drinklog')
export class DrinklogController {
  constructor(private readonly drinklogService: DrinklogService) {}

  @Post()
  create(@Body() createDrinklogDto: CreateDrinklogDto) {
    return this.drinklogService.create(createDrinklogDto);
  }

  @Get()
  findAll() {
    return this.drinklogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.drinklogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDrinklogDto: UpdateDrinklogDto) {
    return this.drinklogService.update(+id, updateDrinklogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.drinklogService.remove(+id);
  }
}
