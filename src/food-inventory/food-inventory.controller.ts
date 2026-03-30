import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { FoodInventoryService } from './food-inventory.service';
import { CreateFoodInventoryDto } from './dto/create-food-inventory.dto';
import { UpdateFoodInventoryDto } from './dto/update-food-inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('food-inventory')
@UseGuards(JwtAuthGuard)
export class FoodInventoryController {
    constructor(private readonly foodInventoryService: FoodInventoryService) { }

    @Post()
    create(@Request() req, @Body() createDto: CreateFoodInventoryDto) {
        return this.foodInventoryService.create(req.user.sub, createDto);
    }

    @Get()
    findAll(@Request() req) {
        return this.foodInventoryService.findAll(req.user.sub);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.foodInventoryService.findOne(id, req.user.sub);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Request() req, @Body() updateDto: UpdateFoodInventoryDto) {
        return this.foodInventoryService.update(id, req.user.sub, updateDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.foodInventoryService.remove(id, req.user.sub);
    }
}
